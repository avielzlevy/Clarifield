// controllers/addonController.ts

import { Context } from "../deps.ts";
import { encodeBase64 } from "jsr:@std/encoding/base64";
import { Definition } from "../models/definition.ts";
import { Format } from "../models/format.ts";
import staticFormats from "../data/staticFormats.ts";

// Import the repositories instead of reading JSON files directly.
import * as defRepo from "../repositories/definitionRepository.ts";
import * as formatRepo from "../repositories/formatRepository.ts";

/**
 * Generates a base64-encoded TypeScript file containing:
 * 1. An interface `Definitions` with string fields
 * 2. A `Formats` object with regex patterns and descriptions
 */
const generateTypeScriptFileBase64 = (
  definitions: { [name: string]: Definition },
  formats: { [name: string]: Format }
) => {
  // Build the interface properties
  const definitionsInterface = Object.entries(definitions)
    .map(([key, value]) => {
      return `    /**\n     * ${value.description}\n     * Format: ${value.format}\n     */\n    ${key}: string;`;
    })
    .join("\n\n");

  // Build the formats object
  const formatsMap = Object.entries(formats)
    .map(([key, value]) => {
      // Ensure value.pattern and value.description do not contain unwanted semicolons
      return `    "${key}": {\n        pattern: "${value.pattern}",\n        description: "${value.description}"\n    },`;
    })
    .join("\n\n");

  const tsContent = `/**
 * This file is auto-generated. Do not modify manually.
 */

export interface Definitions {
${definitionsInterface}
}

export const Formats: Record<string, { pattern: string; description: string }> = {
${formatsMap}
};
`;

  const base64Data = encodeBase64(tsContent);
  return {
    fileName: "standards.ts",
    fileData: {
      base64: base64Data,
    },
  };
};

/**
 * Controller to generate the TypeScript file.
 *
 * Instead of using synchronous file reads, this version awaits the repository functions
 * so that the underlying storage (file or MongoDB) is abstracted.
 */
export const getTypeScriptFile = async (): Promise<{
  fileName: string;
  fileData: { base64: string };
}> => {
  // Get user-defined definitions and formats from their repositories
  const userDefinedDefinitions = await defRepo.getDefinitions();
  const userDefinedFormats = await formatRepo.getFormats();

  // Merge static formats with user-defined formats
  const formats = {
    ...staticFormats,
    ...userDefinedFormats,
  };

  // Use the user-defined definitions as obtained from the repository
  const definitions = { ...userDefinedDefinitions };

  // Generate the TypeScript file content and encode it in base64
  return generateTypeScriptFileBase64(definitions, formats);
};

/**
 * Controller to get addons (which triggers the TS file generation)
 */
export const getAddons = async (ctx: Context) => {
  try {
    const tsFile = await getTypeScriptFile();

    // Return an array containing the generated TypeScript file info
    ctx.response.status = 200;
    ctx.response.body = [tsFile];
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    ctx.response.status = 500;
    ctx.response.body = {
      message: "Failed to retrieve addons",
      error: err.message,
    };
  }
};
