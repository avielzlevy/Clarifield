// repositories/reportRepository.ts

import { Reports } from "../models/report.ts";
import {
  MongoClient,
  Collection,
} from "https://deno.land/x/mongo@v0.31.1/mod.ts";

// Define the shape of a report document.
interface ReportDocument {
  type: string;
  name: string;
  // New structure: an array of objects with status and description.
  descriptions: { status: string; description: string }[];
}

// Check environment variable for storage type.
const getUseMongo = () => Deno.env.get("USE_MONGO") === "true";

// File path for file-based storage.
const DATA_FILE = "./data/reports.json";

// Use a properly typed collection for MongoDB.
let reportsCollection: Collection<ReportDocument>;
const initMongo = async () => {
  if (getUseMongo()) {
    const mongoHost = Deno.env.get("MONGO_HOST");
    const mongoDb = Deno.env.get("MONGO_DB");
    const mongoUser = Deno.env.get("MONGO_USER");
    const mongoPassword = Deno.env.get("MONGO_PASSWORD");
    if (!mongoHost || !mongoDb || !mongoUser || !mongoPassword) {
      throw new Error(
        "MONGO_HOST, MONGO_DB, MONGO_USER, and MONGO_PASSWORD must be set when USE_MONGO is true."
      );
    }
    const mongoSrvUri = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}/${mongoDb}?retryWrites=true&w=majority`;
    const client = new MongoClient();
    console.log(`Connecting to MongoDB at ${mongoSrvUri}`);
    await client.connect(mongoSrvUri);
    const db = client.database(mongoDb);
    console.log(`Connected to database "${mongoDb}"`);
    reportsCollection = db.collection<ReportDocument>("reports");
  }
};

// Helper function to normalize description entries.
// If an entry is a string (old format), it converts it into the new object format.
const normalizeDescriptions = (
  descriptions: any[]
): { status: string; description: string }[] => {
  return descriptions.map((item) => {
    if (typeof item === "string") {
      return { status: "pending", description: item };
    }
    return item;
  });
};

/**
 * Get all reports.
 * For file storage, the structure is:
 * { [type: string]: { [name: string]: {status:string, description:string}[] } }
 */
export const getReports = async (): Promise<Reports> => {
  if (getUseMongo()) {
    if (!reportsCollection) {
      await initMongo();
    }
    const docs = await reportsCollection.find({}).toArray();
    const reports: Reports = {};
    for (const doc of docs) {
      const type = doc.type;
      const name = doc.name;
      // Normalize the descriptions to ensure they follow the new structure.
      const normalized = normalizeDescriptions(doc.descriptions);
      if (!reports[type]) {
        reports[type] = {};
      }
      reports[type][name] = normalized;
    }
    return reports;
  } else {
    try {
      const data = await Deno.readTextFile(DATA_FILE);
      const reports: Reports = JSON.parse(data);
      // Normalize in case some reports are still stored in the old format.
      for (const type in reports) {
        for (const name in reports[type]) {
          reports[type][name] = normalizeDescriptions(reports[type][name]);
        }
      }
      return reports;
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        await Deno.writeTextFile(DATA_FILE, "{}");
      }
      return {} as Reports;
    }
  }
};

/**
 * Add (or update) a report.
 * If a report with the given type and name exists, the new description is appended.
 * The new description is stored with a default status of "pending".
 */
export const addReport = async (
  type: string,
  name: string,
  description: string
): Promise<void> => {
  const newEntry = { status: "pending", description };
  if (getUseMongo()) {
    if (!reportsCollection) {
      await initMongo();
    }
    const existing = await reportsCollection.findOne({ type, name });
    if (existing) {
      await reportsCollection.updateOne(
        { type, name },
        { $push: { descriptions: { $each: [newEntry] } } }
      );
    } else {
      await reportsCollection.insertOne({
        type,
        name,
        descriptions: [newEntry],
      });
    }
  } else {
    const reports = await getReports();
    if (!reports[type]) {
      reports[type] = {};
    }
    if (reports[type][name]) {
      reports[type][name].push(newEntry);
    } else {
      reports[type][name] = [newEntry];
    }
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(reports, null, 2));
  }
};

/**
 * Update the status of a specific report description.
 * It finds the report by type, name, and description text and updates its status.
 *
 * @param type - The report type.
 * @param name - The report name.
 * @param description - The description text to identify the specific report entry.
 * @param status - The new status to set.
 */
export const updateReport = async (
  type: string,
  name: string,
  description: string,
  status: string
): Promise<void> => {
  if (getUseMongo()) {
    if (!reportsCollection) {
      await initMongo();
    }
    await reportsCollection.updateOne(
      { type, name, "descriptions.description": description },
      { $set: { "descriptions.$.status": status } }
    );
  } else {
    const reports = await getReports();
    if (reports[type] && reports[type][name]) {
      const index = reports[type][name].findIndex(
        (entry) => entry.description === description
      );
      if (index !== -1) {
        reports[type][name][index].status = status;
        await Deno.writeTextFile(DATA_FILE, JSON.stringify(reports, null, 2));
      }
    }
  }
};
