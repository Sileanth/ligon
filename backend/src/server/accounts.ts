import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { accountByRiotId, accountByPuuid, getChampionMastery,getSoloQ } from '../services/account.js'
import { get } from 'http'

// Initialize Hono app
const app = new Hono()
const routeAccountByRiotId = app.get('/riotId/:gameName/:tagLine', zValidator('param', z.object({
    gameName: z.string().min(1).max(100),
    tagLine: z.string().min(1).max(100)
})), async (c) => {
    const { gameName, tagLine } = c.req.param()
    try {
        const account = await accountByRiotId(gameName, tagLine)
        if (!account) {
            return c.json({ error: 'Account not found' }, 404)
        }
        return c.json(account)
    } catch (error) {
        console.error(error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})
export type AccountByRiotIdApi = typeof routeAccountByRiotId


const routeAccountByPuuid = app.get('/puuid/:puuid', zValidator('param', z.object({
    puuid: z.string().min(1).max(100)
})), async (c) => {
    const { puuid } = c.req.param()
    try {
        const account = await accountByPuuid(puuid)
        if (!account) {
            return c.json({ error: 'Account not found' }, 404)
        }
        return c.json(account)
    } catch (error) {
        console.error(error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})
export type AccountByPuuidApi = typeof routeAccountByPuuid

const routeGetChampionMastery = app.get('/masteries/:puuid/:championId', zValidator('param', z.object({
    puuid: z.string().min(1).max(100),
    championId: z.string().min(1).max(100)
})), async (c) => {
    const { puuid, championId } = c.req.param()
    try {
        const masteries = await getChampionMastery(puuid, parseInt(championId))
        if (!masteries) {
            return c.json({ error: 'Mastery not found' }, 404)
        }
        return c.json(masteries)
    } catch (error) {
        console.error(error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})
export type GetChampionMasteryApi = typeof routeGetChampionMastery

const routeGetSoloqEntry = app.get('/league/soloq/:puuid', zValidator('param', z.object({
    puuid: z.string().min(1).max(100)
})), async (c) => {
    const { puuid } = c.req.param()
    try {
        const soloqEntry = await getSoloQ(puuid)
        if (!soloqEntry) {
            return c.json({ error: 'Soloq entry not found' }, 404)
        }
        return c.json(soloqEntry)
    } catch (error) {
        console.error(error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})
export type GetSoloqEntryApi = typeof routeGetSoloqEntry

export default app