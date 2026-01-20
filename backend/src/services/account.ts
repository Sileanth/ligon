import { championMastery, riot_accounts, leagueEntries } from "../db/schema.js";
import { db } from "../db/pool.js";
import { riotApi, type region, type platform} from "../riot/client.js";
import { getAccountByPUUID, getSummonerByPUUID, getAccountByRiotId, getChampionMasteriesByPUUID, getLeagueEntriesByPUUID } from "../riot/account.js";
import { eq, and, sql } from "drizzle-orm";


export async function getSoloQ(puuid: string, platform?: platform) {
    if (!platform) {
        platform = 'eun1';
    }

    const soloqEntry = await db
        .select()
        .from(leagueEntries)
        .where(and(
            eq(leagueEntries.puuid, puuid),
            eq(leagueEntries.queueType, 'RANKED_SOLO_5x5')
        ))
        .orderBy(sql`date DESC`)
        .limit(1);
    if (soloqEntry.length !== 0 && (new Date().getTime() - soloqEntry[0].date.getTime()) < 1 * 60 * 1000) {
        return soloqEntry[0];
    }

    const leagueEntriesData = await getLeagueEntriesByPUUID(puuid, platform, riotApi);
    if (!leagueEntriesData) {
        return undefined;
    }

    const soloqData = leagueEntriesData.find(entry => entry.queueType === 'RANKED_SOLO_5x5');
    if (!soloqData) {
        if (soloqEntry.length !== 0) {
            return soloqEntry[0];
        }
        return undefined;
    }

    const newLeagueEntries = {
        puuid: puuid,
        leagueId: soloqData.leagueId,
        queueType: soloqData.queueType,
        tier: soloqData.tier,
        rank: soloqData.rank,
        leaguePoints: soloqData.leaguePoints,
        wins: soloqData.wins,
        losses: soloqData.losses,
        veteran: soloqData.veteran,
        inactive: soloqData.inactive,
        freshBlood: soloqData.freshBlood,
        hotStreak: soloqData.hotStreak,
        miniSeriesWins: soloqData.miniSeries?.wins,
        miniSeriesLosses: soloqData.miniSeries?.losses,
        miniSeriesTarget: soloqData.miniSeries?.target,
        miniSeriesProgress: soloqData.miniSeries?.progress,
        date: new Date(),
    };
    await db
        .insert(leagueEntries)
        .values(newLeagueEntries);
    return newLeagueEntries;
}

export async function accountByPuuid(puuid: string, region?: region, platform?: platform) {
    if (!region) {
        region = 'europe';
    }
    if (!platform) {
        platform = 'eun1';
    }
    const account = await db
        .select()
        .from(riot_accounts)
        .where(eq(riot_accounts.puuid, puuid))
        .limit(1);
    if (account.length !== 0 && (new Date().getTime() - account[0].lastUpdatedAt.getTime()) < 24 * 60 * 60 * 1000) {
        const soloqData = await getSoloQ(account[0].puuid, platform);

        return { ...account[0], soloq: soloqData };
    }
    console.log("Fetching fresh account data from Riot API");


    const accountData = await getAccountByPUUID(puuid, region, riotApi);
    if (!accountData) {
        return undefined;
    }
    const summonerData = await getSummonerByPUUID(puuid, platform, riotApi);
    if (!summonerData) {
        return undefined;
    }

    const newAccount = {
        puuid: accountData.puuid,
        gameName: accountData.gameName,
        tagLine: accountData.tagLine,
        profileIconId: summonerData.profileIconId,
        summonerLevel: summonerData.summonerLevel,
        lastUpdatedAt: new Date(),
    };
    
    await db
        .insert(riot_accounts)
        .values(newAccount)
        .onConflictDoUpdate({
            target: riot_accounts.puuid,
            set: {
                gameName: newAccount.gameName,
                tagLine: newAccount.tagLine,
                profileIconId: newAccount.profileIconId,
                summonerLevel: newAccount.summonerLevel,
                lastUpdatedAt: new Date(),
            },
        });

    const soloqData = await getSoloQ(puuid, platform);

    return { ...newAccount, soloq: soloqData };
}

