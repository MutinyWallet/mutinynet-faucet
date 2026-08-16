# MutinyNet Faucet

Copy `.env.sample` to `.env` and make appropriate changes for connecting to Bitcoin Core

This isn't just a website, it's also a server, so you have to run it like a node thing:

```
pnpm install
pnpm build
pnpm start
```

If you need to change the port this serves on or anything like that check out the Vite docs: https://vitejs.dev/config/server-options.html

### Agent discovery

The site publishes machine-readable metadata for AI agents:

- `/robots.txt` and `/sitemap.xml`
- `/.well-known/api-catalog` (RFC 9727 linkset)
- `/.well-known/oauth-protected-resource` (RFC 9728)
- `/auth.md` with agent authentication instructions
- `/.well-known/agent-skills/index.json` (regenerated on `pnpm build`)
- `Link` response headers on the homepage (RFC 8288)
- Markdown content negotiation: send `Accept: text/markdown` to get a markdown version of the homepage
- WebMCP tools (`send_onchain`, `pay_lightning`, `open_channel`) via `navigator.modelContext`

DNS-AID records are not in this repository. Publish them in the DNS zone for
`mutinynet.com`, for example `_index._agents.faucet.mutinynet.com`, as
SVCB/HTTPS records per draft-mozleywilliams-dnsop-dnsaid. Sign the zone with
DNSSEC.

### API

```
curl -X POST \
  http://localhost:3000/api/faucet \
  -H 'Content-Type: application/json' \
  -d '{"sats":10000,"address":"bcrt1..."}'
```

```
curl -X POST \
  http://localhost:3000/api/invoice \
  -H 'Content-Type: application/json' \
  -d '{"bolt11": "..."}'
```
