import dotenv from "dotenv";
dotenv.config();

import child_process from "child_process";

// build a configuration object that can either use individual settings or a single DATABASE_URL
const common = {
  dialect: "postgres",
  logging: false,
  // Connection pool optimization for serverless
  pool: {
    max: 5, // Reduced for serverless (Vercel has strict connection limits)
    min: 2,
    acquire: 30000, // 30 second timeout for acquiring connection
    idle: 10000, // 10 second idle timeout
    evict: 15000, // Evict connections after 15 seconds of idle time
  },
  // Sequelize optimizations
  benchmark: process.env.NODE_ENV === "development",
  isolationLevel: "READ_COMMITTED", // Faster than default SERIALIZABLE
  retry: {
    max: 3,
  },
};

function runNslookup(host) {
  try {
    const out = child_process.execSync(`nslookup ${host}`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { ok: true, output: out };
  } catch (err) {
    return { ok: false, error: err };
  }
}

function logDatabaseDiagnostics() {
  if (!process.env.DATABASE_URL) return;
  try {
    const parsed = new URL(process.env.DATABASE_URL);
    const host = parsed.hostname;
    const port = parsed.port || "(default)";
    console.log(`[DB] Using DATABASE_URL host=${host} port=${port}`);
    const result = runNslookup(host);
    if (result.ok) {
      console.log(`[DB DNS] nslookup ${host} succeeded:\n${result.output}`);
    } else {
      console.error(
        `[DB DNS] nslookup ${host} failed: ${result.error.message}`,
      );
      if (result.error.stdout) console.error(result.error.stdout.toString());
      if (result.error.stderr) console.error(result.error.stderr.toString());
      console.error(
        `[DB DNS] Hostname ${host} could not be resolved from this machine. Verify the DATABASE_URL host, your network/DNS settings, or switch to a local DB for development.`,
      );
    }
  } catch (e) {
    console.warn("[DB] Failed to parse DATABASE_URL for diagnostics.");
  }
}

logDatabaseDiagnostics();

function makeConfig(env) {
  // if URL provided, use it and let Sequelize parse credentials
  if (process.env.DATABASE_URL) {
    return {
      ...common,
      url: process.env.DATABASE_URL,
      // When using a managed Postgres (Aiven, Heroku etc.) require SSL but
      // allow self-signed certificates by disabling `rejectUnauthorized`.
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    };
  }

  return {
    ...common,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === "true",
    dialectOptions: {
      ssl:
        process.env.DB_SSL === "true"
          ? { require: true, rejectUnauthorized: false }
          : false,
    },
  };
}

export const dbConfig = {
  development: makeConfig("development"),
  production: makeConfig("production"),
};

export const sequelizeConfig = dbConfig[process.env.NODE_ENV || "development"];
