const { Sequelize } = require("sequelize");

// Supports either a single DATABASE_URL (recommended for hosted Postgres
// like Neon / Supabase / Render / Railway) OR individual PG_* fields
// (recommended for local Postgres installs).
const useConnectionString = !!process.env.DATABASE_URL;

const sequelize = useConnectionString
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions:
        process.env.PG_SSL === "true"
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
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
        dialectOptions:
          process.env.PG_SSL === "true"
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Connected");

    // Creates/updates tables to match the models below.
    // Safe for dev; for production prefer real migrations (see notes).
    await sequelize.sync({ alter: true });
    console.log("Database synced");
  } catch (err) {
    console.error("Unable to connect to PostgreSQL:", err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
