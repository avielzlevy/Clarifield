import { Context } from "../deps.ts";
import {
  join,
  normalize,
  extname,
} from "https://deno.land/std@0.203.0/path/mod.ts";
import { Definitions } from "../models/definition.ts";

// Utility function to safely read and parse JSON files
const readFile = <T>(filePath: string): T => {
  const normalizedPath = normalize(filePath);

  if (extname(normalizedPath) !== ".json") {
    throw new Error("Invalid file extension. Only .json files are allowed.");
  }

  try {
    const data = Deno.readTextFileSync(normalizedPath);
    return JSON.parse(data) as T;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      Deno.writeTextFileSync(normalizedPath, "{}");
      return {} as T;
    } else {
      console.error(`Error reading file ${normalizedPath}:`, e);
      throw e; // Re-throw the error after logging
    }
  }
};

export const getAffected = (ctx: Context) => {
  const searchParams = ctx.request.url.searchParams;
  const query = Object.fromEntries(searchParams.entries()) as Record<
    string,
    string
  >;

  const { format, definition } = query;

  // Validate that only one query parameter is provided
  const providedParams = [format, definition].filter(
    (param) => param !== undefined
  );
  if (providedParams.length !== 1) {
    ctx.response.status = 400;
    ctx.response.body = {
      message:
        "Please provide exactly one query parameter: format, definition.",
    };
    return;
  }

  // Determine the search order based on the provided query parameter
  let files: string[] = [];
  let initialReference: string = "";
  let referenceKey: keyof typeof query = "format"; // default

  if (format) {
    initialReference = decodeURIComponent(format);
    referenceKey = "format";
    files = ["definitions.json", "models.json", "schemas.json"];
  } else if (definition) {
    initialReference = decodeURIComponent(definition);
    referenceKey = "definition";
    files = ["models.json", "schemas.json"];
  }

  // Initialize usages and references
  const usages: Record<string, string[]> = {};
  let currentReferences: Set<string> = new Set([initialReference]);

  for (const file of files) {
    const filePath = join(Deno.cwd(), "data", file);

    let data: Record<string, any> = {};
    try {
      switch (file) {
        case "definitions.json":
          data = readFile<Definitions>(filePath);
          break;
        default:
          data = readFile<Record<string, any>>(filePath);
      }
    } catch (error) {
      console.error(`Failed to read or parse ${filePath}:`, error);
      ctx.response.status = 500;
      ctx.response.body = {
        message: `Internal server error while processing ${file}`,
      };
      return;
    }

    const newReferences: Set<string> = new Set();
    const fileKey = file.replace(".json", "");

    for (const [name, item] of Object.entries(data)) {
      let isMatch = false;

      switch (referenceKey) {
        case "format":
          // Search definitions that use the specified format
          if (item.format === initialReference) {
            isMatch = true;
          }
          break;
        case "definition":
          // Search models that use the specified definition
          if (
            item.definitions &&
            Array.isArray(item.definitions) &&
            item.definitions.includes(initialReference)
          ) {
            isMatch = true;
          }
          break;
        case "model":
          // Search schemas that use the specified model
          if (item.model === initialReference) {
            isMatch = true;
          }
          break;
      }

      if (isMatch) {
        // Record the usage by mapping file to items
        if (!usages[fileKey]) {
          usages[fileKey] = [];
        }
        usages[fileKey].push(name);

        // Add the current item to new references for the next file
        newReferences.add(name);
      }
    }

    // Update references for the next iteration
    currentReferences = newReferences;

    // Update the referenceKey for the next file in the chain
    if (referenceKey === "format") {
      referenceKey = "definition";
    } else if (referenceKey === "definition") {
      referenceKey = "model";
    }

    // If no new references are found, stop searching further files
    if (currentReferences.size === 0) {
      break;
    }
  }
  if (Object.keys(usages).length === 0) {
    ctx.response.status = 404;
    ctx.response.body = { message: `No usages found for ${initialReference}` };
    return;
  }
  ctx.response.status = 200;
  ctx.response.body = usages;
};
