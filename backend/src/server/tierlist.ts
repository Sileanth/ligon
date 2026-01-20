import { Hono } from 'hono'
import { getAnalysisData } from '../services/analysis_cache.js'

const app = new Hono()

const MIN_GAMES_THRESHOLD = 10;

app.get('/', async (c) => {
    const data = await getAnalysisData();
    if (!data) {
        return c.json({ error: 'Database not initialized' }, 503);
    }

    const filteredTierlist = data.tierlist.filter(entry => entry.games >= MIN_GAMES_THRESHOLD);

    return c.json(filteredTierlist);
});

app.get('/champion/:name', async (c) => {
    const name = c.req.param('name');
    const data = await getAnalysisData();
    if (!data) {
        return c.json({ error: 'Database not initialized' }, 503);
    }

    const champName = Object.keys(data.championStats).find(k => k.toLowerCase() === name.toLowerCase());

    if (!champName || !data.championStats[champName]) {
        return c.json({ error: 'Champion not found' }, 404);
    }

    return c.json(data.championStats[champName]);
});

export default app
export type TierlistApi = typeof app
