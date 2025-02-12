// repositories/analyticRepository.ts

import { MongoClient, Collection } from "https://deno.land/x/mongo@v0.31.1/mod.ts";

// Define explicit types for our analytics data.
type AnalyticsRecord = { [name: string]: number };
type AnalyticsMap = { [type: string]: AnalyticsRecord };

const getUseMongo = () => Deno.env.get("USE_MONGO") === "true";
const DATA_FILE = "./data/analytics.json";

// Define the interface for analytic documents stored in MongoDB.
interface AnalyticDoc {
  type: string;
  name: string;
  amount: number;
}

// Use a properly typed collection rather than any.
let analyticsCollection: Collection<AnalyticDoc>;

const initMongo = async () => {
  if (getUseMongo()) {
    const mongoUri = Deno.env.get("MONGO_URI");
    const mongoDb = Deno.env.get("MONGO_DB");
    const mongoUser = Deno.env.get("MONGO_USER");
    const mongoPassword = Deno.env.get("MONGO_PASSWORD");
    if (!mongoUri|| !mongoDb || !mongoUser || !mongoPassword) {
      throw new Error("MONGO_URI, MONGO_DB, MONGO_USER, and MONGO_PASSWORD must be set when USE_MONGO is true."); 
    }
    const mongoSrvUri = `mongodb+srv://${mongoUser}:${mongoPassword}@${mongoUri}/Priority?retryWrites=true&w=majority`;
    const client = new MongoClient();
    console.log(`Connecting to MongoDB at ${mongoSrvUri}`);
    await client.connect(mongoSrvUri);
    const db = client.database(mongoDb); // Adjust database name as needed.
    console.log(`Connected to database "${mongoDb}"`);
    analyticsCollection = db.collection<AnalyticDoc>("analytics");
    console.log(`using collection "analytics" ${analyticsCollection}`);
  }
}

/**
 * Reads the analytics JSON file and returns its contents
 * as an AnalyticsMap.
 */
export const readAnalytics = async (): Promise<AnalyticsMap> => {
  try {
    const data = await Deno.readTextFile(DATA_FILE);
    return JSON.parse(data) as AnalyticsMap;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      await Deno.writeTextFile(DATA_FILE, "{}");
    }
    return {} as AnalyticsMap;
  }
};

/**
 * Writes the provided analytics object to the JSON file.
 */
export const writeAnalytics = async (
  analytics: AnalyticsMap,
): Promise<void> => {
  await Deno.writeTextFile(DATA_FILE, JSON.stringify(analytics, null, 2));
};

/**
 * Retrieves all analytics data.
 */
export const getAnalytics = async (): Promise<AnalyticsMap> => {
  if (getUseMongo()) {
    if(!analyticsCollection) {
      await initMongo();
    }
    console.log(`Analytics collection: ${analyticsCollection}`);
    const docs = await analyticsCollection.find({}).toArray();
    const result: AnalyticsMap = {};
    for (const doc of docs) {
      // Ensure we have an object for this type.
      if (!result[doc.type]) {
        result[doc.type] = {};
      }
      result[doc.type][doc.name] = doc.amount;
    }
    return result;
  } else {
    return await readAnalytics();
  }
};

/**
 * Adds (or updates) an analytic record.
 * In file-based storage, if a record for the given type and name exists, its amount is incremented.
 */
export const addAnalytic = async (
  type: string,
  name: string,
  amount: number,
): Promise<void> => {
  if (getUseMongo()) {
    if(!analyticsCollection) {
      await initMongo();
    }
    await analyticsCollection.updateOne(
      { type, name },
      { $inc: { amount } },
      { upsert: true },
    );
  } else {
    const analytics = await readAnalytics();
    // Ensure the main structure exists for the type.
    if (!analytics[type]) {
      analytics[type] = {} as AnalyticsRecord;
    }
    // If the record exists, increment it; otherwise, assign the value.
    if (typeof analytics[type][name] === "number") {
      analytics[type][name] += amount;
    } else {
      analytics[type][name] = amount;
    }
    await writeAnalytics(analytics);
  }
};

