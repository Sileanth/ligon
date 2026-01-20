const default_assets_version = import.meta.env.VITE_ASSETS_VERSION;
if (!default_assets_version) {
    throw new Error('VITE_ASSETS_VERSION is not set in environment variables');
}

export function getProfileIconUrl(profileIconId: number, version?: string): string {
    if (!version) {
        version = default_assets_version
    }
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profileIconId}.png`;
}

export function getChampionIconUrl(championKey: string, version?: string): string {
    if (!version) {
        version = default_assets_version
    }
    let key = championKey;
    if (key === 'FiddleSticks') key = 'Fiddlesticks';
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${key}.png`;
}

export function getItemIconUrl(itemId: number, version?: string): string {
    if (!version) {
        version = default_assets_version
    }
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`;
}

export function getTierIconUrl(tier: string): string {
    let tierLower = tier.toLowerCase();
    tierLower = tierLower.replace(/\s/g, '')

    return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked-emblem/emblem-${tierLower}.png`;
}

export interface RuneData {
    id: number
    key: string
    icon: string
    name: string
    shortDesc: string
    longDesc: string
}

interface RuneSlot {
    runes: RuneData[]
}

interface RuneTree {
    id: number
    key: string
    icon: string
    name: string
    slots: RuneSlot[]
}

export interface SummonerSpell {
    id: string
    name: string
    key: string
    description: string
    image: {
        full: string
    }
}

export interface ChampionData {
    id: string
    key: string
    name: string
    title: string
    image: {
        full: string
    }
}

const rune_map = new Map<number, RuneData>()
const summoner_map = new Map<number, SummonerSpell>()
const champion_map = new Map<string, ChampionData>()

async function initializeMaps() {
    try {
        const version = default_assets_version

        // Initialize Runes
        const runesResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`)
        const runesData: RuneTree[] = await runesResponse.json()

        runesData.forEach(tree => {
            tree.slots.forEach(slot => {
                slot.runes.forEach(rune => {
                    rune_map.set(rune.id, rune)
                })
            })
        })

        // Initialize Summoner Spells
        const summonerResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`)
        const summonerData = await summonerResponse.json()
        const spells: Record<string, SummonerSpell> = summonerData.data

        Object.values(spells).forEach(spell => {
            summoner_map.set(parseInt(spell.key), spell)
        })

        // Initialize Champions
        const championResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`)
        const championData = await championResponse.json()
        const champions: Record<string, ChampionData> = championData.data

        Object.values(champions).forEach(champion => {
            champion_map.set(champion.id, champion)
        })

        console.log(`Loaded ${rune_map.size} runes, ${summoner_map.size} summoner spells, and ${champion_map.size} champions`)
    } catch (error) {
        console.error('Failed to initialize maps:', error)
    }
}

initializeMaps()

export function getSummonerSpellIconUrl(spellId: number, version?: string): string {
    if (!version) {
        version = default_assets_version
    }
    const spell = summoner_map.get(spellId)
    if (!spell) return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/SummonerFlash.png` // Fallback
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell.id}.png`;
}

export function getSummonerSpellData(spellId: number): SummonerSpell | undefined {
    return summoner_map.get(spellId)
}

export function getRuneIconUrl(runeId: number, version?: string): string {
    if (!version) {
        version = default_assets_version
    }

    const runeData = getRuneData(runeId)
    if (!runeData) {
        return ''
    }
    return `https://ddragon.leagueoflegends.com/cdn/img/${runeData.icon}`
}

export function getRuneData(runeId: number): RuneData | undefined {
    return rune_map.get(runeId)
}

export function getChampionData(championId: string): ChampionData | undefined {
    return champion_map.get(championId)
}

export function getChampionTitle(championId: string): string {
    const data = champion_map.get(championId)
    return data ? data.title : ''
}