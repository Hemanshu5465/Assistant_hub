const { Sequelize } = require("sequelize");

// Supports either a single DATABASE_URL (recommended for hosted Postgres
// like Neon / Supabase / Render / Railway) OR individual PG_* fields
// (recommended for local Postgres installs).
const useConnectionString = !!process.env.DATABASE_URL;

// Hosted Postgres almost always requires SSL. Default it ON for the
// connection-string path; let PG_SSL=false explicitly turn it off (local).
const wantSSL = useConnectionString
  ? process.env.PG_SSL !== "false"
  : process.env.PG_SSL === "true";

const sslOptions = wantSSL
  ? { ssl: { require: true, rejectUnauthorized: false } }
  : {};

// Small pool - serverless functions should hold few connections.
const pool = { max: 3, min: 0, idle: 10000, acquire: 30000 };

const sequelize = useConnectionString
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      pool,
      dialectOptions: sslOptions,
    })
  : new Sequelize(
      process.env.PG_DATABASE,
      process.env.PG_USER,
      process.env.PG_PASSWORD,
      {
        host: process.env.PG_HOST || "127.0.0.1",
        port: process.env.PG_PORT || 5432,
        dialect: "postgres",
        logging: false,
        pool,
        dialectOptions: sslOptions,
      }
    );

// connectDB is called on every serverless invocation, so cache the work:
// authenticate + sync run once per warm instance, not once per request.
let ready;

const connectDB = () => {
  if (!ready) {
    ready = (async () => {
      await sequelize.authenticate();
      console.log("PostgreSQL Connected");

      // Creates any missing tables to match the models.
      // NOTE: do NOT use { alter: true }. On Postgres it re-adds a new UNIQUE
      // constraint/index for `users.email` on every startup (users_email_key,
      // users_email_key1, ...), eventually making sync() throw on boot and
      // taking login/registration down with it. Use migrations for real
      // schema changes.
      await sequelize.sync();
      console.log("Database synced");
    })().catch((err) => {
      ready = undefined; // allow a retry on the next call
      throw err;
    });
  }
  return ready;
};

module.exports = { sequelize, connectDB };
