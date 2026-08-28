#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import { initDatabase, logInteraction } from "@kasap/core";
import { TruckersMpClient } from "./client.js";
import { askApiDocs, indexApiDocs } from "./docs/askApiDocs.js";
import { withErrorHandling } from "./utils/cli.js";

initDatabase(process.env.CORE_DB_PATH ?? "./data/truckersmp-sdk.sqlite");

const client = new TruckersMpClient();
const program = new Command();

program
  .name("truckersmp-sdk")
  .description("TruckersMP API SDK - hızlı sorgu ve RAG destekli API dokümantasyonu Q&A")
  .version("0.1.0");

program
  .command("servers")
  .description("Aktif TruckersMP sunucularını listeler")
  .action(
    withErrorHandling(async () => {
      const servers = await client.getServers();
      for (const server of servers) {
        const status = server.online ? "Aktif" : "Kapalı";
        console.log(`[${status}] ${server.name} (${server.game}) - ${server.players}/${server.maxplayers} oyuncu`);
      }
    }),
  );

program
  .command("player <id>")
  .description("SteamID64 veya TruckersMP ID ile oyuncu bilgisi getirir")
  .action(
    withErrorHandling(async (id: string) => {
      const player = await client.getPlayer(id);
      const vtc = player.vtc.inVTC ? `${player.vtc.name} [${player.vtc.tag}]` : "yok";
      console.log(`${player.name} (#${player.id})`);
      console.log(`  VTC: ${vtc}`);
      console.log(`  Banlı: ${player.banned ? "evet" : "hayır"}${player.bansCount ? ` (${player.bansCount} ban)` : ""}`);
    }),
  );

const docs = program.command("docs").description("API dokümantasyonu Q&A (RAG destekli)");

docs
  .command("ask <soru>")
  .description("API hakkında bir soru sor")
  .action(
    withErrorHandling(async (question: string) => {
      const answer = await askApiDocs(question);
      console.log(answer);
      logInteraction({
        project: "truckersmp-sdk",
        question,
        answer,
        category: "api_docs_qa",
      });
    }),
  );

docs
  .command("index")
  .description("Endpoint referansını RAG bilgi tabanına indeksler (RAG_ENABLED=true gerekir)")
  .action(
    withErrorHandling(async () => {
      await indexApiDocs();
      console.log("Endpoint referansı RAG bilgi tabanına indekslendi.");
    }),
  );

await program.parseAsync(process.argv);
