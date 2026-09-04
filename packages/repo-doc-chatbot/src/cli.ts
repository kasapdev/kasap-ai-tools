#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import { initDatabase, logInteraction } from "@kasap/core";
import { indexRepoDocs } from "./repo/indexRepo.js";
import { askAboutRepo } from "./repo/askRepo.js";
import { withErrorHandling } from "./utils/cli.js";

initDatabase(process.env.CORE_DB_PATH ?? "./data/repo-doc-chatbot.sqlite");

const program = new Command();

program
  .name("repo-doc-chatbot")
  .description("Herhangi bir yerel git deposunun dokümantasyonu hakkında RAG destekli soru-cevap")
  .version("0.1.0");

program
  .command("index <repoPath>")
  .description("Depodaki dokümanları ve kod yorumlarını RAG bilgi tabanına indeksler (RAG_ENABLED=true gerekir)")
  .action(
    withErrorHandling(async (repoPath: string) => {
      const result = await indexRepoDocs(repoPath);
      console.log(`${result.filesIndexed} dosya, ${result.chunksIndexed} parça indekslendi.`);
    }),
  );

program
  .command("ask <repoPath> <soru>")
  .description("Depo hakkında bir soru sor")
  .action(
    withErrorHandling(async (repoPath: string, question: string) => {
      const { answer, usedRag } = await askAboutRepo(repoPath, question);
      console.log(answer);
      if (!usedRag) {
        console.log("\n(Not: RAG aktif değil, doğrudan dosya alıntılarından cevaplanıyor.)");
      }
      logInteraction({
        project: "repo-doc-chatbot",
        question,
        answer,
        category: "repo_qa",
        metadata: { repoPath, usedRag },
      });
    }),
  );

await program.parseAsync(process.argv);
