import { hc } from 'hono/client'
import type { AccountByRiotIdApi } from '../../../backend/src/server/accounts.ts'
import type { RouteSoloqByPuuid, RouteMatchByMatchId } from '../../../backend/src/server/match.ts'
import type { TierlistApi } from '../../../backend/src/server/tierlist.ts'
import type { PlayersApi } from '../../../backend/src/server/players.ts'
import { type InferResponseType } from "hono/client"

const token = import.meta.env.VITE_CLIENT_TOKEN;
if (!token) {
    throw new Error('VITE_CLIENT_TOKEN is not set in environment variables');
}


export const accountByRiotId = hc<AccountByRiotIdApi>('http://localhost:3002/api/account/', {
    headers: {
        Authorization: `Bearer ${token}`,
    },
}).riotId[':gameName'][':tagLine'].$get;
export type AccountData = Exclude<InferResponseType<typeof accountByRiotId>, { error: string }>


export const soloqByPuuid = hc<RouteSoloqByPuuid>('http://localhost:3002/api/match/', {
    headers: {
        Authorization: `Bearer ${token}`,
    },
}).soloq[':puuid'].$get;

export type SoloqData = Exclude<InferResponseType<typeof soloqByPuuid>, { error: string }>

export const matchByMatchId = hc<RouteMatchByMatchId>('http://localhost:3002/api/match/', {
    headers: {
        Authorization: `Bearer ${token}`,
    },
})[':matchId'].$get;
export type MatchData = Exclude<InferResponseType<typeof matchByMatchId>, { error: string }>

const tierlistClient: any = hc<TierlistApi>('http://localhost:3002/api/tierlist/', {
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

const playersClient: any = hc<PlayersApi>('http://localhost:3002/api/players/', {
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export interface TopPlayer {
    name: string
    tag: string
    puuid: string
    profileIconId: number
    level: number
    lp: number
    wins: number
    losses: number
    winrate: number
}

export const getChallengerPlayers = async (): Promise<TopPlayer[]> => {
    const res = await playersClient.challenger.$get();
    if (!res.ok) {
        throw new Error('Failed to fetch top players');
    }
    return await res.json() as TopPlayer[];
}

export interface TierlistEntry {
    champion_id: string
    champion_name: string
    role: 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT'
    winrate: number
    games: number
    tier: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D'
    banrate: number
}

export const getTierlist = async (): Promise<TierlistEntry[]> => {
    const res = await tierlistClient.$get();
    if (!res.ok) {
        throw new Error('Failed to fetch tierlist');
    }
    return await res.json() as any;
}

export interface CoreItemBuild {
    items: number[]
    winrate: number
    playrate: number
}

export interface SituationalItem {
    itemId: number
    winrate: number
    playrate: number
}

export interface Matchup {
    championId: string
    championName: string
    winrate: number
    playrate: number
}

export interface ChampionStats {
    name: string
    title: string
    winrate: number
    playrate: number
    banrate: number
    avgKills: number
    avgDeaths: number
    avgAssists: number
    coreBuilds: CoreItemBuild[]
    situationalItems: SituationalItem[]
    matchups: Matchup[]
}

import { getChampionTitle } from './getIcons'

export const getChampionStats = async (name: string): Promise<ChampionStats | null> => {
    const res = await tierlistClient.champion[':name'].$get({
        param: { name }
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch champion stats');
    }

    const data = await res.json() as any;
    return {
        ...data,
        title: getChampionTitle(name)
    };
}
