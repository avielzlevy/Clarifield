// repositories/entityRepository.ts

import { Entity } from "../models/entities.ts";
import {
  MongoClient,
  Collection,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";

// Check the environment variable to determine storage
const getUseMongo = () => Deno.env.get("USE_MONGO") === "true";
const DATA_FILE = "./data/entities.json";

// For MongoDB storage, we set up a collection.
let entitiesCollection: Collection<Entity>;

const initMongo = async () => {
  if (getUseMongo()) {
    const mongoUri = Deno.env.get("MONGO_URI");
    const mongoDb = Deno.env.get("MONGO_DB");
    if (!mongoUri) {
      throw new Error(
        "MONGO_URI and MONGO_DB must be set when USE_MONGO is true."
      );
    }
    const client = new MongoClient();
    await client.connect(mongoUri);
    const db = client.database(mongoDb); // adjust the database name as needed
    // Use a collection named "entities"
    entitiesCollection = db.collection<Entity>("entities");
  }
};

/**
 * Returns all entities as a map keyed by the entity’s label.
 */
export const getEntities = async (): Promise<Record<string, Entity>> => {
  if (getUseMongo()) {
    if (!entitiesCollection) {
      await initMongo();
    }
    const docs = await entitiesCollection.find({}).toArray();
    const result: Record<string, Entity> = {};
    for (const doc of docs) {
      result[doc.label] = { label: doc.label, fields: doc.fields };
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
 * Adds a new entity. Throws an error if an entity with the same label exists.
 */
export const addEntity = async (entity: Entity): Promise<void> => {
  if (getUseMongo()) {
    if (!entitiesCollection) {
      await initMongo();
    }
    const existing = await entitiesCollection.findOne({ label: entity.label });
    if (existing) {
      throw new Error(`Entity with label '${entity.label}' already exists`);
    }
    await entitiesCollection.insertOne(entity);
  } else {
    const entities = await getEntities();
    if (entities[entity.label]) {
      throw new Error(`Entity with label '${entity.label}' already exists`);
    }
    entities[entity.label] = entity;
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(entities, null, 2));
  }
};

/**
 * Updates an existing entity (identified by the old label `name`).
 * If the updated entity’s label changes, the key is updated accordingly.
 */
export const updateEntity = async (
  name: string,
  entity: Entity
): Promise<void> => {
  if (getUseMongo()) {
    if (!entitiesCollection) {
      await initMongo();
    }
    const result = await entitiesCollection.updateOne(
      { label: name },
      { $set: { label: entity.label, fields: entity.fields } }
    );
    // If no document was matched, assume the entity was not found.
    if (!result.matchedCount) {
      throw new Error(`Entity with label '${name}' not found`);
    }
  } else {
    const entities = await getEntities();
    if (!entities[name]) {
      throw new Error(`Entity with label '${name}' not found`);
    }
    // If the label changed, remove the old key.
    if (name !== entity.label) {
      delete entities[name];
    }
    entities[entity.label] = entity;
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(entities, null, 2));
  }
};

/**
 * Deletes an entity by its label.
 */
export const deleteEntity = async (name: string): Promise<void> => {
  if (getUseMongo()) {
    if (!entitiesCollection) {
      await initMongo();
    }
    const result = await entitiesCollection.deleteOne({ label: name });
    if (!result) {
      throw new Error(`Entity with label '${name}' not found`);
    }
  } else {
    const entities = await getEntities();
    if (!entities[name]) {
      throw new Error(`Entity with label '${name}' not found`);
    }
    delete entities[name];
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(entities, null, 2));
  }
};

/*
 * Reads the entities from storage.
 * If using file‑based storage, reads from the JSON file.
 * If using MongoDB, reads from the collection.
 */

export const readEntities = async (): Promise<Record<string, Entity>> => {
  if (getUseMongo()) {
    if (!entitiesCollection) {
      await initMongo();
    }
    const docs = await entitiesCollection.find({}).toArray();
    const result: Record<string, Entity> = {};
    for (const doc of docs) {
      // Ensure that each document has a "label" property.
      result[doc.label] = { label: doc.label, fields: doc.fields };
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
 * Writes the entities to storage.
 * If using file‑based storage, writes to the JSON file.
 * If using MongoDB, performs a bulk replacement:
 *   - Deletes all existing entities
 *   - Inserts the provided ones.
 *
 * > **Warning:** In a production MongoDB setup you might prefer individual update operations
 * > rather than replacing the entire collection.
 */
export const writeEntities = async (
  entities: Record<string, Entity>
): Promise<void> => {
  if (getUseMongo()) {
    if (!entitiesCollection) {
      await initMongo();
    }
    // Remove all existing documents from the collection.
    await entitiesCollection.deleteMany({});
    // Insert the new entities (if any).
    const docs = Object.values(entities);
    if (docs.length > 0) {
      await entitiesCollection.insertMany(docs);
    }
  } else {
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(entities, null, 2));
  }
};
