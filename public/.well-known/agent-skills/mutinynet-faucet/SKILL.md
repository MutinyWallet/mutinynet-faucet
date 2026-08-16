---
name: mutinynet-faucet
description: Get test bitcoin on the Mutinynet signet. Use when an agent needs signet coins on-chain, needs to pay a Lightning invoice, open a Lightning channel, or generate a test BOLT11 invoice.
---

# Mutinynet Faucet

The faucet API base URL is `https://faucet.mutinynet.com/api`. An OpenAPI
spec is at `https://faucet.mutinynet.com/openapi.json` and an API catalog at
`https://faucet.mutinynet.com/.well-known/api-catalog`.

## Authenticate

Read `https://faucet.mutinynet.com/auth.md` for full instructions. Two
options:

1. GitHub OAuth device flow: `POST /auth/github/device`, then send
   `Authorization: Bearer {token}`.
2. L402: `GET /api/l402`, pay the returned Lightning invoice, then send
   `Authorization: L402 {token}:{preimage}`.

## Get Coins

- On-chain: `POST /api/onchain` with `{"address": "tb1q...", "sats": 100000}`.
  Max 1,000,000 sats per request.
- Lightning: `POST /api/lightning` with `{"bolt11": "lnbc1..."}`.
- Open a channel: `POST /api/channel` with `{"pubkey": "02abc...", "host": "127.0.0.1:9735", "capacity": 100000}`.
- Receive test payment (no auth): `POST /api/bolt11` with `{"amount_sats": 1000}`.

## Rate Limits

1,000,000 sats per IP / per user / per address in a 24-hour rolling window.
If a request fails with a rate-limit error, wait and retry later instead of
retrying in a loop.
