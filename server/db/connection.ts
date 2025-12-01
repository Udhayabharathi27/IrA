import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

/**
 * Create a single PostgreSQL connection pool
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

/**
 * Create Drizzle ORM instance using pool + schema
 */
export const db = drizzle(pool, {
  schema,
});

/**
 * Default export for convenience
 */
export default db;
