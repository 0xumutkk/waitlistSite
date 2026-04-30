import { chmodSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Database from "better-sqlite3";

import { createReferralCode, usernameToReferralCode } from "@/lib/referrals/code";
import type {
  LeaderboardEntry,
  LocalUser,
  MeResponse,
  PrivyProfile,
  ReferralVisitInput,
} from "@/lib/referrals/types";
import { getOptionalEnv } from "@/lib/server/env";

type UserRow = {
  id: string;
  privy_user_id: string;
  email: string | null;
  twitter_username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  referral_code: string;
  created_at: string;
  last_login_at: string;
};

type LeaderboardRow = {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  referral_code: string;
  invites: number;
};

type DbAdapter = {
  getUserByPrivyId(privyUserId: string): Promise<LocalUser | null>;
  getUserByReferralCode(referralCode: string): Promise<LocalUser | null>;
  upsertUser(profile: PrivyProfile): Promise<{ user: LocalUser; isNew: boolean }>;
  recordReferralVisit(input: ReferralVisitInput): Promise<void>;
  createVerifiedReferral(input: {
    referrerUserId: string;
    referredUserId: string;
    referralCode: string;
  }): Promise<boolean>;
  getMe(userId: string, origin: string): Promise<MeResponse>;
  getLeaderboard(input: { limit: number; currentUserId?: string | null }): Promise<LeaderboardEntry[]>;
};

let adapter: DbAdapter | null = null;

export function getDb(): DbAdapter {
  if (adapter) return adapter;

  const databaseUrl = getOptionalEnv("DATABASE_URL");
  if (databaseUrl?.startsWith("sqlite:") || databaseUrl?.startsWith("file:")) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SQLite DATABASE_URL is not allowed in production. Use Supabase as the writer.");
    }

    adapter = new SqliteAdapter(databaseUrl);
    return adapter;
  }

  const supabaseUrl =
    getOptionalEnv("SUPABASE_URL") ??
    getOptionalEnv("EXPO_PUBLIC_SUPABASE_URL") ??
    getOptionalEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceRoleKey = getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (supabaseUrl && supabaseServiceRoleKey) {
    adapter = new SupabaseAdapter(supabaseUrl, supabaseServiceRoleKey);
    return adapter;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Supabase is required in production. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL, plus SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  adapter = new SqliteAdapter(getOptionalEnv("SQLITE_BACKUP_PATH") ?? "sqlite:.data/perminal.sqlite");
  return adapter;
}

function toLocalUser(row: UserRow): LocalUser {
  return {
    id: row.id,
    privyUserId: row.privy_user_id,
    email: row.email,
    twitterUsername: row.twitter_username,
    displayName: row.display_name ?? "Perminal user",
    avatarUrl: row.avatar_url,
    referralCode: row.referral_code,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

function toLeaderboardEntry(row: LeaderboardRow, currentUserId?: string | null): LeaderboardEntry {
  return {
    rank: Number(row.rank),
    userId: row.user_id,
    username: row.username,
    avatarUrl: row.avatar_url,
    referralCode: row.referral_code,
    invites: Number(row.invites),
    isUser: row.user_id === currentUserId,
  };
}

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, "");
}

function createReferralLink(origin: string, code: string): string {
  return `${normalizeOrigin(origin)}/r/${encodeURIComponent(code)}`;
}

async function createUniqueReferralCode(
  findUser: (code: string) => Promise<LocalUser | null>,
  preferredUsername?: string | null,
): Promise<string> {
  if (preferredUsername) {
    const usernameCode = usernameToReferralCode(preferredUsername);
    if (usernameCode && !(await findUser(usernameCode))) return usernameCode;
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = createReferralCode();
    if (!(await findUser(code))) return code;
  }

  throw new Error("Unable to create a unique referral code");
}

class SupabaseAdapter implements DbAdapter {
  private client: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async getUserByPrivyId(privyUserId: string): Promise<LocalUser | null> {
    const { data, error } = await this.client.from("waitlist_users").select("*").eq("privy_user_id", privyUserId).maybeSingle();
    if (error) throw error;
    return data ? toLocalUser(data as UserRow) : null;
  }

