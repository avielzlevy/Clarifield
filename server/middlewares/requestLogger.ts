// middlewares/requestLogger.ts
import { Context } from "../deps.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std@0.224.0/path/mod.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));
const logDir = join(__dirname, "../logs");
const logFilePath = join(logDir, "audit.log");
const maxFileSize = 5 * 1024 * 1024; // 5MB

/**
 * Formats the log message to include timestamp, IP, HTTP method, path, status, and duration.
 * @param ip - The client's IP address.
 * @param method - HTTP method of the request.
 * @param path - Request path.
 * @param status - HTTP status code of the response.
 * @param duration - Time taken to handle the request in milliseconds.
 * @returns A formatted log string.
 */
function formatLog(
  ip: string,
  method: string,
  path: string,
  status: number,
  duration: number
): string {
  const timestamp = new Date().toISOString();
  return `${timestamp} | ${ip} | ${method} ${path} | ${status} | ${duration}ms\n`;
}

/**
 * Rotates the log file if it exceeds the maximum file size.
 */
async function rotateLogIfNeeded() {
  try {
    const fileInfo = await Deno.stat(logFilePath);
    if (fileInfo.size >= maxFileSize) {
      const rotatedFileName = `audit-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.log`;
      const rotatedFilePath = join(logDir, rotatedFileName);
      await Deno.rename(logFilePath, rotatedFilePath);
      console.log(`Rotated log file to ${rotatedFilePath}`);
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      // File does not exist yet; no action needed
      return;
    }
    console.error("Error checking log file size:", error);
  }
}

/**
 * Ensures that the logs directory exists. If it doesn't, creates it.
 */
async function ensureLogDirectory() {
  try {
    await Deno.mkdir(logDir, { recursive: true });
  } catch (error) {
    if (error instanceof Deno.errors.AlreadyExists) {
      // Directory already exists; no action needed
      return;
    }
    console.error("Failed to create logs directory:", error);
    throw error; // Re-throw the error after logging
  }
}

/**
 * Writes the log message to the log file.
 * @param logMessage - The formatted log string to write.
 */
async function writeLog(logMessage: string) {
  await rotateLogIfNeeded();
  await ensureLogDirectory(); // Ensure the logs directory exists
  try {
    await Deno.writeTextFile(logFilePath, logMessage, { append: true });
  } catch (error) {
    console.error("Failed to write to audit.log:", error);
  }
}

/**
 * Middleware to log incoming requests along with client IP, method, path, status, and duration.
 * @param ctx - The context of the request.
 * @param next - The next middleware function.
 */
export async function auditLogger(ctx: Context, next: () => Promise<unknown>) {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;

  const { method, url, headers } = ctx.request;
  const path = url.pathname;
  const status = ctx.response.status;

  // Extract the client's IP address
  let ip: string | undefined;
  // 1. Check for X-Forwarded-For header (useful if behind a proxy)
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, the first one is the client's IP
    ip = xForwardedFor.split(",")[0].trim();
  } else {
    ip = ctx.request.ip;
  }

  // If IP is still undefined, set it to "Unknown"
  if (!ip) {
    ip = "Unknown";
  }
  console.log({ ip, method, path, status, duration });

  const logMessage = formatLog(ip, method, path, status, duration);
  await writeLog(logMessage);
}
