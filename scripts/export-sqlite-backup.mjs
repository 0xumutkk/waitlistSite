import Database from "better-sqlite3";
import { createClient } from "@supabase/supabase-js";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const outputPath = resolve(process.cwd(), process.env.SQLITE_BACKUP_PATH ?? ".data/perminal-backup.sqlite");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

mkdirSync(dirname(outputPath), { recursive: true });

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase
  .from("leaderboard_entries")
  .select("rank,user_id,username,avatar_url,referral_code,invites")
  .order("rank", { ascending: true });

if (error) throw error;

const db = new Database(outputPath);
db.exec(`
  drop table if exists leaderboard_entries_snapshot;
  create table leaderboard_entries_snapshot (
    rank integer not null,
    user_id text not null,
    username text not null,
    avatar_url text,
    referral_code text not null,
    invites integer not null
  );
`);

const insert = db.prepare(
  `insert into leaderboard_entries_snapshot
   (rank, user_id, username, avatar_url, referral_code, invites)
   values (@rank, @user_id, @username, @avatar_url, @referral_code, @invites)`,
);

const transaction = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

transaction(data ?? []);
db.close();

console.log(`SQLite leaderboard backup written to ${outputPath}`);