  async getUserByReferralCode(referralCode: string): Promise<LocalUser | null> {
    const { data, error } = await this.client.from("waitlist_users").select("*").eq("referral_code", referralCode).maybeSingle();
    if (error) throw error;
    if (data) return toLocalUser(data as UserRow);

    const { data: aliasData, error: aliasError } = await this.client
      .from("waitlist_referral_code_aliases")
      .select("user_id")
      .eq("alias_code", referralCode)
      .maybeSingle();
    if (aliasError) throw aliasError;
    if (!aliasData) return null;

    const { data: userData, error: userError } = await this.client
      .from("waitlist_users")
      .select("*")
      .eq("id", aliasData.user_id)
      .single();
    if (userError) throw userError;
    return toLocalUser(userData as UserRow);
  }

  async upsertUser(profile: PrivyProfile): Promise<{ user: LocalUser; isNew: boolean }> {
    const existing = await this.findExistingUser(profile);
    const now = new Date().toISOString();

    if (existing) {
      const { data, error } = await this.client
        .from("waitlist_users")
        .update({
          privy_user_id: profile.privyUserId,
          email: profile.email ?? existing.email,
          twitter_username: profile.twitterUsername ?? existing.twitterUsername,
          display_name: profile.displayName ?? existing.displayName,
          avatar_url: profile.avatarUrl ?? existing.avatarUrl,
          last_login_at: now,
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) throw error;
      return { user: toLocalUser(data as UserRow), isNew: false };
    }

    const referralCode = await createUniqueReferralCode((code) => this.getUserByReferralCode(code), profile.twitterUsername);
    const { data, error } = await this.client
      .from("waitlist_users")
      .insert({
        privy_user_id: profile.privyUserId,
        email: profile.email,
        twitter_username: profile.twitterUsername,
        display_name: profile.displayName,
        avatar_url: profile.avatarUrl,
        referral_code: referralCode,
        last_login_at: now,
      })
      .select("*")
      .single();

    if (error) throw error;

    const user = toLocalUser(data as UserRow);
    await this.ensureStats(user.id);
    return { user, isNew: true };
  }

  private async findExistingUser(profile: PrivyProfile): Promise<LocalUser | null> {
    const byPrivyId = await this.getUserByPrivyId(profile.privyUserId);
    if (byPrivyId) return byPrivyId;

    if (profile.email) {
      const { data, error } = await this.client
        .from("waitlist_users")
        .select("*")
        .ilike("email", profile.email)
        .maybeSingle();
      if (error) throw error;
      if (data) return toLocalUser(data as UserRow);
    }

    if (profile.twitterUsername) {
      const { data, error } = await this.client
        .from("waitlist_users")
        .select("*")
        .ilike("twitter_username", profile.twitterUsername)
        .maybeSingle();
      if (error) throw error;
      if (data) return toLocalUser(data as UserRow);
    }

    return null;
  }

  async recordReferralVisit(input: ReferralVisitInput): Promise<void> {
    const { error } = await this.client.from("waitlist_referral_visits").insert({
      referral_code: input.referralCode,
      visitor_fingerprint_hash: input.visitorFingerprintHash,
      ip_hash: input.ipHash,
      user_agent_hash: input.userAgentHash,
    });

    if (error) throw error;
  }

  async createVerifiedReferral(input: {
    referrerUserId: string;
    referredUserId: string;
    referralCode: string;
  }): Promise<boolean> {
    const { error } = await this.client.from("waitlist_referrals").insert({
      referrer_user_id: input.referrerUserId,
      referred_user_id: input.referredUserId,
      referral_code: input.referralCode,
      status: "verified",
    });

    if (error) {
      if ("code" in error && error.code === "23505") return false;
      throw error;
    }

    await this.refreshStats(input.referrerUserId);
    await this.ensureStats(input.referredUserId);
    return true;
  }

  async getMe(userId: string, origin: string): Promise<MeResponse> {
    const { data: userData, error: userError } = await this.client.from("waitlist_users").select("*").eq("id", userId).single();
    if (userError) throw userError;

    const { data: rankData, error: rankError } = await this.client
      .from("waitlist_leaderboard_entries")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (rankError) throw rankError;

    const user = toLocalUser(userData as UserRow);
    const rankRow = rankData as LeaderboardRow;

    return {
      user,
      rank: Number(rankRow.rank),
      invites: Number(rankRow.invites),
      referralLink: createReferralLink(origin, user.referralCode),
    };
  }

  async getLeaderboard(input: { limit: number; currentUserId?: string | null }): Promise<LeaderboardEntry[]> {
    const { data, error } = await this.client
      .from("waitlist_leaderboard_entries")
      .select("*")
      .order("rank", { ascending: true })
      .limit(input.limit);

    if (error) {
      const backupEntries = readSqliteLeaderboardBackup(input.limit, input.currentUserId);
      if (backupEntries) return backupEntries;
      throw error;
    }

    const rows = (data ?? []) as LeaderboardRow[];
    const hasCurrentUser = input.currentUserId ? rows.some((row) => row.user_id === input.currentUserId) : true;

    if (input.currentUserId && !hasCurrentUser) {
      const { data: currentUserData, error: currentUserError } = await this.client
        .from("waitlist_leaderboard_entries")
        .select("*")
        .eq("user_id", input.currentUserId)
        .maybeSingle();

      if (currentUserError) throw currentUserError;
      if (currentUserData) rows.push(currentUserData as LeaderboardRow);
    }

    return rows.map((row) => toLeaderboardEntry(row, input.currentUserId));
  }

  private async ensureStats(userId: string): Promise<void> {
    const { error } = await this.client
      .from("waitlist_leaderboard_stats")
      .upsert({ user_id: userId, verified_invites_count: 0 }, { onConflict: "user_id", ignoreDuplicates: true });
    if (error) throw error;
  }

  private async refreshStats(userId: string): Promise<void> {
    const { error } = await this.client.rpc("increment_invite_count", { p_user_id: userId });
    if (error) throw error;
  }
}

function readSqliteLeaderboardBackup(limit: number, currentUserId?: string | null): LeaderboardEntry[] | null {
  const configuredPath = getOptionalEnv("SQLITE_BACKUP_PATH");
  if (!configuredPath) return null;

  try {
    const db = new Database(resolve(/*turbopackIgnore: true*/ process.cwd(), configuredPath.replace(/^sqlite:/, "").replace(/^file:/, "")), {
      readonly: true,
      fileMustExist: true,
    });
    const rows = db
      .prepare("select * from waitlist_leaderboard_entries_snapshot order by rank asc limit ?")
      .all(limit) as LeaderboardRow[];
    db.close();

    return rows.map((row) => toLeaderboardEntry(row, currentUserId));
  } catch {
    return null;
  }
}

function hardenSqlitePath(filePath: string): void {
  try {
    chmodSync(dirname(filePath), 0o700);
    chmodSync(filePath, 0o600);
  } catch {
    // Best-effort local hardening; database access should not fail solely due to chmod support.
  }
}

class SqliteAdapter implements DbAdapter {
  private db: Database.Database;

