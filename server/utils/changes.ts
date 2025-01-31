import { Context } from "../deps.ts";

const DATA_FILE = "./data/changes.json";

const readChanges = async (): Promise<{ [type: string]: Change[] }> => {
    try {
      const data = await Deno.readTextFile(DATA_FILE);
      return JSON.parse(data);
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        await Deno.writeTextFile(DATA_FILE, "{}");
      }
      return {};
    }
  };
  

  const writeChanges = async (changes: { [type: string]: Change[] }): Promise<void> => {
    console.log(`Writing changes to ${DATA_FILE}`);
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(changes, null, 2));
  };
  

export const getChanges = async (ctx: Context) => {
  const changes = await readChanges();
  ctx.response.body = changes;
};

interface Change {
  type: string;
  name: string;
  timestamp: string;
  before: object | string;
  after: object | string;
}

export const addChange = async (data: Change) => {
    const { type, name, timestamp, before, after } = data;
    console.log({ type, name, timestamp, before, after });

    const changes = await readChanges();
  
    if (changes[type]) {
      changes[type].push({ name, timestamp, before, after, type });
    } else {
      changes[type] = [{ name, timestamp, before, after, type }];
    }
    await writeChanges(changes);
  };
  