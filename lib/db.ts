import { Pool } from "pg";
import type { Episode } from "./types";

let pool: Pool | undefined;
function database(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set.");
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  return pool;
}

export async function saveEpisode(episode: Episode): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  const db = database();
  await db.query(`CREATE TABLE IF NOT EXISTS episodes (
    id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, summary TEXT NOT NULL,
    script JSONB NOT NULL, sources JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  await db.query("INSERT INTO episodes (title, summary, script, sources) VALUES ($1, $2, $3, $4)",
    [episode.title, episode.summary, JSON.stringify(episode.segments), JSON.stringify(episode.sources)]);
}
