import { Hono } from 'hono'
import {vValidator} from "@hono/valibot-validator"
import {wifi} from "./type_schema"
import {drizzle} from "drizzle-orm/d1"
import * as schema from "./schema"
import {nanoid} from "nanoid"
import { eq } from 'drizzle-orm'
import { jsxRenderer } from 'hono/jsx-renderer'
import {Main} from "./client"

interface Bindings {
  DB: D1Database
}

const app = new Hono<{Bindings:Bindings}>()

app.use(jsxRenderer(({ children })=>{
  return (
    <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>webui</title>
    </head>
    <body>
    <main>{children}</main>
    </body>
    </html>
  )
}))

app.get('/', (c) => {
  return c.render(<form action="/wifi/form" method="post">
    <div>
      <label htmlFor="username">ssid:</label>
      <input type="text" id="ssid" name="ssid" required />
    </div>

    <div>
      <label htmlFor="password">Password:</label>
      <input type="text" id="password" name="password" required />
    </div>

    <div>
      <label htmlFor="security">security:</label>
      <select id="security" name="security" required>
        <option value="WPA">WPA</option>
        <option value="WPA2">WPA2</option>
        <option value="WPA3">WPA3</option>
        <option value="WEP">WEP</option>
        <option value="Other">Other</option>
        <option value="None">None</option>
      </select>
    </div>
    <input type="checkbox" id="captive" name="captive" checked={true} hidden />
    <div>
      <label htmlFor="latitude">latitude:</label>
      <input type="number" id="latitude" name="latitude" required />
    </div>
    <div>
      <label htmlFor="longitude">longitude:</label>
      <input type="number" id="longitude" name="longitude" required />
    </div>

    <button type='submit'>送信</button>
  </form>)
})

app.get('/wifi', async (c) => {
  const {offset,limit} = c.req.query() as {offset?: number, limit?: number}
  const db = drizzle(c.env.DB)
  const wifiNetworks = await db.select().from(schema.wifiNetworks).orderBy(schema.wifiNetworks.updatedAt).limit(limit||20).offset(offset||0)
  if (wifiNetworks.length === 0) {
    return c.json({ error: 'No wifi networks found' }, 404)
  }
  return c.json(wifiNetworks.map(({id, ...rest}) => rest))
})

app.get('/wifi/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const wifiNetwork = await db.select().from(schema.wifiNetworks).where(eq(schema.wifiNetworks.id,id))
  if (wifiNetwork.length === 0) {
    return c.json({ error: 'Wifi network not found' }, 404)
  }
  return c.json(wifiNetwork[0])
})
app.delete('/wifi/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const wifiNetwork = await db.select().from(schema.wifiNetworks).where(eq(schema.wifiNetworks.id,id))
  if (wifiNetwork.length === 0) {
    return c.json({ error: 'Wifi network not found' }, 404)
  }
  await db.delete(schema.wifiNetworks).where(eq(schema.wifiNetworks.id,id))
  return c.json({ message: 'Wifi network deleted' })
})

app.post('/wifi', vValidator("json",wifi,(r,c)=>{
  if (!r.success) {
    return c.json({ error: r.issues }, 400)
  }
}), async (c) => {
  const { ssid, password, security, captive,latitude,longitude } = c.req.valid("json")
  const db = drizzle(c.env.DB)
  const id = nanoid()
  let captiveas: boolean = false
  if (typeof captive === "string") {
    if (captive === "true") {
      captiveas = true
    } else if (captive === "false") {
      captiveas = false
    } else {
      return c.json({ error: 'Invalid captive value' }, 400)
    }
  }
  db.insert(schema.wifiNetworks).values({
    id,
    ssid,
    password,
    security,
    captive:captiveas,
    latitude,
    longitude,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return c.json({ id, ssid, password, security, captive })
})

app.post('/wifi/form', vValidator("form",wifi,(r,c)=>{
  if (!r.success) {
    return c.json({ error: r.issues }, 400)
  }
}), async (c) => {
  const { ssid, password, security, captive,latitude,longitude } = c.req.valid("form")
  const db = drizzle(c.env.DB)
  const id = nanoid()
  let captiveas: boolean = false
  if (typeof captive === "string") {
    if (captive === "true") {
      captiveas = true
    } else if (captive === "false") {
      captiveas = false
    } else {
      return c.json({ error: 'Invalid captive value' }, 400)
    }
  }
  db.insert(schema.wifiNetworks).values({
    id,
    ssid,
    password,
    security,
    captive:captiveas,
    latitude,
    longitude,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return c.json({ id, ssid, password, security, captive })
})

export default app
