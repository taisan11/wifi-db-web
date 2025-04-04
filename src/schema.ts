import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import {securityType} from "./types"

// WiFi networks table
export const wifiNetworks = sqliteTable('wifi_networks', {
    id: text('id').notNull().primaryKey(),
    ssid: text('ssid').notNull(),
    password: text('password'),
    security: text('security').notNull().$type<securityType>(),
    captive:integer('captive',{mode:"boolean"}).notNull(),
    latitude: integer('latitude').notNull(),
    longitude: integer('longitude').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Tags for WiFi networks
export const tags = sqliteTable('tags', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique(),
});