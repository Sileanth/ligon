import { type platform, type region, type RiotApi } from './client.js';
import { type queue_types, queues_ids } from './types.js';
import * as z from "zod";

const AccountDTO = z.object({
    puuid: z.string(),
    gameName: z.string(),
    tagLine: z.string(),
});

const SummonerDTO = z.object({
    puuid: z.string(),
    profileIconId: z.number(),
    revisionDate: z.number(),
    summonerLevel: z.number(),
});

// const RewardConfigDtoSchema = z.object({
//   rewardValue: z.string(),
//   rewardType: z.string(),
//   maximumReward: z.number().int(),
// });


const NextSeasonMilestoneDtoSchema = z.object({
  rewardMarks: z.number().int(),
  bonus: z.boolean(),
  totalGamesRequires: z.number().int(),
  requireGradeCounts: z.any(),
}).loose();


const ChampionMasteryDtoSchema = z.object({
  puuid: z.string(),
  championPointsUntilNextLevel: z.number().int(), 
 // chestGranted: z.boolean().optional(),
  championId: z.number().int(), 
  lastPlayTime: z.number().int(), 
  championLevel: z.number().int(),
  championPoints: z.number().int(),
  championPointsSinceLastLevel: z.number().int(), 
  markRequiredForNextLevel: z.number().int(),
  championSeasonMilestone: z.number().int(),
  nextSeasonMilestone: NextSeasonMilestoneDtoSchema,
  tokensEarned: z.number().int(),
  milestoneGrades: z.array(z.string()).optional(),
});

const ChampionMasteryListSchema = z.array(ChampionMasteryDtoSchema);

const MiniSeriesDtoSchema = z.object({
  losses: z.number().int(),
  progress: z.string(),
  target: z.number().int(),
  wins: z.number().int(),
});

export const LeagueEntryDtoSchema = z.object({
  leagueId: z.string(),
  puuid: z.string(),
  queueType: z.string(),
  tier: z.string(),
  rank: z.string(),
  leaguePoints: z.number().int(),
  wins: z.number().int(),
  losses: z.number().int(),
  hotStreak: z.boolean(),
  veteran: z.boolean(),
  freshBlood: z.boolean(),
  inactive: z.boolean(),
  miniSeries: MiniSeriesDtoSchema.optional(), 
});

const LeagueEntryListSchema = z.array(LeagueEntryDtoSchema);

export async function getLeagueEntriesByPUUID(puuid: string, platform: platform, riotApi: RiotApi) {
    let data = await riotApi.makeRequest(`/lol/league/v4/entries/by-puuid/${puuid}`, platform); 

    if (data.result === 'notFound') {
        return undefined;
    }

    if (data.result !== 'success') {
        throw new Error(`Error fetching league entries: ${data.data.message}`);
    }

    const parsed = LeagueEntryListSchema.safeParse(data.data);
    
    if (!parsed.success) {
        console.error(z.treeifyError(parsed.error));
        throw new Error(`Invalid league entry data format`);
    }

    return parsed.data;
}

export async function getChampionMasteriesByPUUID(puuid: string, platform: platform, riotApi: RiotApi) {
    let data = await riotApi.makeRequest(`/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`, platform); 
    if (data.result === 'notFound') {
        return undefined
    }
    if (data.result !== 'success') {
        throw new Error(`Error fetching champion masteries by PUUID: ${data.data.message}`);
    }
    const parsed = ChampionMasteryListSchema.safeParse(data.data);
    if (!parsed.success) {
        console.log(JSON.stringify(z.treeifyError(parsed.error), null, 2));
       
        //console.error(data.data);
        throw new Error(`Invalid champion mastery data format`);
    }
    return parsed.data;
}

export async function getSummonerByPUUID(puuid: string, platform: platform, riotApi: RiotApi) {
    let data = await riotApi.makeRequest(`/lol/summoner/v4/summoners/by-puuid/${puuid}`, platform);
    if (data.result === 'notFound') {
        return undefined
    }
    if (data.result !== 'success') {
        throw new Error(`Error fetching summoner by PUUID: ${data.data.message}`);
    }
    const parsed = SummonerDTO.safeParse(data.data);
    if (!parsed.success) {
        console.error(z.treeifyError(parsed.error));
        throw new Error(`Invalid summoner data format`);
    }
    return parsed.data;
}
   
export async function getAccountByPUUID(puuid: string, region: region, riotApi: RiotApi) {
    let data = await riotApi.makeRequest(`/riot/account/v1/accounts/by-puuid/${puuid}`, region);
    if (data.result === 'notFound') {
        return undefined
    }
    if (data.result !== 'success') {
        throw new Error(`Error fetching account by PUUID: ${data.data.message}`);
    }
    const parsed = AccountDTO.safeParse(data.data);
    if (!parsed.success) {
        console.error(z.treeifyError(parsed.error));
        throw new Error(`Invalid account data format`);
    }
    return parsed.data;
}

export async function getAccountByRiotId(gameName: string, tagLine: string, region: region, riotApi: RiotApi) {
    let data = await riotApi.makeRequest(`/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`, region);
    if (data.result === 'notFound') {
        return undefined
    }
    if (data.result !== 'success') {
        throw new Error(`Error fetching account by Riot ID: ${data.data.message}`);
    }
    const parsed = AccountDTO.safeParse(data.data);
    if (!parsed.success) {
        console.error(z.treeifyError(parsed.error));
        throw new Error(`Invalid account data format`);
    }
    return parsed.data;
}

export async function getMatchesByPUUID(
    puuid: string, riotApi: RiotApi, 
    region?: region, config?: {
        queue?: queues_ids, type?: queue_types,
        count?: number, startIndex?: number,
        startTime?: number, endTime?: number, 
    }) {

    if (!region) { region = 'europe'; }
    
    let endpoint = `/lol/match/v5/matches/by-puuid/${puuid}/ids?`;
    if (config?.count !== undefined) {
        endpoint += `&count=${config.count}`;
    }   
    if (config?.startTime !== undefined) {
        endpoint += `&startTime=${config.startTime}`;
    }  
    if (config?.endTime !== undefined) {
        endpoint += `&endTime=${config.endTime}`;
    }
    if (config?.queue !== undefined) {
        endpoint += `&queue=${config.queue}`;
    }
    if (config?.startIndex !== undefined) {
        endpoint += `&start=${config.startIndex}`;
    }


    let data = await riotApi.makeRequest(endpoint, region);
    if (data.result === 'notFound') {
        return undefined
    }
    if (data.result !== 'success') {
        throw new Error(`Error fetching matches by PUUID: ${data.data.message}`);
    }
    
    const parsed = z.array(z.string()).safeParse(data.data);
    if (!parsed.success) {
        console.error(z.treeifyError(parsed.error));
        throw new Error(`Invalid match IDs data format`);
    }   
    return parsed.data;
}