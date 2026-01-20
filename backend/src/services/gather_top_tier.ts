import { getGrandmasterLeage, getChallengerLeage, getMasterLeage } from "../riot/leage.js";
import { getSoloMatches } from './match.js'
import { type MatchDto } from "../riot/match.js";

export async function gatherTopTier() {
    const grandmasterLeage = await getGrandmasterLeage('RANKED_SOLO_5x5')
    const challengerLeage = await getChallengerLeage('RANKED_SOLO_5x5')
    const masterLeage = await getMasterLeage('RANKED_SOLO_5x5')

    let grandmasterLeageEntries = grandmasterLeage?.entries ?? []
    let challengerLeageEntries = challengerLeage?.entries ?? []
    let masterLeageEntries = masterLeage?.entries ?? []
    let toptiers = [...challengerLeageEntries, ...masterLeageEntries, ...grandmasterLeageEntries];
    let toptiersPuuid = toptiers.map(toptier => toptier.puuid);
    return toptiersPuuid;

}

export async function gatherTopTierMatches() {
    const toptiersPuuid = await gatherTopTier();




    let uniqueMatches = new Map<number, MatchDto>();

    for (const puuid of toptiersPuuid) {
        let matches = await getSoloMatches(puuid);
        if (matches) {
            console.log(`Found ${matches.length} matches for ${puuid}`);
            matches.forEach(match => {
                if (!match) return;
                uniqueMatches.set(match.extra.info.gameId, match.extra);
            });
        }
    }



    return { matches: Array.from(uniqueMatches.values()), size: uniqueMatches.size };
}

export async function analyzeToptierMatches() {
    const { matches, size } = await gatherTopTierMatches();



    const championGroups = matches.reduce((acc, m) => {
        m.info.participants.forEach(p => {
            const champion = p.championId;
            if (champion) {
                if (!acc.has(champion)) {
                    acc.set(champion, []);
                }
                acc.get(champion)!.push(m);
            }
        });
        return acc;
    }, new Map<number, MatchDto[]>());
    return { championGroups, size };

}


export function getBanMap(matches: MatchDto[]): Map<number, number> {
    const banMap = new Map<number, number>();
    matches.forEach(m => {
        m.info.teams.forEach(t => {
            t.bans?.forEach(b => {
                if (b.championId && b.championId !== -1) {
                    banMap.set(b.championId, (banMap.get(b.championId) || 0) + 1);
                }
            });
        });
    });
    return banMap;
}


export async function analyzeChampionGroup(championId: number, matches: MatchDto[], numberBans: number, totalGames: number) {
    const roles = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'] as const;
    const roleMap: Record<string, typeof roles[number]> = {
        'TOP': 'TOP',
        'JUNGLE': 'JUNGLE',
        'MIDDLE': 'MID',
        'BOTTOM': 'ADC',
        'UTILITY': 'SUPPORT'
    };

    const matchesByRole = new Map<string, MatchDto[]>();
    matches.forEach(m => {
        const p = m.info.participants.find(p => p.championId === championId);
        if (!p || !p.teamPosition) return;
        const role = roleMap[p.teamPosition] || 'MID';
        if (!matchesByRole.has(role)) matchesByRole.set(role, []);
        matchesByRole.get(role)!.push(m);
    });

    const results = [];

    for (const [role, roleMatches] of matchesByRole.entries()) {
        let wins = 0, kills = 0, deaths = 0, assists = 0;
        const builds = new Map<string, { items: number[], wins: number, games: number }>();
        const situational = new Map<number, { wins: number, games: number }>();
        const matchups = new Map<string, { wins: number, games: number, name: string }>();

        roleMatches.forEach(m => {
            const p = m.info.participants.find(p => p.championId === championId)!;
            if (p.win) wins++;
            kills += p.kills || 0;
            deaths += p.deaths || 0;
            assists += p.assists || 0;

            const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].filter(id => id && id > 0) as number[];
            if (items.length >= 3) {
                const core = items.slice(0, 3).sort((a, b) => a - b);
                const key = core.join(',');
                const entry = builds.get(key) || { items: core, wins: 0, games: 0 };
                entry.games++;
                if (p.win) entry.wins++;
                builds.set(key, entry);
            }

            items.forEach((id, idx) => {
                if (idx >= 3) {
                    const entry = situational.get(id) || { wins: 0, games: 0 };
                    entry.games++;
                    if (p.win) entry.wins++;
                    situational.set(id, entry);
                }
            });

            const opp = m.info.participants.find(o => o.teamPosition === p.teamPosition && o.teamId !== p.teamId);
            if (opp && opp.championName) {
                const entry = matchups.get(opp.championName) || { wins: 0, games: 0, name: opp.championName };
                entry.games++;
                if (p.win) entry.wins++;
                matchups.set(opp.championName, entry);
            }
        });

        const winrate = (wins / roleMatches.length) * 100;
        const playrate = (roleMatches.length / totalGames) * 100;
        const banrate = (numberBans / totalGames) * 100;

        const score = winrate + playrate;
        let tier: any = 'D';
        if (score > 55) tier = 'S+';
        else if (score > 53) tier = 'S';
        else if (score > 51) tier = 'A';
        else if (score > 49) tier = 'B';
        else if (score > 47) tier = 'C';

        results.push({
            tierlist: {
                champion_id: roleMatches[0]?.info.participants.find(p => p.championId === championId)?.championName || championId.toString(),
                champion_name: roleMatches[0]?.info.participants.find(p => p.championId === championId)?.championName || '',
                role,
                winrate,
                games: roleMatches.length,
                tier,
                banrate
            },
            stats: {
                name: roleMatches[0]?.info.participants.find(p => p.championId === championId)?.championName || '',
                title: '',
                winrate,
                playrate,
                banrate,
                avgKills: kills / roleMatches.length,
                avgDeaths: deaths / roleMatches.length,
                avgAssists: assists / roleMatches.length,
                coreBuilds: Array.from(builds.values()).sort((a, b) => b.games - a.games).slice(0, 3).map(b => ({
                    items: b.items,
                    winrate: (b.wins / b.games) * 100,
                    playrate: (b.games / roleMatches.length) * 100
                })),
                situationalItems: Array.from(situational.entries()).sort((a, b) => b[1].games - a[1].games).slice(0, 5).map(([id, d]) => ({
                    itemId: id,
                    winrate: (d.wins / d.games) * 100,
                    playrate: (d.games / roleMatches.length) * 100
                })),
                matchups: Array.from(matchups.values()).sort((a, b) => b.games - a.games).slice(0, 5).map(m => ({
                    championId: m.name,
                    championName: m.name,
                    winrate: (m.wins / m.games) * 100,
                    playrate: (m.games / roleMatches.length) * 100
                }))
            }
        });
    }
    return results;
}