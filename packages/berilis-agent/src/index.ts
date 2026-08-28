import "dotenv/config";
import { Events } from "discord.js";
import { initDatabase } from "@kasap/core";
import { loadConfig } from "./config.js";
import { createDiscordClient } from "./discord/client.js";
import { registerMessageHandler } from "./discord/messageHandler.js";

async function main(): Promise<void> {
  const config = loadConfig();
  initDatabase(process.env.CORE_DB_PATH ?? "./data/berilis-agent.sqlite");

  const client = createDiscordClient();
  registerMessageHandler(client, config);

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Berilis Support Agent hazır: ${readyClient.user.tag}`);
  });

  await client.login(config.discordToken);
}

main().catch((error: unknown) => {
  console.error("Berilis Support Agent başlatılamadı:", error);
  process.exit(1);
});
