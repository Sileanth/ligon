import { integer, char, pgTable, timestamp, varchar, boolean, jsonb, serial, primaryKey, bigint, unique } from "drizzle-orm/pg-core";

export const riot_accounts = pgTable("riot_accounts", {
  puuid: varchar("puuid", { length: 78 }).primaryKey(),
  gameName: varchar("game_name", { length: 1000 }).notNull(),
  tagLine: varchar("tag_line", { length: 100 }).notNull(),
  profileIconId: integer("profile_icon_id").notNull(),
  summonerLevel: integer("summoner_level").notNull(),
  lastUpdatedAt: timestamp("last_updated_at").notNull(),
});


export const championMastery = pgTable("champion_mastery", {
  puuid: varchar("puuid", { length: 78 }).notNull().references(() => riot_accounts.puuid),
  championId: integer("champion_id").notNull(),
  championLevel: integer("champion_level").notNull(),
  championPoints: integer("champion_points").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
}, table => {
  return {
    pk: primaryKey(table.puuid, table.championId),
  };
});

export const leagueEntries = pgTable("league_entries", {
  id: serial("id").primaryKey(),
  puuid: varchar("puuid", { length: 78 }).notNull().references(() => riot_accounts.puuid),
  leagueId: varchar("league_id", { length: 1000 }).notNull(),
  queueType: varchar("queue_type", { length: 1000 }).notNull(),
  tier: char("tier", { length: 100 }).notNull(),
  rank: char("rank", { length: 100 }).notNull(),
  leaguePoints: integer("league_points").notNull(),
  wins: integer("wins").notNull(),
  losses: integer("losses").notNull(),
  veteran: boolean("veteran").notNull(),
  inactive: boolean("inactive").notNull(),
  freshBlood: boolean("fresh_blood").notNull(),
  hotStreak: boolean("hot_streak").notNull(),
  miniSeriesWins: integer("mini_series_wins"),
  miniSeriesLosses: integer("mini_series_losses"),
  miniSeriesTarget: integer("mini_series_target"),
  miniSeriesProgress: varchar("mini_series_progress", { length: 1000 }),
  date: timestamp("date").notNull(),
});

export const matches = pgTable("matches", {
  matchId: varchar("match_id", { length: 78 }).primaryKey(),
  gameMode: varchar("game_mode", { length: 1000 }).notNull(),
  gameType: varchar("game_type", { length: 1000 }).notNull(),
  gameCreation: bigint("game_creation", { mode: "number" }).notNull(),
  endOfGameResult: varchar("end_of_game_result", { length: 1000 }).notNull(),
  gameVersion: char("game_version", { length: 100 }).notNull(),
  mapId: integer("map_id").notNull(),
  platformId: varchar("platform_id", { length: 100 }).notNull(),
  queueId: integer("queue_id").notNull(),
  raw: jsonb("raw").notNull(),
  lastUpdatedAt: timestamp("last_updated_at").notNull(),
});

export const participants = pgTable("participants", {
  matchId: varchar("match_id", { length: 78 }).notNull(),
  puuid: varchar("puuid", { length: 78 }).notNull(),
  championId: integer("champion_id").notNull(),
  teamId: integer("team_id").notNull(),
  win: boolean("win"),
  kills: integer("kills").notNull(),
  deaths: integer("deaths").notNull(),
  assists: integer("assists").notNull(),
  raw: jsonb("raw").notNull(),
  lastUpdatedAt: timestamp("last_updated_at").notNull(),
}, (t) => {
  return [
    unique().on(t.matchId, t.puuid),
  ]

});
