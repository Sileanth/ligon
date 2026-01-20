import { db } from "../db/pool.js";
import { riotApi, type region, } from "../riot/client.js";
import { getMatchById } from "../riot/match.js";
import { eq } from "drizzle-orm";
import { matches, participants } from "../db/schema.js";
import { getMatchesByPUUID } from "../riot/account.js";
import { soloq_id } from "../riot/types.js";
import { MatchDtoSchema } from "../riot/match.js";

export async function getByMatchId(matchId: string, region?: region) {
    if (!region) {
        region = 'europe';
    }
    const match = await db
        .select()
        .from(matches)
        .where(eq(matches.matchId, matchId))
        .limit(1);

    if (match.length !== 0) {
        console.log('Match already exists');
        console.log(match[0]);
        if (match[0].endOfGameResult === 'GameComplete') {
            console.log('Match already exists and is completed');
            return match[0];
        }
    }

    const matchData = await getMatchById(matchId, riotApi, region);
    if (!matchData) {
        return undefined;
    }

    const newMatch = {
        matchId: matchData.metadata.matchId,
        gameMode: matchData.info.gameMode,
        gameType: matchData.info.gameType,
        gameCreation: matchData.info.gameCreation,
        endOfGameResult: matchData.info.endOfGameResult ?? "na",
        gameVersion: matchData.info.gameVersion,
        mapId: matchData.info.mapId,
        queueId: matchData.info.queueId,
        platformId: matchData.info.platformId,
        lastUpdatedAt: new Date(),
        raw: matchData,
    };

    await db
        .insert(matches)
        .values(newMatch)
        .onConflictDoUpdate({
            target: matches.matchId,
            set: {
                gameMode: newMatch.gameMode,
                gameType: newMatch.gameType,
                gameCreation: newMatch.gameCreation,
                endOfGameResult: newMatch.endOfGameResult,
                gameVersion: newMatch.gameVersion,
                mapId: newMatch.mapId,
                queueId: newMatch.queueId,
                platformId: newMatch.platformId,
                lastUpdatedAt: newMatch.lastUpdatedAt,
                raw: newMatch.raw,
            }
        });

    matchData.info.participants.forEach(async (participant) => {
        const newParticipant = {
            matchId: matchData.metadata.matchId,
            puuid: participant.puuid!,
            championId: participant.championId!,
            teamId: participant.teamId!,
            win: participant.win,
            kills: participant.kills!,
            deaths: participant.deaths!,
            assists: participant.assists!,
            raw: participant,
            lastUpdatedAt: new Date(),
        };
        await db
            .insert(participants)
            .values(newParticipant)
            .onConflictDoUpdate({
                target: [participants.matchId, participants.puuid],
                set: {
                    win: newParticipant.win,
                    kills: newParticipant.kills,
                    deaths: newParticipant.deaths,
                    assists: newParticipant.assists,
                    raw: newParticipant.raw,
                    lastUpdatedAt: newParticipant.lastUpdatedAt,
                }
            });
    })


    return newMatch;
}


export async function getSoloMatches(puuid: string, region?: region, count?: number, start?: number) {
    if (!region) {
        region = 'europe';
    }

    const matches = await getMatchesByPUUID(puuid, riotApi, region, {
        queue: soloq_id,
        count: count ?? 10,
        startIndex: start ?? 0,

    });
    if (!matches) {
        return undefined;
    }
    let matchesData = await Promise.all(matches.map(async (matchId) => {
        let data = await getByMatchId(matchId, region);
        if (!data) {
            return undefined;
        }
        let extra = MatchDtoSchema.parse(data.raw)
        let new_data = { ...data, extra }
        return new_data;
    }));
    return matchesData;
}

