import { Hono } from 'hono'
import { getTopPlayers } from '../services/league_service.js'

const app = new Hono()

app.get('/challenger', async (c) => {
    try {
        const players = await getTopPlayers();
        return c.json(players);
    } catch (error) {
        console.error(error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});

export default app
export type PlayersApi = typeof app
