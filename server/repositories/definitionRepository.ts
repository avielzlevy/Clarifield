// repositories/definitionRepository.ts

import { Definition } from "../models/definition.ts";
import {
  MongoClient,
  Collection,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";

// Determine storage mode using an environment variable.
const getUseMongo = () => Deno.env.get("USE_MONGO") === "true";
const DATA_FILE = "./data/definitions.json";

// MongoDB collection variable.
let definitionsCollection: Collection<any>;

const initMongo = async () => {
  if (getUseMongo()) {
    const mongoHost = Deno.env.get("MONGO_HOST");
    const mongoDb = Deno.env.get("MONGO_DB");
    const mongoUser = Deno.env.get("MONGO_USER");
    const mongoPassword = Deno.env.get("MONGO_PASSWORD");
    if (!mongoHost|| !mongoDb || !mongoUser || !mongoPassword) {
      throw new Error("MONGO_HOST, MONGO_DB, MONGO_USER, and MONGO_PASSWORD must be set when USE_MONGO is true."); 
    }
    const mongoSrvUri = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}/${mongoDb}?retryWrites=true&w=majority`;
    const client = new MongoClient();
    console.log(`Connecting to MongoDB at ${mongoSrvUri}`);
    await client.connect(mongoSrvUri);
    const db = client.database(mongoDb); // Adjust database name as needed.
    console.log(`Connected to database "${mongoDb}"`);
    definitionsCollection = db.collection("definitions");
  }
};

/**
 * Retrieves all definitions as an object keyed by the definition name.
 */
export const getDefinitions = async (): Promise<Record<string, Definition>> => {
  if (getUseMongo()) {
    if (!definitionsCollection) {
      await initMongo();
    }
    // In Mongo, we assume documents have a `name` field along with `format` and `description`.
    const docs = await definitionsCollection.find({}).toArray();
    const result: Record<string, Definition> = {};
    for (const doc of docs) {
      result[doc.name] = {
        format: doc.format,
        description: doc.description || "",
      };
    }
    return result;
  } else {
    try {
      const data = await Deno.readTextFile(DATA_FILE);
      return JSON.parse(data);
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        await Deno.writeTextFile(DATA_FILE, "{}");
      }
      return {};
    }
  }
};

/**
 * Retrieves a single definition by name.
 */
export const getDefinition = async (
  name: string
): Promise<Definition | null> => {
  if (getUseMongo()) {
    if (!definitionsCollection) {
      await initMongo();
    }
    const doc = await definitionsCollection.findOne({ name });
    return doc
      ? { format: doc.format, description: doc.description || "" }
      : null;
  } else {
    const definitions = await getDefinitions();
    return definitions[name] || null;
  }
};

/**
 * Adds a new definition.
 * Throws an error if a definition with the given name already exists.
 */
export const addDefinition = async (
  name: string,
  definition: Definition
): Promise<void> => {
  if (getUseMongo()) {
    if (!definitionsCollection) {
      await initMongo();
    }
    const existing = await definitionsCollection.findOne({ name });
    if (existing) {
      throw new Error(`Definition with name '${name}' already exists`);
    }
    await definitionsCollection.insertOne({ name, ...definition });
  } else {
    const definitions = await getDefinitions();
    if (definitions[name]) {
      throw new Error(`Definition with name '${name}' already exists`);
    }
    definitions[name] = {
      format: definition.format,
      description: definition.description || "",
    };
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(definitions, null, 2));
  }
};

/**
 * Updates an existing definition.
 * Throws an error if the definition does not exist.
 */
export const updateDefinition = async (
  name: string,
  definition: Definition
): Promise<void> => {
  if (getUseMongo()) {
    if (!definitionsCollection) {
      await initMongo();
    }
    const result = await definitionsCollection.updateOne(
      { name },
      {
        $set: {
          format: definition.format,
          description: definition.description || "",
        },
      }
    );
    if (!result.matchedCount) {
      throw new Error(`Definition with name '${name}' not found`);
    }
  } else {
    const definitions = await getDefinitions();
    if (!definitions[name]) {
      throw new Error(`Definition with name '${name}' not found`);
    }
    definitions[name] = {
      format: definition.format,
      description: definition.description || "",
    };
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(definitions, null, 2));
  }
};

/**
 * Deletes a definition by name.
 * Throws an error if the definition does not exist.
 */
export const deleteDefinition = async (name: string): Promise<void> => {
  if (getUseMongo()) {
    if (!definitionsCollection) {
      await initMongo();
    }
    const result = await definitionsCollection.deleteOne({ name });
    if (!result) {
      throw new Error(`Definition with name '${name}' not found`);
    }
  } else {
    const definitions = await getDefinitions();
    if (!definitions[name]) {
      throw new Error(`Definition with name '${name}' not found`);
    }
    delete definitions[name];
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(definitions, null, 2));
  }
};

/**
 * Reads the definitions from storage.
 *
 * - **MongoDB:** Retrieves all documents from the collection and converts them to an object keyed by `name`.
 * - **File‑based:** Reads the JSON file from disk.
 */
export const readDefinitions = async (): Promise<
  Record<string, Definition>
> => {
  if (getUseMongo()) {
    if (!definitionsCollection) {
      await initMongo();
    }
    const docs = await definitionsCollection.find({}).toArray();
    const result: Record<string, Definition> = {};
    for (const doc of docs) {
      // Assumes each document has a "name" property that acts as the key.
      result[doc.name] = {
        format: doc.format,
        description: doc.description || "",
      };
    }
    return result;
  } else {
    try {
      const data = await Deno.readTextFile(DATA_FILE);
      return JSON.parse(data);
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        await Deno.writeTextFile(DATA_FILE, "{}");
      }
      return {};
    }
  }
};

/**
 * Writes the definitions to storage.
 *
 * - **MongoDB:** Clears all documents from the collection and bulk inserts the new definitions.
 * - **File‑based:** Writes the definitions object to a JSON file.
 *
 * > **Warning:** In a production MongoDB setup you might prefer to update individual documents rather than
 * > performing a full collection replacement.
 */
export const writeDefinitions = async (
  definitions: Record<string, Definition>
): Promise<void> => {
  if (getUseMongo()) {
    if (!definitionsCollection) {
      await initMongo();
    }
    // Remove all existing documents from the collection.
    await definitionsCollection.deleteMany({});
    // Convert the definitions object to an array of documents, ensuring each document has a "name" field.
    const docs = Object.entries(definitions).map(([name, def]) => ({
      name,
      ...def,
    }));
    if (docs.length > 0) {
      await definitionsCollection.insertMany(docs);
    }
  } else {
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(definitions, null, 2));
  }
};
