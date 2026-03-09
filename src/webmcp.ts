import { api } from "~/api/client";

export function registerWebMCPTools() {
  const mc = (navigator as any).modelContext;
  if (!mc) return;

  mc.registerTool({
    name: "send_onchain",
    description:
      "Send test bitcoin on Mutinynet signet to a given address. Max 1,000,000 sats per request.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string", description: "Bitcoin signet address (e.g. tb1q...)" },
        sats: { type: "number", description: "Amount in satoshis (default 100,000, max 1,000,000)" },
      },
      required: ["address"],
    },
    async execute(input: { address: string; sats?: number }) {
      const res = await api.post("api/onchain", {
        sats: input.sats ?? 100000,
        address: input.address,
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      return {
        content: [{ type: "text", text: `Sent ${input.sats ?? 100000} sats. txid: ${json.txid}` }],
      };
    },
  });

  mc.registerTool({
    name: "pay_lightning",
    description:
      "Pay a BOLT11 invoice, LNURL, or Lightning address on Mutinynet. Max 1,000,000 sats.",
    inputSchema: {
      type: "object",
      properties: {
        bolt11: { type: "string", description: "BOLT11 invoice, LNURL, or Lightning address" },
      },
      required: ["bolt11"],
    },
    async execute(input: { bolt11: string }) {
      const res = await api.post("api/lightning", { bolt11: input.bolt11 });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      return {
        content: [{ type: "text", text: `Payment sent. payment_hash: ${json.payment_hash}` }],
      };
    },
  });

  mc.registerTool({
    name: "open_channel",
    description:
      "Open a Lightning channel from the Mutinynet faucet node to your node. Max capacity 1,000,000 sats.",
    inputSchema: {
      type: "object",
      properties: {
        pubkey: { type: "string", description: "Your node's public key" },
        host: { type: "string", description: "Your node's host:port (e.g. 127.0.0.1:9735)" },
        capacity: { type: "number", description: "Channel capacity in sats (default 100,000)" },
        push_amount: { type: "number", description: "Sats to push to your side (default 0)" },
      },
      required: ["pubkey"],
    },
    async execute(input: { pubkey: string; host?: string; capacity?: number; push_amount?: number }) {
      const res = await api.post("api/channel", {
        pubkey: input.pubkey,
        host: input.host,
        capacity: input.capacity ?? 100000,
        push_amount: input.push_amount ?? 0,
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      return {
        content: [{ type: "text", text: `Channel opened. txid: ${json.txid}` }],
      };
    },
  });
}
