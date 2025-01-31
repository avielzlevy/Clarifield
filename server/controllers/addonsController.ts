import { Context } from "../deps.ts";
import { encodeBase64 } from "jsr:@std/encoding/base64";
import { Definition } from "../models/definition.ts";
import { Format } from "../models/format.ts";
import staticFormats from "../data/staticFormats.ts";

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

  // Build the formats object, using commas
  const formatsMap = Object.entries(formats)
    .map(([key, value]) => {
      // Double-check that value.pattern and value.description
      // do NOT contain any trailing semicolons themselves
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

  // Uncomment this line if you want to inspect the exact output in plain text:
  // console.log(tsContent);

  const base64Data = encodeBase64(tsContent);
  return {
    fileName: "standards.ts",
    fileData: {
      base64: base64Data,
    },
  };
};

// Controller to generate the TypeScript file
export const getTypeScriptFile = async (): Promise<{
  fileName: string;
  fileData: { base64: string };
}> => {
  const userDefinedDefinitions = Deno.readTextFileSync("./data/definitions.json");
  const userDefinedFormats = Deno.readTextFileSync("./data/formats.json");

  // Merge static formats with user-defined formats
  const formats = {
    ...staticFormats,
    ...JSON.parse(userDefinedFormats),
  };

  // Read user-defined definitions
  const definitions = {
    ...JSON.parse(userDefinedDefinitions),
  };

  // Generate the TypeScript file
  return generateTypeScriptFileBase64(definitions, formats);
};

// Controller to get addons (and thereby trigger the TS file generation)
export const getAddons = async (ctx: Context) => {
  try {
    const tsFile = await getTypeScriptFile();

    // Return an array of objects containing the generated TypeScript file
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
