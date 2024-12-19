import { Match, Switch, createSignal } from "solid-js";
import { createRouteAction } from "solid-start";
import { token } from "~/stores/auth";

import NDK, { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;

const GREEN_BUTTON =
  "mt-4 p-4 rounded-xl text-xl font-semibold bg-[#1EA67F] text-white disabled:bg-gray-500";

type NWCInfo = {
  relay: string;
  secret: string;
  npubHex: string;
};

async function parseNwcUrl(url: string): Promise<NWCInfo> {
  console.log("parsing url", url);
  const params = new URLSearchParams(url.split("?")[1]);

  if (!params.has("relay") || !params.has("secret")) {
    throw new Error("Invalid NWC URL");
  }

  // npub is the string following ://
  const npubHex = url.split("://")[1].split("?")[0];

  if (!npubHex) {
    throw new Error("Invalid NWC URL");
  }

  const relay = params.get("relay") || "";
  const secret = params.get("secret") || "";
  return { relay, secret, npubHex };
}

async function publishZapRequest(bolt11: string, nwc: NWCInfo) {
  console.log(bolt11);
  const signer = new NDKPrivateKeySigner(nwc.secret);
  const ndk = new NDK({ explicitRelayUrls: [nwc.relay], signer });

  console.log("connecting to ndk");
  await ndk.connect();

  const event = new NDKEvent(ndk);
  event.kind = 23194;
  event.content = JSON.stringify({
    method: "pay_invoice",
    params: {
      invoice: bolt11, // bolt11 invoice
    },
  });
  event.tags = [["p", nwc.npubHex]];

  await event.encrypt(undefined, signer);

  await event.sign();
  console.log("publishing zap request", event.rawEvent());

  await event.publish();

  // const zaps2: NostrEvent[] = [];
  // zaps.forEach((zap) => {
  //     const raw = zap.rawEvent();
  //     zaps2.push(raw);
  // });
  // return zaps2;
  // return [];
}


type MultiInvoiceParam = {
  id: string;
  invoice: string;
};

async function publishMultiInvoiceRequest(invoices: string[], nwc: NWCInfo) {
  const signer = new NDKPrivateKeySigner(nwc.secret);
  const ndk = new NDK({ explicitRelayUrls: [nwc.relay], signer });

  console.log("connecting to ndk");
  await ndk.connect();

  let invoicesParam: MultiInvoiceParam[] = [];

  for (var invoice of invoices) {
    let invoiceParam: MultiInvoiceParam = {id: invoice, invoice}
    invoicesParam.push(invoiceParam)
  }

  const event = new NDKEvent(ndk);
  event.kind = 23194;
  event.content = JSON.stringify({
    method: "multi_pay_invoice",
    params: {
      invoices: invoicesParam, 
    },
  });
  event.tags = [["p", nwc.npubHex]];

  await event.encrypt(undefined, signer);
  await event.sign();
  console.log("publishing multi zap request", event.rawEvent());
  await event.publish();
}


async function fetchBolt11(): Promise<{ bolt11: string }> {
  const res = await fetch(`${FAUCET_API_URL}/api/bolt11`, {
    method: "POST",
    body: JSON.stringify({ amount_sats: 21 }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token()}`,
    },
  });

  if (!res.ok) {
    console.error(res.text());
    throw new Error(await res.text());
  } else {
    return await res.json();
  }
}

function Zapper(props: { nwc: NWCInfo }) {
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<Error>();

  async function handleZap() {
    setLoading(true);
    try {
      const bolt11 = (await fetchBolt11()).bolt11;
      await publishZapRequest(bolt11, props.nwc);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleMultiZap() {
    setLoading(true);
    let invoices = [];
    try {
      // create 3 invoices for the multi invoice request
      for (let i = 0; i < 3; i++) {
        const bolt11 = (await fetchBolt11()).bolt11;
        invoices.push(bolt11);
      }
      await publishMultiInvoiceRequest(invoices, props.nwc); 
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleKeysend() {
    setLoading(true);

    const signer = new NDKPrivateKeySigner(props.nwc.secret);
    const ndk = new NDK({ explicitRelayUrls: [props.nwc.relay], signer });

    console.log("connecting to ndk");
    await ndk.connect();

    const event = new NDKEvent(ndk);
    event.kind = 23194;
    event.content = JSON.stringify({
      method: "pay_keysend",
      params: {
        amount: 42 * 1000,
        pubkey: "02465ed5be53d04fde66c9418ff14a5f2267723810176c9212b722e542dc1afb1b"
      },
    });
    event.tags = [["p", props.nwc.npubHex]];

    await event.encrypt(undefined, signer);
    await event.sign();
    console.log("publishing keysend request", event.rawEvent());
    await event.publish();

    setLoading(false);
  }

  async function handleMultiKeysend() {
    setLoading(true);

    const signer = new NDKPrivateKeySigner(props.nwc.secret);
    const ndk = new NDK({ explicitRelayUrls: [props.nwc.relay], signer });

    console.log("connecting to ndk");
    await ndk.connect();

    let keysendParams = [];
    for (let i = 0; i < 3; i++) {
      let keysendParam = {
        id: String(Math.floor(Math.random() * 10000000)), 
        pubkey: "02465ed5be53d04fde66c9418ff14a5f2267723810176c9212b722e542dc1afb1b", 
        amount: 42 * 1000
      }
      keysendParams.push(keysendParam)
    }

    const event = new NDKEvent(ndk);
    event.kind = 23194;
    event.content = JSON.stringify({
      method: "multi_pay_keysend",
      params: {
        keysends: keysendParams
      },
    });
    event.tags = [["p", props.nwc.npubHex]];

    await event.encrypt(undefined, signer);
    await event.sign();
    console.log("publishing multi keysend request", event.rawEvent());
    await event.publish();

    setLoading(false);
  }
  
  return (
    <div class="rounded-xl p-4 flex flex-col items-center gap-2 bg-[rgba(0,0,0,0.5)] drop-shadow-blue-glow">
      <Switch>
        <Match when={error()}>
          <pre class="overflow-x-auto whitespace-pre-line break-all p-4 bg-white/10 rounded-lg">
            {error()!.message}
          </pre>
        </Match>
        <Match when={true}>
          <pre class="overflow-x-auto whitespace-pre-line break-all p-4 bg-white/10 rounded-lg">
            {JSON.stringify(props.nwc, null, 2)}
          </pre>
          <button class={GREEN_BUTTON} onClick={handleZap}>
            {loading() ? "..." : "Send Zap Request"}
          </button>
          <button class={GREEN_BUTTON} onClick={handleMultiZap}>
            {loading() ? "..." : "Send Multiple Zap Requests"}
          </button>
          <button class={GREEN_BUTTON} onClick={handleKeysend}>
            {loading() ? "..." : "Send Keysend Request"}
          </button>
          <button class={GREEN_BUTTON} onClick={handleMultiKeysend}>
            {loading() ? "..." : "Send Multiple Keysend Requests"}
          </button>
        </Match>
      </Switch>
    </div>
  );
}

export function NWC() {
  const [nwcResult, { Form }] = createRouteAction(
    async (formData: FormData) => {
      const nwcString = formData.get("nwc")?.toString();

      if (!nwcString) {
        throw new Error("No NWC provided");
      } else {
        try {
          const parsed = parseNwcUrl(nwcString);
          return parsed;
        } catch (e) {
          const err = e as Error;
          throw e;
        }
      }
    }
  );

  return (
    <Switch>
      <Match when={nwcResult.result}>
        <Zapper nwc={nwcResult.result!} />
      </Match>
      <Match when={nwcResult.error}>
        <div class="rounded-xl p-4 flex flex-col items-center gap-2 bg-[rgba(0,0,0,0.5)] drop-shadow-blue-glow">
          <pre class="overflow-x-auto whitespace-pre-line break-all p-4 bg-white/10 rounded-lg">
            {nwcResult.error!.message}
          </pre>
        </div>
      </Match>
      <Match when={true}>
        <Form class="rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)] w-full drop-shadow-blue-glow">
          <label for="address">NWC</label>
          <textarea
            rows="4"
            name="nwc"
            placeholder="nostr+walletconnect://..."
          />
          <input
            type="submit"
            disabled={nwcResult.pending}
            value={nwcResult.pending ? "..." : "Use NWC"}
            class={GREEN_BUTTON}
          />
        </Form>
      </Match>
    </Switch>
  );
}
