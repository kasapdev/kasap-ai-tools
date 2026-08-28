interface RobotsRule {
  type: "allow" | "disallow";
  pattern: string;
}

interface RobotsGroup {
  userAgents: string[];
  rules: RobotsRule[];
}

/** Small, pragmatic robots.txt parser - handles User-agent groups, Disallow/Allow,
 * and the common `*`/`$` wildcard syntax. Not a full RFC 9309 implementation. */
function parseRobotsTxt(content: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let lastWasUserAgent = false;

  for (const rawLine of content.split(/\r?\n/)) {
    const line = (rawLine.split("#")[0] ?? "").trim();
    if (!line) continue;

    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    if (key === "user-agent") {
      if (!current || !lastWasUserAgent) {
        current = { userAgents: [], rules: [] };
        groups.push(current);
      }
      current.userAgents.push(value.toLowerCase());
      lastWasUserAgent = true;
    } else if ((key === "disallow" || key === "allow") && current) {
      if (value) current.rules.push({ type: key === "allow" ? "allow" : "disallow", pattern: value });
      lastWasUserAgent = false;
    } else {
      lastWasUserAgent = false;
    }
  }

  return groups;
}

function ruleToRegex(pattern: string): RegExp {
  const hasEndAnchor = pattern.endsWith("$");
  const body = hasEndAnchor ? pattern.slice(0, -1) : pattern;
  const escaped = body.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}${hasEndAnchor ? "$" : ""}`);
}

function selectGroup(groups: RobotsGroup[], userAgent: string): RobotsGroup | undefined {
  const ua = userAgent.toLowerCase();
  return groups.find((g) => g.userAgents.includes(ua)) ?? groups.find((g) => g.userAgents.includes("*"));
}

export interface RobotsDecision {
  allowed: boolean;
  matchedRule?: string;
}

/** Longest matching rule wins (per the de-facto robots.txt convention); on a
 * tie, Allow wins over Disallow. No matching rule -> allowed. */
export function isPathAllowed(robotsTxt: string, userAgent: string, path: string): RobotsDecision {
  const group = selectGroup(parseRobotsTxt(robotsTxt), userAgent);
  if (!group) return { allowed: true };

  let best: RobotsRule | undefined;
  for (const rule of group.rules) {
    if (!ruleToRegex(rule.pattern).test(path)) continue;
    if (
      !best ||
      rule.pattern.length > best.pattern.length ||
      (rule.pattern.length === best.pattern.length && rule.type === "allow")
    ) {
      best = rule;
    }
  }

  if (!best) return { allowed: true };
  return {
    allowed: best.type === "allow",
    matchedRule: `${best.type === "allow" ? "Allow" : "Disallow"}: ${best.pattern}`,
  };
}

/** Returns "" when there's genuinely no robots.txt (404 - spec-compliant "no
 * restrictions"), or `null` when it couldn't be fetched/verified at all
 * (network failure, non-404 error status) - callers should fail CLOSED
 * (refuse to scrape) on `null`, not treat it as "allowed". */
export async function fetchRobotsTxt(origin: string): Promise<string | null> {
  try {
    const res = await fetch(`${origin}/robots.txt`);
    if (res.status === 404) return "";
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
