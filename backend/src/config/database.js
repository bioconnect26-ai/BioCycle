import dotenv from "dotenv";
dotenv.config();

const shouldUseSsl =
  process.env.DB_SSL === "true" ||
  Boolean(process.env.DATABASE_URL) ||
  process.env.NODE_ENV === "production";

const sslConfig = shouldUseSsl
  ? {
      require: true,
      rejectUnauthorized: false,
    }
  : undefined;

const common = {
  dialect: "postgres",
  logging: false,
  pool: {
    max: Number(process.env.DB_POOL_MAX || 5),
    min: 0,
    acquire: 30000,
    idle: 10000,
    evict: 15000,
  },
  benchmark: process.env.NODE_ENV === "development",
  isolationLevel: "READ_COMMITTED",
  retry: {
    max: 3,
  },
};

function makeConfig() {
  if (process.env.DATABASE_URL) {
    const parsedUrl = new URL(process.env.DATABASE_URL);

    return {
      ...common,
      database: decodeURIComponent(parsedUrl.pathname.replace(/^\//, "")),
      username: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      host: parsedUrl.hostname,
      port: Number(parsedUrl.port || 5432),
      ssl: sslConfig,
      dialectOptions: {
        ssl: sslConfig,
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
    ssl: sslConfig,
    dialectOptions: {
      ssl: sslConfig || false,
    },
  };
}

export const dbConfig = {
  development: makeConfig(),
  production: makeConfig(),
};

export const sequelizeConfig = dbConfig[process.env.NODE_ENV || "development"];
