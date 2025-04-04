import * as v from "valibot"

const security = v.union([
    v.literal('WPA'),
    v.literal('WPA2'),
    v.literal('WPA3'),
    v.literal('WEP'),
    v.literal('Other'),
    v.literal('None'),
]);

//^[A-Za-z0-9]{1,32}$
export const wifi = v.object({
    ssid: v.pipe(v.string(),v.regex(/^[A-Za-z0-9]{1,32}$/)),
    password: v.optional(v.string()),
    security: security,
    captive: v.union([v.boolean(), v.string()]),
    latitude:v.number(),
    longitude:v.number(),
})