#!/usr/bin/env node
import "dotenv/config";
import { Command } from "commander";
import { initDatabase } from "@kasap/core";
import { runGenerate, type GenerateOptions } from "./commands/generate.js";
import { runDesignLevel } from "./commands/designLevel.js";
import { registerEconomyCommand } from "./commands/economy.js";
import { withErrorHandling } from "./utils/cli.js";
import type { Engine } from "./codegen/systemPrompts.js";

initDatabase(process.env.CORE_DB_PATH ?? "./data/roblox-ai.sqlite");

const program = new Command();

program
  .name("roblox-ai")
  .description(
    "Roblox (Luau) ve Godot (GDScript) için AI destekli kod üretimi, seviye tasarımı " +
      "ve ekonomi dengeleme aracı.",
  )
  .version("0.1.0");

program
  .command("generate <description>")
  .description("Verilen özelliği Luau (Roblox) veya GDScript (Godot) koduna dönüştürür")
  .option("-e, --engine <engine>", "roblox | godot", "roblox")
  .option("-o, --output <dir>", "Üretilen kodun yazılacağı klasör")
  .option("-n, --name <name>", "Çıktı dosyasının adı (uzantısız)")
  .action(
    withErrorHandling(
      async (description: string, opts: { engine: string; output?: string; name?: string }) => {
        if (opts.engine !== "roblox" && opts.engine !== "godot") {
          throw new Error(`Geçersiz --engine: "${opts.engine}". "roblox" veya "godot" olmalı.`);
        }
        const options: GenerateOptions = {
          engine: opts.engine as Engine,
          output: opts.output,
          name: opts.name,
        };
        await runGenerate(description, options);
      },
    ),
  );

program
  .command("design-level <description>")
  .description("Verilen tema/oyun için seviye tasarımı önerisi üretir")
  .option("-o, --output <file>", "Sonucu bir markdown dosyasına yaz")
  .action(
    withErrorHandling(async (description: string, opts: { output?: string }) => {
      await runDesignLevel(description, opts.output);
    }),
  );

registerEconomyCommand(program);

await program.parseAsync(process.argv);
