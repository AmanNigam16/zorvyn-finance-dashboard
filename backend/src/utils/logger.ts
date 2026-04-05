type LogLevel = "INFO" | "WARN" | "ERROR";

const log = (level: LogLevel, message: string, meta?: unknown): void => {
  const timestamp = new Date().toISOString();
  const payload = meta ? ` ${JSON.stringify(meta, null, 2)}` : "";

  console.log(`[${timestamp}] ${level}: ${message}${payload}`);
};

export const logger = {
  info: (message: string, meta?: unknown) => log("INFO", message, meta),
  warn: (message: string, meta?: unknown) => log("WARN", message, meta),
  error: (message: string, meta?: unknown) => log("ERROR", message, meta)
};
