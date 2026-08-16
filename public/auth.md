# Mutinynet Faucet — Agent Authentication

This document tells AI agents how to register and authenticate with the
Mutinynet faucet API at `https://faucet.mutinynet.com/api`.

## Registration

No sign-up is required. Any agent can obtain credentials with one of the
methods below. A GitHub account is only needed for the OAuth methods.

## Authentication Methods

### 1. GitHub OAuth Device Flow (recommended for agents)

Use this flow when no browser is available:

1. `POST https://faucet.mutinynet.com/auth/github/device`
2. The response contains a GitHub device code and user instructions. Have the
   user approve the device code at GitHub.
3. The completed flow returns a JWT Bearer token with a 31-day expiry.
4. Send the token on every API request:
   `Authorization: Bearer {token}`

### 2. GitHub OAuth Web Flow

Open `https://faucet.mutinynet.com/auth/github` in a browser. After GitHub
approval the faucet redirects back with a `token` query parameter containing a
JWT Bearer token with a 24-hour expiry.

### 3. L402 (Lightning Payment)

Use this flow to pay for access with a mainnet Lightning payment. No account
is needed:

1. `GET https://faucet.mutinynet.com/api/l402` returns HTTP 402 with a
   `WWW-Authenticate: L402 token="...", invoice="..."` challenge.
2. Pay the BOLT11 invoice from the challenge.
3. Authenticate with
   `Authorization: L402 {token}:{preimage}` where `{preimage}` is the payment
   preimage of the paid invoice.

## Protected Resource Metadata

Machine-readable metadata is published at
`/.well-known/oauth-protected-resource` (RFC 9728).

## Rate Limits

- 1,000,000 sats per IP / per user / per address in a 24-hour rolling window
- L402 users are rate-limited per payment hash
