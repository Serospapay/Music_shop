/**
 * Заповнює MongoDB у Docker (порт 27017 на хості) демо-товарами.
 * Бере ім'я БД з MONGO_DB_NAME у .env або з назви в DATABASE_URL.
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");

if (!existsSync(envPath)) {
  console.error("Немає .env у корені проєкту. Скопіюйте .env.example → .env");
  process.exit(1);
}

const raw = readFileSync(envPath, "utf8");
let dbName = "octave_shop";
const m = raw.match(/^MONGO_DB_NAME\s*=\s*"?([^"\r\n]+)"?/m);
if (m) {
  dbName = m[1].trim();
} else {
  const du = raw.match(/^DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
  if (du) {
    try {
      const u = new URL(du[1].replace(/^mongodb(\+srv)?:\/\//, "http://"));
      const p = u.pathname.replace(/^\//, "").split("?")[0];
      if (p) {
        dbName = p;
      }
    } catch {
      /* ignore */
    }
  }
}

const hostUrl = `mongodb://127.0.0.1:27017/${dbName}`;
console.log(`\n[seed-docker] DATABASE_URL=${hostUrl}\n`);

const env = { ...process.env, DATABASE_URL: hostUrl };
const r = spawnSync("npx", ["prisma", "db", "seed"], {
  cwd: root,
  env,
  stdio: "inherit",
  shell: true,
});
process.exit(r.status ?? 1);
