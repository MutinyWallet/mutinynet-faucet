import { Match, Switch, createSignal } from "solid-js";
import { createRouteAction } from "solid-start";

import NDK, { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import {api} from "~/api/client";

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;

const GREEN_BUTTON = "btn-primary";

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
  const res = await api.post("api/bolt11", {
    amount_sats: 21
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
    <div class="w-full flex flex-col gap-3">
      <Switch>
        <Match when={error()}>
          <pre class="overflow-x-auto whitespace-pre-line break-all p-4 bg-white/10 rounded-lg">
            {error()!.message}
          </pre>
        </Match>
        <Match when={true}>
          <pre class="overflow-x-auto whitespace-pre-line break-all p-4 bg-white/10 rounded-lg text-sm">
            {JSON.stringify(props.nwc, null, 2)}
          </pre>
          <div class="grid sm:grid-cols-2 gap-3">
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
          </div>
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
        <div class="flex flex-col items-center gap-2">
          <pre class="overflow-x-auto whitespace-pre-line break-all p-4 bg-white/10 rounded-lg">
            {nwcResult.error!.message}
          </pre>
        </div>
      </Match>
      <Match when={true}>
        <Form class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="nwc" class="field-label">Nostr Wallet Connect string</label>
            <textarea
              rows="4"
              id="nwc"
              name="nwc"
              placeholder="nostr+walletconnect://..."
            />
          </div>
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
