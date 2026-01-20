import { riotApi, type platform } from "./client.js";
import { leage_queues } from './types.js'
import * as z from "zod";

const LeageListDTO = z.object({
    leagueId: z.string(),
    tier: z.string(),
    queue: z.string(),
    name: z.string(),
    entries: z.array(
        z.object({
            puuid: z.string(),

            leaguePoints: z.number(),
            rank: z.string(),
            wins: z.number(),
            losses: z.number(),
            veteran: z.boolean(),
            inactive: z.boolean(),
            freshBlood: z.boolean(),
            hotStreak: z.boolean(),
            miniSeries: z.object({
                losses: z.number(),
                wins: z.number(),
                target: z.number(),
                progress: z.string(),
            }).optional(),
        })
    ),
})

export async function getGrandmasterLeage(queue: leage_queues, platform?: platform) {
    if (!platform) {
        platform = 'eun1';
    }

    let data = await riotApi.makeRequest(`/lol/league/v4/grandmasterleagues/by-queue/${queue}`, platform);

    if (data.result === 'notFound') {
        return undefined;
    }

    if (data.result !== 'success') {
        console.log(data);
        throw new Error(`Match API error [${queue}]: ${data.data?.status?.message || 'Unknown error'}`);
    }

    const parsed = LeageListDTO.safeParse(data.data);
    if (!parsed.success) {
        console.log(data.data);
        let err = z.treeifyError(parsed.error);
        console.error(`Match data format mismatch for ID: ${queue}`);
        console.error(err);
        throw new Error(`Match data format mismatch for ID: ${queue}`);
    }

    return parsed.data;

}

export async function getChallengerLeage(queue: leage_queues, platform?: platform) {
    if (!platform) {
        platform = 'eun1';
    }

    let data = await riotApi.makeRequest(`/lol/league/v4/challengerleagues/by-queue/${queue}`, platform);

    if (data.result === 'notFound') {
        return undefined;
    }

    if (data.result !== 'success') {
        throw new Error(`Match API error [${queue}]: ${data.data?.status?.message || 'Unknown error'}`);
    }

    const parsed = LeageListDTO.safeParse(data.data);
    if (!parsed.success) {
        let err = z.treeifyError(parsed.error);
        console.error(`Match data format mismatch for ID: ${queue}`);
        console.error(err);
        throw new Error(`Match data format mismatch for ID: ${queue}`);
    }

    return parsed.data;

}

export async function getMasterLeage(queue: leage_queues, platform?: platform) {
    if (!platform) {
        platform = 'eun1';
    }

    let data = await riotApi.makeRequest(`/lol/league/v4/masterleagues/by-queue/${queue}`, platform);

    if (data.result === 'notFound') {
        return undefined;
    }

    if (data.result !== 'success') {
        throw new Error(`Match API error [${queue}]: ${data.data?.status?.message || 'Unknown error'}`);
    }

    const parsed = LeageListDTO.safeParse(data.data);
    if (!parsed.success) {
        let err = z.treeifyError(parsed.error);
        console.error(`Match data format mismatch for ID: ${queue}`);
        console.error(err);
        throw new Error(`Match data format mismatch for ID: ${queue}`);
    }

    return parsed.data;

}   
