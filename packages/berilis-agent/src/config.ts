export interface BerilisConfig {
  discordToken: string;
  /** Role that gets pinged on escalation - by convention "Sistem Yöneticisi". */
  adminRoleName: string;
  /** Channel IDs the bot always answers in (e.g. dedicated support/ticket channels). */
  supportChannelIds: string[];
  /** Also answer in any channel whose name starts with this prefix (ticket-bot convention). */
  ticketChannelPrefix: string;
  guildId?: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} .env dosyasında tanımlı değil. .env.example dosyasına bakın.`);
  }
  return value;
}

export function loadConfig(): BerilisConfig {
  return {
    discordToken: requireEnv("DISCORD_TOKEN"),
    adminRoleName: process.env.ADMIN_ROLE_NAME ?? "Sistem Yöneticisi",
    supportChannelIds: (process.env.SUPPORT_CHANNEL_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
    ticketChannelPrefix: process.env.TICKET_CHANNEL_PREFIX ?? "ticket-",
    guildId: process.env.GUILD_ID,
  };
}
