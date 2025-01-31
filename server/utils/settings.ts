import { Context } from "../deps.ts";
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  transformKeys,
} from "./nameConvert.ts";
import {
  readDefinitions,
  writeDefinitions,
} from "../controllers/definitionController.ts";

const DATA_FILE = "./data/settings.json";

const readSettings = async (): Promise<{ [key: string]: any }> => {
  try {
    const data = await Deno.readTextFile(DATA_FILE);
    return JSON.parse(data);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      //default settings
      await Deno.writeTextFile(
        DATA_FILE,
        JSON.stringify({
          namingConvention: "snake_case",
        })
      );
    }
    return {};
  }
};

const writeSettings = async (settings: { [key: string]: any }) => {
  await Deno.writeTextFile(DATA_FILE, JSON.stringify(settings, null, 2));
};

export const getSettings = async (ctx: Context) => {
  const changes = await readSettings();
  ctx.response.body = changes;
};

export const updateSettings = async (ctx: Context) => {
  const { value } = ctx.request.body({ type: "json" });
  const { namingConvention } = await value;

  if (!namingConvention) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid settings data" };
    return;
  }

  const settings = await readSettings();
  // add new fields
  const updatedSettings = { ...settings, namingConvention };
  await writeSettings(updatedSettings);
  await ApplySettings(updatedSettings);
  ctx.response.status = 201;
  ctx.response.body = updatedSettings;
};

const ApplySettings = async (settings: { [key: string]: any }) => {
  const definitions = await readDefinitions();
  let newDefinitions = definitions;
  switch (settings.namingConvention) {
    case "camelCase":
      newDefinitions = transformKeys(definitions, toCamelCase);
      break;
    case "PascalCase":
      newDefinitions = transformKeys(definitions, toPascalCase);
      break;
    case "kebab-case":
      newDefinitions = transformKeys(definitions, toKebabCase);
      break;
    case "snake_case":
    default:
      newDefinitions = transformKeys(definitions, toSnakeCase);
      break;
  }
  await writeDefinitions(newDefinitions);
};
