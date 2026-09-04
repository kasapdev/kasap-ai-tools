#!/usr/bin/env node
import { extname } from "node:path";
import { Command } from "commander";
import { DEFAULT_TOLERANCE, removeBackground } from "./image/removeBackground.js";
import { withErrorHandling } from "./utils/cli.js";

const program = new Command();

program
  .name("listing-image-bg-remover")
  .description("Ürün fotoğrafındaki düz/uniform arka planı saydam yapan klasik (ML olmayan) araç")
  .version("0.1.0");

program
  .command("remove-bg <input>")
  .description("Verilen görseldeki arka planı flood-fill ile saydam yapar, PNG olarak kaydeder")
  .option("-o, --output <dosya>", "Çıktı dosyası (varsayılan: <input>-nobg.png)")
  .option(
    "-t, --tolerance <sayi>",
    "Arka plan renginden izin verilen renk mesafesi",
    String(Number(process.env.BG_REMOVER_DEFAULT_TOLERANCE) || DEFAULT_TOLERANCE),
  )
  .action(
    withErrorHandling(async (input: string, opts: { output?: string; tolerance: string }) => {
      const tolerance = Number(opts.tolerance);
      if (!Number.isFinite(tolerance) || tolerance < 0) {
        throw new Error("--tolerance pozitif bir sayı olmalı.");
      }

      const ext = extname(input);
      const output = opts.output ?? input.slice(0, input.length - ext.length) + "-nobg.png";

      const result = await removeBackground(input, output, { tolerance });
      const totalPixels = result.width * result.height;
      const percent = ((result.transparentPixelCount / totalPixels) * 100).toFixed(1);

      console.log(`Görsel: ${result.width}x${result.height}`);
      console.log(
        `Saydam yapılan piksel: ${result.transparentPixelCount}/${totalPixels} (%${percent})`,
      );
      console.log(`Çıktı: ${output}`);
    }),
  );

await program.parseAsync(process.argv);
