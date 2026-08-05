import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "The optional hosted database binding is unavailable. Configure a server-side DB adapter before using database-backed features."
    );
  }

  return drizzle(env.DB, { schema });
}
