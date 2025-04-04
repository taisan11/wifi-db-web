import * as v from "valibot"

const security = v.union([
    v.literal('WPA'),
    v.literal('WPA2'),
    v.literal('WPA3'),
    v.literal('WEP'),
    v.literal('Other'),
    v.literal('None'),
]);

export const wifi = v.object({
    ssid: v.string(),
    password: v.optional(v.string()),
    security: security,
    captive: v.boolean(),
})