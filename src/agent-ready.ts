const SITE_URL = "https://faucet.mutinynet.com";
const API_URL = `${SITE_URL}/api`;

const HOME_MARKDOWN = `# Mutinynet Faucet

A Bitcoin signet faucet for developers testing on Mutinynet. Dispenses test
bitcoin on-chain, pays Lightning invoices, opens channels, and supports Nostr
wallet testing.

## Authentication

Three methods are supported:

- **GitHub OAuth (Web)**: Log in via GitHub at \`/auth/github\` to receive a JWT
  Bearer token (24-hour expiry).
- **GitHub OAuth (Device)**: \`POST /auth/github/device\` for CLI/device-based
  flows (31-day expiry).
- **L402 (Lightning)**: Pay a mainnet Lightning invoice to get access. Send
  \`GET /api/l402\` to receive a challenge, pay the invoice, then authenticate
  with \`Authorization: L402 {token}:{preimage}\`.

See ${SITE_URL}/auth.md for agent authentication instructions.

## API Endpoints

All endpoints below require authentication unless noted otherwise.

### On-Chain Faucet

- \`POST /api/onchain\` - Send test bitcoin to an address
  - Body: \`{"sats": 100000, "address": "tb1q..."}\`
  - Response: \`{"txid": "...", "address": "..."}\`
  - Max: 1,000,000 sats per request

### Lightning Payments

- \`POST /api/lightning\` - Pay a BOLT11 invoice, LNURL, or Lightning address
  - Body: \`{"bolt11": "lnbc1..."}\`
  - Response: \`{"payment_hash": "..."}\`
  - Max: 1,000,000 sats

### Channel Opening

- \`POST /api/channel\` - Open a Lightning channel to your node
  - Body: \`{"capacity": 1000000, "push_amount": 500000, "pubkey": "02abc...", "host": "127.0.0.1:9735"}\`
  - Response: \`{"txid": "..."}\`
  - Max capacity: 1,000,000 sats

### Invoice Generation (No Auth)

- \`POST /api/bolt11\` - Generate a BOLT11 invoice for testing receive flows
  - Body: \`{"amount_sats": 1000}\`
  - Response: \`{"bolt11": "..."}\`

### L402 Challenge

- \`GET /api/l402\` - Returns HTTP 402 with \`WWW-Authenticate: L402 token="...", invoice="..."\`
- \`POST /api/l402\` - Generate L402 credentials: \`{"invoice": "...", "token": "..."}\`

## Rate Limits

- 1,000,000 sats per IP / per user / per address in a 24-hour rolling window
- L402 users are rate-limited per payment hash

## Machine-Readable Resources

- API catalog: ${SITE_URL}/.well-known/api-catalog
- OpenAPI spec: ${SITE_URL}/openapi.json
- Agent skills: ${SITE_URL}/.well-known/agent-skills/index.json
- Protected resource metadata: ${SITE_URL}/.well-known/oauth-protected-resource
`;

// RFC 9727 API catalog, served as application/linkset+json
const API_CATALOG = {
  linkset: [
    {
      anchor: API_URL,
      "service-desc": [
        {
          href: `${SITE_URL}/openapi.json`,
          type: "application/vnd.oai.openapi+json",
        },
      ],
      "service-doc": [
        { href: `${SITE_URL}/llms.txt`, type: "text/plain" },
        { href: `${SITE_URL}/auth.md`, type: "text/markdown" },
      ],
    },
  ],
};

// RFC 9728 OAuth Protected Resource Metadata
const OAUTH_PROTECTED_RESOURCE = {
  resource: API_URL,
  authorization_servers: ["https://github.com/login/oauth"],
  bearer_methods_supported: ["header"],
  scopes_supported: [],
  resource_documentation: `${SITE_URL}/llms.txt`,
};

// RFC 8288 Link headers for agent discovery, sent on page responses
const LINK_HEADERS = [
  `</.well-known/api-catalog>; rel="api-catalog"`,
  `</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"`,
  `</llms.txt>; rel="service-doc"; type="text/plain"`,
  `</auth.md>; rel="help"; type="text/markdown"`,
  `</.well-known/agent-skills/index.json>; rel="alternate"; type="application/json"`,
  `</>; rel="alternate"; type="text/markdown"`,
];

function jsonResponse(body: unknown, contentType: string): Response {
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

/**
 * Handles agent-discovery requests before they reach page rendering.
 * Returns a Response for well-known endpoints and markdown content
 * negotiation, or undefined to continue to normal handling.
 */
export function handleAgentRequest(request: Request): Response | undefined {
  const url = new URL(request.url);

  if (request.method === "GET" || request.method === "HEAD") {
    if (url.pathname === "/.well-known/api-catalog") {
      return jsonResponse(API_CATALOG, "application/linkset+json");
    }

    if (url.pathname === "/.well-known/oauth-protected-resource") {
      return jsonResponse(OAUTH_PROTECTED_RESOURCE, "application/json");
    }

    // Markdown for Agents: return a markdown rendering of the homepage
    // when the client explicitly asks for it.
    if (
      url.pathname === "/" &&
      (request.headers.get("accept") ?? "").includes("text/markdown")
    ) {
      return new Response(HOME_MARKDOWN, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "x-markdown-tokens": String(Math.ceil(HOME_MARKDOWN.length / 4)),
          Vary: "Accept",
        },
      });
    }
  }

  return undefined;
}

/** Appends RFC 8288 Link headers for agent discovery to a page response. */
export function appendAgentLinkHeaders(headers: Headers) {
  for (const link of LINK_HEADERS) {
    headers.append("Link", link);
  }
}
