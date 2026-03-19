import path from "path";
import { promises as fs } from "fs";

type AuditSeverity = "info" | "warn" | "error";

type AuditPayload = {
  action: string;
  actor: string;
  severity?: AuditSeverity;
  details?: Record<string, unknown>;
};

function writeStdout(record: Record<string, unknown>) {
  const line = JSON.stringify(record);
  if (process.env.NODE_ENV === "production") {
    console.log(line);
  } else {
    console.log(`[audit] ${line}`);
  }
}

export async function logAuditEvent(payload: AuditPayload) {
  const record = {
    timestamp: new Date().toISOString(),
    action: payload.action,
    actor: payload.actor,
    severity: payload.severity ?? "info",
    details: payload.details ?? {},
  };

  writeStdout(record);

  try {
    const logDir = path.join(process.cwd(), "logs");
    const logFile = path.join(logDir, "audit.log");
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(logFile, `${JSON.stringify(record)}\n`, "utf8");
  } catch {
    console.error("AUDIT_LOG_FILE_WRITE_FAILED", record);
  }
}
