import { Hono } from 'hono'
import {vValidator} from "@hono/valibot-validator"
import {wifi} from "./type_schema"
import {drizzle} from "drizzle-orm/d1"
import * as schema from "./schema"
import {nanoid} from "nanoid"
import { eq } from 'drizzle-orm'

interface Bindings {
  DB: D1Database
}

const app = new Hono<{Bindings:Bindings}>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
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
  const { ssid, password, security, captive } = c.req.valid("json")
  const db = drizzle(c.env.DB)
  const id = nanoid()
  db.insert(schema.wifiNetworks).values({
    id,
    ssid,
    password,
    security,
    captive,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return c.json({ id, ssid, password, security, captive })
})

export default app
