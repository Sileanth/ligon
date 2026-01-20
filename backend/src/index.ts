import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import account from './server/accounts.js'
import match from './server/match.js'
import tierlist from './server/tierlist.js'
import players from './server/players.js'
import { cors } from 'hono/cors'


const token = process.env.CLIENT_TOKEN
if (!token) {
    throw new Error('CLIENT_TOKEN is not set in environment variables');
}

const dev_env_var = process.env.DEV
console.log('dev_env_var', dev_env_var)
let dev = false;
if (dev_env_var) {
    console.log('we are in dev mode')
    dev = true;
}

const app = new Hono()


app.use('/api/*', cors())

if (!dev) {
    console.log('enabling auth')
    app.use('/api/*', bearerAuth({ token }))
}


app.route('/api/account/', account)
app.route('/api/match/', match)
app.route('/api/tierlist/', tierlist)
app.route('/api/players/', players)


export type AppType = typeof app

const port = Number(process.env.BACKEND_PORT) || 3002

serve({
    fetch: app.fetch,
    port: port,
})

console.log(`Server is running on http://localhost:${port}`)
