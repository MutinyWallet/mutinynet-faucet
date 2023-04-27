# MutinyNet Faucet

Copy `.env.sample` to `.env` and make appropriate changes for connecting to Bitcoin Core

This isn't just a website, it's also a server, so you have to run it like a node thing:

```
pnpm install
pnpm build
pnpm start
```

If you need to change the port this serves on or anything like that check out the Vite docs: https://vitejs.dev/config/server-options.html

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