export async function accountByRiotId(gameName: string, tagLine: string, region?: region, platform?: platform) { 
    if (!region) {
        region = 'europe';
    }
    if (!platform) {
        platform = 'eun1';
    }
    const account = await db
        .select()
        .from(riot_accounts)
        .where(and(eq(riot_accounts.gameName, gameName), eq(riot_accounts.tagLine, tagLine)))
        .limit(1);
    if (account.length !== 0 && (new Date().getTime() - account[0].lastUpdatedAt.getTime()) < 24 * 60 * 60 * 1000) {
        console.log("Returning cached account");
        const soloqData = await getSoloQ(account[0].puuid, platform);

        return { ...account[0], soloq: soloqData };
    }
    console.log("Fetching fresh account data from Riot API");

    const accountData = await getAccountByRiotId(gameName, tagLine, region, riotApi);
    if (!accountData) {
        return undefined;
    }
    console.log("Fetched account data:", accountData);
    const summonerData = await getSummonerByPUUID(accountData.puuid, platform, riotApi);
    if (!summonerData) {
        return undefined;
    }

    const newAccount = {
        puuid: accountData.puuid,
        gameName: accountData.gameName,
        tagLine: accountData.tagLine,
        profileIconId: summonerData.profileIconId,
        summonerLevel: summonerData.summonerLevel,
        lastUpdatedAt: new Date(),
    };
    
    await db
        .insert(riot_accounts)
        .values(newAccount)
        .onConflictDoUpdate({
            target: riot_accounts.puuid,
            set: {
                gameName: newAccount.gameName,
                tagLine: newAccount.tagLine,
                profileIconId: newAccount.profileIconId,
                summonerLevel: newAccount.summonerLevel,
                lastUpdatedAt: new Date(),
            },
        });
    console.log("Returning new account");
    const soloqData = await getSoloQ(accountData.puuid, platform);

    return { ...newAccount, soloq: soloqData };
    
}

export async function getChampionMastery(puuid: string, championId: number, platform?: platform) {
    if (!platform) {
        platform = 'eun1';
    }
    let mastery = await db
        .select()
        .from(championMastery)
        .where(and(eq(championMastery.puuid, puuid), eq(championMastery.championId, championId)))
        .limit(1);
     if (mastery.length !== 0 && (new Date().getTime() - mastery[0].updatedAt.getTime()) < 24 * 60 * 60 * 1000) {
        return mastery[0];
    }

    const masteryData = await getChampionMasteriesByPUUID(puuid, platform, riotApi);
    if (!masteryData) {
        return undefined;
    }

    const newMastery = masteryData.map(m => {
        return {
            puuid: puuid,
            championId: m.championId,
            championLevel: m.championLevel,
            championPoints: m.championPoints,
            updatedAt: new Date(),
        }
    })
       

    await db
        .insert(championMastery)
        .values(newMastery)
        .onConflictDoUpdate({
            target: [championMastery.puuid, championMastery.championId],
            set: {
                championLevel: sql.raw(`excluded.${championMastery.championLevel.name}`),
                championPoints: sql.raw(`excluded.${championMastery.championPoints.name}`),
                updatedAt: new Date(),
            },
        });

    return newMastery.find(m => m.championId === championId);
}

// todo fix
export async function getLeageEntries(puuid: string, platform?: platform) {
    if (!platform) {
        platform = 'eun1';
    }
    const entries = await db.
        select()
        .from(leagueEntries)
        .where(eq(leagueEntries.puuid, puuid))
        .orderBy(sql`date DESC`)
        .limit(1);

    if (entries.length !== 0 && (new Date().getTime() - entries[0].date.getTime()) < 60 * 60 * 1000) {
        return entries;
    }
    const leagueData = await getLeagueEntriesByPUUID(puuid, platform, riotApi);
    if (!leagueData) {
        return undefined;
    }
    
    const newEntries = leagueData.map(entry => ({ 
        puuid: puuid,
        leagueId: entry.leagueId,
        queueType: entry.queueType,
        tier: entry.tier,
        rank: entry.rank,
        leaguePoints: entry.leaguePoints,
        wins: entry.wins,
        losses: entry.losses,
        veteran: entry.veteran,
        inactive: entry.inactive,
        freshBlood: entry.freshBlood,
        hotStreak: entry.hotStreak,
        miniSeriesWins: entry.miniSeries?.wins || null,
        miniSeriesLosses: entry.miniSeries?.losses || null,
        miniSeriesTarget: entry.miniSeries?.target || null,
        miniSeriesProgress: entry.miniSeries?.progress || null,
        date: new Date(),
    }));

    
    await db
        .insert(leagueEntries)
        .values(newEntries);
    

    return newEntries;
}