  constructor(databaseUrl: string) {
    const filePath = this.getFilePath(databaseUrl);
    mkdirSync(dirname(filePath), { recursive: true });
    this.db = new Database(filePath);
    hardenSqlitePath(filePath);
    this.db.pragma("foreign_keys = ON");
    this.ensureSchema();
  }

  async getUserByPrivyId(privyUserId: string): Promise<LocalUser | null> {
    const row = this.db.prepare("select * from waitlist_users where privy_user_id = ?").get(privyUserId) as UserRow | undefined;
    return row ? toLocalUser(row) : null;
  }

  async getUserByReferralCode(referralCode: string): Promise<LocalUser | null> {
    const row = this.db.prepare("select * from waitlist_users where referral_code = ?").get(referralCode) as UserRow | undefined;
    if (row) return toLocalUser(row);

    const alias = this.db
      .prepare("select user_id from waitlist_referral_code_aliases where alias_code = ?")
      .get(referralCode) as { user_id: string } | undefined;
    if (!alias) return null;

    const aliasRow = this.db.prepare("select * from waitlist_users where id = ?").get(alias.user_id) as UserRow | undefined;
    return aliasRow ? toLocalUser(aliasRow) : null;
  }

  async upsertUser(profile: PrivyProfile): Promise<{ user: LocalUser; isNew: boolean }> {
    const existing = await this.findExistingUser(profile);
    const now = new Date().toISOString();

    if (existing) {
      this.db
        .prepare(
          `update waitlist_users
           set privy_user_id = ?, email = ?, twitter_username = ?, display_name = ?, avatar_url = ?, last_login_at = ?
           where id = ?`,
        )
        .run(
          profile.privyUserId,
          profile.email ?? existing.email,
          profile.twitterUsername ?? existing.twitterUsername,
          profile.displayName ?? existing.displayName,
          profile.avatarUrl ?? existing.avatarUrl,
          now,
          existing.id,
        );

      return { user: (await this.getUserByPrivyId(profile.privyUserId)) ?? existing, isNew: false };
    }

    const referralCode = await createUniqueReferralCode((code) => this.getUserByReferralCode(code), profile.twitterUsername);
    const id = randomUUID();

    this.db
      .prepare(
        `insert into waitlist_users (id, privy_user_id, email, twitter_username, display_name, avatar_url, referral_code, last_login_at)
         values (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        profile.privyUserId,
        profile.email,
        profile.twitterUsername,
        profile.displayName,
        profile.avatarUrl,
        referralCode,
        now,
      );

    this.ensureStats(id);
    const user = await this.getUserByPrivyId(profile.privyUserId);
    if (!user) throw new Error("Failed to read newly created user");

    return { user, isNew: true };
  }

  private async findExistingUser(profile: PrivyProfile): Promise<LocalUser | null> {
    const byPrivyId = await this.getUserByPrivyId(profile.privyUserId);
    if (byPrivyId) return byPrivyId;

    if (profile.email) {
      const row = this.db
        .prepare("select * from waitlist_users where lower(email) = lower(?)")
        .get(profile.email) as UserRow | undefined;
      if (row) return toLocalUser(row);
    }

    if (profile.twitterUsername) {
      const row = this.db
        .prepare("select * from waitlist_users where lower(twitter_username) = lower(?)")
        .get(profile.twitterUsername) as UserRow | undefined;
      if (row) return toLocalUser(row);
    }

    return null;
  }

  async recordReferralVisit(input: ReferralVisitInput): Promise<void> {
    this.db
      .prepare(
        `insert into waitlist_referral_visits (id, referral_code, visitor_fingerprint_hash, ip_hash, user_agent_hash)
         values (?, ?, ?, ?, ?)`,
      )
      .run(
        randomUUID(),
        input.referralCode,
        input.visitorFingerprintHash,
        input.ipHash,
        input.userAgentHash,
      );
  }

  async createVerifiedReferral(input: {
    referrerUserId: string;
    referredUserId: string;
    referralCode: string;
  }): Promise<boolean> {
    try {
      this.db
        .prepare(
          `insert into waitlist_referrals (id, referrer_user_id, referred_user_id, referral_code, status)
           values (?, ?, ?, ?, 'verified')`,
        )
        .run(randomUUID(), input.referrerUserId, input.referredUserId, input.referralCode);
    } catch (error) {
      if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) return false;
      throw error;
    }

    this.refreshStats(input.referrerUserId);
    this.ensureStats(input.referredUserId);
    return true;
  }

  async getMe(userId: string, origin: string): Promise<MeResponse> {
    const userRow = this.db.prepare("select * from waitlist_users where id = ?").get(userId) as UserRow | undefined;
    const rankRow = this.db.prepare("select * from waitlist_leaderboard_entries where user_id = ?").get(userId) as
      | LeaderboardRow
      | undefined;

    if (!userRow || !rankRow) throw new Error("User not found");

    const user = toLocalUser(userRow);
    return {
      user,
      rank: Number(rankRow.rank),
      invites: Number(rankRow.invites),
      referralLink: createReferralLink(origin, user.referralCode),
    };
  }

  async getLeaderboard(input: { limit: number; currentUserId?: string | null }): Promise<LeaderboardEntry[]> {
    const rows = this.db
      .prepare("select * from waitlist_leaderboard_entries order by rank asc limit ?")
      .all(input.limit) as LeaderboardRow[];

    if (input.currentUserId && !rows.some((row) => row.user_id === input.currentUserId)) {
      const currentRow = this.db
        .prepare("select * from waitlist_leaderboard_entries where user_id = ?")
        .get(input.currentUserId) as LeaderboardRow | undefined;
      if (currentRow) rows.push(currentRow);
    }

    return rows.map((row) => toLeaderboardEntry(row, input.currentUserId));
  }

  private getFilePath(databaseUrl: string): string {
    const path = databaseUrl.replace(/^sqlite:/, "").replace(/^file:/, "");
    return resolve(/*turbopackIgnore: true*/ process.cwd(), path);
  }

  private ensureStats(userId: string): void {
    this.db
      .prepare("insert or ignore into waitlist_leaderboard_stats (user_id, verified_invites_count) values (?, 0)")
      .run(userId);
  }

  private refreshStats(userId: string): void {
    const row = this.db
      .prepare("select count(*) as count from waitlist_referrals where referrer_user_id = ? and status = 'verified'")
      .get(userId) as { count: number };

    this.db
      .prepare(
        `insert into waitlist_leaderboard_stats (user_id, verified_invites_count, updated_at)
         values (?, ?, current_timestamp)
         on conflict(user_id) do update set
           verified_invites_count = excluded.verified_invites_count,
           updated_at = current_timestamp`,
      )
      .run(userId, row.count);
  }

  private ensureSchema(): void {
    this.db.exec(`
      create table if not exists waitlist_users (
        id text primary key,
        privy_user_id text not null unique,
        email text,
        twitter_username text,
        display_name text,
        avatar_url text,
        referral_code text not null unique,
        created_at text not null default current_timestamp,
        last_login_at text not null default current_timestamp
      );

      create table if not exists waitlist_referral_visits (
        id text primary key,
        referral_code text not null,
        visitor_fingerprint_hash text,
        ip_hash text,
        user_agent_hash text,
        created_at text not null default current_timestamp
      );

      create table if not exists waitlist_referral_code_aliases (
        alias_code text primary key,
        user_id text not null references waitlist_users(id) on delete cascade,
        created_at text not null default current_timestamp,
        check (length(alias_code) >= 3)
      );

      create table if not exists waitlist_referrals (
        id text primary key,
        referrer_user_id text not null references waitlist_users(id) on delete cascade,
        referred_user_id text not null unique references waitlist_users(id) on delete cascade,
        referral_code text not null,
        status text not null check (status = 'verified'),
        created_at text not null default current_timestamp,
        check (referrer_user_id <> referred_user_id)
      );

      create table if not exists waitlist_leaderboard_stats (
        user_id text primary key references waitlist_users(id) on delete cascade,
        verified_invites_count integer not null default 0,
        rank_cache integer,
        updated_at text not null default current_timestamp
      );

      create index if not exists waitlist_referrals_referrer_status_idx on waitlist_referrals(referrer_user_id, status);
      create index if not exists waitlist_referral_visits_code_created_idx on waitlist_referral_visits(referral_code, created_at);
      create unique index if not exists waitlist_users_email_unique_idx on waitlist_users(lower(email)) where email is not null;
      create unique index if not exists waitlist_users_twitter_unique_idx on waitlist_users(lower(twitter_username)) where twitter_username is not null;

      create view if not exists waitlist_leaderboard_entries as
        select
          row_number() over (
            order by coalesce(ls.verified_invites_count, 0) desc, u.created_at asc
          ) as rank,
          u.id as user_id,
          coalesce(nullif(u.twitter_username, ''), nullif(u.display_name, ''), 'Perminal user') as username,
          u.avatar_url,
          u.referral_code,
          coalesce(ls.verified_invites_count, 0) as invites
        from waitlist_users u
        left join waitlist_leaderboard_stats ls on ls.user_id = u.id;
    `);
  }
}
