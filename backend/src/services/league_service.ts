import { getChallengerLeage } from "../riot/leage.js";
import { db } from "../db/pool.js";
import { riot_accounts } from "../db/schema.js";
import { inArray } from "drizzle-orm";
import { accountByPuuid } from "./account.js";

export async function getTopPlayers() {
    // 1. Fetch Challenger league (Solo Q)
    const challengerLeage = await getChallengerLeage('RANKED_SOLO_5x5', 'eun1');
    if (!challengerLeage) return [];

    // 2. Extract PUUIDs
    const puuids = challengerLeage.entries.map(e => e.puuid);

    // 3. Resolve accounts from DB
    const existingAccounts = await db
        .select()
        .from(riot_accounts)
        .where(inArray(riot_accounts.puuid, puuids));

    const accountMap = new Map(existingAccounts.map(a => [a.puuid, a]));

    // 4. For players not in DB, we'll need to fetch them. 
    // To avoid hitting rate limits too hard in one go, we'll only resolve what we need for the top list.
    // However, the user wants a list. Let's resolve at least the top 50 carefully.
    const topEntries = challengerLeage.entries
        .sort((a, b) => b.leaguePoints - a.leaguePoints)
        .slice(0, 50);

    const resolvedPlayers = [];

    for (const entry of topEntries) {
        let account = accountMap.get(entry.puuid);

        if (!account) {
            try {
                // Fetch fresh from Riot and save to DB
                const freshAccount = await accountByPuuid(entry.puuid, 'europe', 'eun1');
                if (freshAccount) {
                    account = {
                        puuid: freshAccount.puuid,
                        gameName: freshAccount.gameName,
                        tagLine: freshAccount.tagLine,
                        profileIconId: freshAccount.profileIconId,
                        summonerLevel: freshAccount.summonerLevel,
                        lastUpdatedAt: freshAccount.lastUpdatedAt
                    };
                }
            } catch (error) {
                console.error(`Failed to resolve account for ${entry.puuid}:`, error);
            }
        }

        resolvedPlayers.push({
            name: account?.gameName || 'Unknown',
            tag: account?.tagLine || 'NA1',
            puuid: entry.puuid,
            profileIconId: account?.profileIconId || 0,
            level: account?.summonerLevel || 0,
            lp: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
            winrate: (entry.wins / (entry.wins + entry.losses)) * 100
        });
    }

    return resolvedPlayers;
}
