import dotenv from "dotenv";
dotenv.config();

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
    return {
      ...common,
      url: process.env.DATABASE_URL,
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
  development: makeConfig(),
  production: makeConfig(),
};

export const sequelizeConfig = dbConfig[process.env.NODE_ENV || "development"];
