import dotenv from "dotenv";
dotenv.config();



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
