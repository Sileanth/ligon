import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getSoloMatches, getByMatchId } from '../services/match.js'

const app = new Hono()
const routeSoloqByPuuid = app.get('/soloq/:puuid', zValidator('param', z.object({
    puuid: z.string().min(1).max(100)
})), async (c) => {
    console.log('getting soloq matches')
    const { puuid } = c.req.param()
    try {
        const matches = await getSoloMatches(puuid)
        if (!matches) {
            return c.json({ error: 'Matches not found' }, 404)
        }
        return c.json(matches)
    } catch (error) {
        console.error(error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})
export type RouteSoloqByPuuid = typeof routeSoloqByPuuid

const routeMatchByMatchId = app.get('/:matchId', zValidator('param', z.object({
    matchId: z.string().min(1).max(100)
})), async (c) => {
    const { matchId } = c.req.param()
    try {
        const match = await getByMatchId(matchId)
        if (!match) {
            return c.json({ error: 'Match not found' }, 404)
        }
        return c.json(match)
    } catch (error) {
        console.error(error)
        return c.json({ error: 'Internal Server Error' }, 500)
    }
})

export type RouteMatchByMatchId = typeof routeMatchByMatchId

export default app