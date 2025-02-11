// repositories/reportRepository.ts

import { Reports } from "../models/report.ts";
import { MongoClient, Collection } from "https://deno.land/x/mongo@v0.31.1/mod.ts";

// Define the shape of a report document.
interface ReportDocument {
  type: string;
  name: string;
  descriptions: string[];
}

// Check environment variable for storage type.
const getUseMongo = () => Deno.env.get("USE_MONGO") === "true";

// File path for file-based storage.
const DATA_FILE = "./data/reports.json";

// Use a properly typed collection for MongoDB.
let reportsCollection: Collection<ReportDocument>;

if (getUseMongo()) {
  const mongoUri = Deno.env.get("MONGO_URI");
  const mongoDb = Deno.env.get("MONGO_DB");
  if (!mongoUri) {
    throw new Error("MONGO_URI and MONGO_DB must be set when USE_MONGO is true.");
  }
  const client = new MongoClient();
  await client.connect(mongoUri);
  const db = client.database(mongoDb); // adjust your database name if needed
  reportsCollection = db.collection<ReportDocument>("reports");
}

/**
 * Get all reports.
 * For file storage, the structure is:
 * { [type: string]: { [name: string]: string[] } }
 */
export const getReports = async (): Promise<Reports> => {
  if (getUseMongo()) {
    const docs = await reportsCollection.find({}).toArray();
    const reports: Reports = {};
    for (const doc of docs) {
      const type = doc.type;
      const name = doc.name;
      if (!reports[type]) {
        reports[type] = {};
      }
      reports[type][name] = doc.descriptions;
    }
    return reports;
  } else {
    try {
      const data = await Deno.readTextFile(DATA_FILE);
      return JSON.parse(data);
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
 */
export const addReport = async (
  type: string,
  name: string,
  description: string,
): Promise<void> => {
  if (getUseMongo()) {
    const existing = await reportsCollection.findOne({ type, name });
    if (existing) {
      // Use $each to push a single element.
      await reportsCollection.updateOne(
        { type, name },
        { $push: { descriptions: { $each: [description] } } },
      );
    } else {
      await reportsCollection.insertOne({ type, name, descriptions: [description] });
    }
  } else {
    const reports = await getReports();
    if (!reports[type]) {
      reports[type] = {};
    }
    if (reports[type][name]) {
      reports[type][name].push(description);
    } else {
      reports[type][name] = [description];
    }
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(reports, null, 2));
  }
};

/**
 * Delete a report by type and name.
 */
export const deleteReport = async (
  type: string,
  name: string,
): Promise<void> => {
  if (getUseMongo()) {
    // deleteOne returns a number (1 if deleted, 0 if not found)
    const result = await reportsCollection.deleteOne({ type, name });
    if (!result) {
      throw new Error(`Report with type '${type}' and name '${name}' not found`);
    }
  } else {
    const reports = await getReports();
    if (!reports[type] || !reports[type][name]) {
      throw new Error(`Report with type '${type}' and name '${name}' not found`);
    }
    delete reports[type][name];
    if (Object.keys(reports[type]).length === 0) {
      delete reports[type];
    }
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(reports, null, 2));
  }
};

/**
 * Clear all reports of a specific type.
 */
export const clearReportsByType = async (type: string): Promise<void> => {
  if (getUseMongo()) {
    // deleteMany returns a number.
    const deletedCount = await reportsCollection.deleteMany({ type });
    if (deletedCount === 0) {
      throw new Error(`Report type '${type}' not found`);
    }
  } else {
    const reports = await getReports();
    if (!reports[type]) {
      throw new Error(`Report type '${type}' not found`);
    }
    delete reports[type];
    await Deno.writeTextFile(DATA_FILE, JSON.stringify(reports, null, 2));
  }
};

/**
 * Clear all reports.
 */
export const clearAllReports = async (): Promise<void> => {
  if (getUseMongo()) {
    await reportsCollection.deleteMany({});
  } else {
    await Deno.writeTextFile(DATA_FILE, "{}");
  }
};
