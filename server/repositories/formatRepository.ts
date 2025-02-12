// repositories/formatRepository.ts
import { Format } from "../models/format.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.31.1/mod.ts";

// Read environment variable (make sure you run Deno with --allow-env)
const getUseMongo = () => Deno.env.get("USE_MONGO") === "true";

let formatsCollection: any; // will hold the Mongo collection if using Mongo
const initMongo = async () => {
  if (getUseMongo()) {
    console.log("Using MongoDB");
    // Set up the MongoDB connection.
    // Make sure you set the MONGO_URI environment variable (e.g., "mongodb://localhost:27017")
    const mongoUri = Deno.env.get("MONGO_URI");
    const mongoDb = Deno.env.get("MONGO_DB");
    const mongoUser = Deno.env.get("MONGO_USER");
    const mongoPassword = Deno.env.get("MONGO_PASSWORD");
    if (!mongoUri|| !mongoDb || !mongoUser || !mongoPassword) {
      throw new Error("MONGO_URI, MONGO_DB, MONGO_USER, and MONGO_PASSWORD must be set when USE_MONGO is true."); 
    }

    const mongoSrvUri = `mongodb+srv://${mongoUser}:${mongoPassword}@${mongoUri}/${mongoDb}?retryWrites=true&w=majority`;
    const client = new MongoClient();
    console.log(`Connecting to MongoDB at ${mongoSrvUri}`);
    await client.connect(mongoSrvUri);

    // Connect to a specific database and collection.
    // Adjust the names as needed.
    const db = client.database(mongoDb);
    formatsCollection = db.collection<Format>("formats");
  }
};

// Helper function to get the file path (if needed)
const DATA_FILE = "./data/formats.json";

export const getFormats = async (): Promise<{ [name: string]: Format }> => {
  if (getUseMongo()) {
    if (!formatsCollection) {
      await initMongo();
    }
    // Get all documents from the collection.
    const mongoFormats = await formatsCollection.find({}).toArray();
    const formats: { [name: string]: Format } = {};
    for (const f of mongoFormats) {
      // Assuming that each document has a "name" field.
      formats[f.name] = { pattern: f.pattern, description: f.description };
    }
    return formats;
  } else {
    // Read from the JSON file.
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

export const addFormat = async (
  name: string,
  format: Format
): Promise<void> => {
  if (getUseMongo()) {
    if (!formatsCollection) {
      await initMongo();
    }
    // Check for duplicates.
    const existing = await formatsCollection.findOne({ name });
    if (existing) {
      throw new Error(`Format with name '${name}' already exists`);
    }
    await formatsCollection.insertOne({ name, ...format });
  } else {
    // Read, modify, and write back to the file.
    const formats = await getFormats();
    if (formats[name]) {
      throw new Error(`Format with name '${name}' already exists`);
    }
    formats[name] = format;
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(formats, null, 2));
  }
};

export const updateFormat = async (
  name: string,
  format: Format
): Promise<void> => {
  if (getUseMongo()) {
    if (!formatsCollection) {
      await initMongo();
    }
    const result = await formatsCollection.updateOne(
      { name },
      { $set: { pattern: format.pattern, description: format.description } }
    );
    // Depending on the driver version, you might have to check the update result.
    if (!result.matchedCount) {
      throw new Error(`Format with name '${name}' not found`);
    }
  } else {
    const formats = await getFormats();
    if (!formats[name]) {
      throw new Error(`Format with name '${name}' not found`);
    }
    formats[name] = format;
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(formats, null, 2));
  }
};

export const deleteFormat = async (name: string): Promise<void> => {
  if (getUseMongo()) {
    if (!formatsCollection) {
      await initMongo();
    }
    const result = await formatsCollection.deleteOne({ name });
    if (!result.deletedCount) {
      throw new Error(`Format with name '${name}' not found`);
    }
  } else {
    const formats = await getFormats();
    if (!formats[name]) {
      throw new Error(`Format with name '${name}' not found`);
    }
    delete formats[name];
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(formats, null, 2));
  }
};
