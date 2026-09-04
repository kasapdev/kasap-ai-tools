#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { Command } from "commander";
import { initPromptDb } from "./store/db.js";
import { getLog, getVersionContent, saveVersion } from "./store/promptStore.js";
import { myersDiff } from "./diff/myersDiff.js";
import { formatUnifiedDiff } from "./diff/formatDiff.js";
import { withErrorHandling } from "./utils/cli.js";

initPromptDb(process.env.PROMPT_VC_DB_PATH ?? "./data/prompt-version-control.sqlite");

const program = new Command();

program
  .name("prompt-version-control")
  .description("LLM promptları için yerel, içerik adresli versiyon kontrolü ve diff aracı")
  .version("0.1.0");

program
  .command("save <isim> <dosya>")
  .description("Bir prompt dosyasının yeni bir versiyonunu kaydeder")
  .option("-m, --message <mesaj>", "Versiyon notu")
  .action(
    withErrorHandling(async (name: string, file: string, opts: { message?: string }) => {
      const content = await readFile(file, "utf8");
      const result = saveVersion(name, content, opts.message);
      if (result.created) {
        console.log(`"${name}" için versiyon ${result.version} kaydedildi (hash: ${result.hash.slice(0, 12)}).`);
      } else {
        console.log(
          `İçerik değişmedi, yeni versiyon oluşturulmadı ("${name}" hâlâ versiyon ${result.version}).`,
        );
      }
    }),
  );

program
  .command("log <isim>")
  .description("Bir promptun versiyon geçmişini listeler")
  .action(
    withErrorHandling(async (name: string) => {
      const log = getLog(name);
      if (log.length === 0) {
        console.log(`"${name}" için kayıtlı versiyon yok.`);
        return;
      }
      for (const entry of log) {
        console.log(
          `v${entry.version}  ${entry.hash.slice(0, 12)}  ${entry.createdAt}  ${entry.message ?? "(mesaj yok)"}`,
        );
      }
    }),
  );

program
  .command("diff <isim> [from] [to]")
  .description("İki versiyon arasındaki satır bazlı farkı gösterir (varsayılan: son iki versiyon)")
  .action(
    withErrorHandling(async (name: string, from?: string, to?: string) => {
      const log = getLog(name);
      if (log.length < 2 && !(from && to)) {
        console.log(`"${name}" için karşılaştırılacak en az 2 versiyon yok.`);
        return;
      }

      const toVersion: number | "latest" = to ? Number(to) : "latest";
      const fromVersion: number | "latest" = from
        ? Number(from)
        : (log[1]?.version ?? log[0]!.version);

      const fromRecord = getVersionContent(name, fromVersion);
      const toRecord = getVersionContent(name, toVersion);

      console.log(`--- ${name}@v${fromRecord.version}`);
      console.log(`+++ ${name}@v${toRecord.version}`);
      const ops = myersDiff(fromRecord.content.split("\n"), toRecord.content.split("\n"));
      console.log(formatUnifiedDiff(ops));
    }),
  );

program
  .command("show <isim> <versiyon>")
  .description('Bir versiyonun ham içeriğini yazdırır ("latest" veya bir versiyon numarası)')
  .action(
    withErrorHandling(async (name: string, versionArg: string) => {
      const version = versionArg === "latest" ? "latest" : Number(versionArg);
      const record = getVersionContent(name, version);
      console.log(record.content);
    }),
  );

await program.parseAsync(process.argv);
