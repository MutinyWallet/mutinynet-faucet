import { Match, Show, Switch, createSignal } from "solid-js";
import { createRouteAction } from "solid-start";
import { api } from "~/api/client";

const SIMPLE_BUTTON =
  "mt-4 px-4 py-2 rounded-xl text-xl font-semibold bg-black text-white border border-white";

const RAILS: Record<string, string> = {
  ark: "Arkade",
  lightning: "Lightning (Arkade swap)",
  onchain: "on-chain (next batch)",
};

// Only the collaborative exit's txid is an L1 transaction; every other rail reports the Arkade tx.
const txLink = (r: { rail: string; txid?: string }) =>
  r.txid &&
  (r.rail === "onchain"
    ? `https://mutinynet.com/tx/${r.txid}`
    : `https://explorer.mutinynet.arkade.sh/tx/${r.txid}`);

function Result(props: { result: any; error: any }) {
  return (
    <div class="rounded-xl p-4 flex flex-col items-center gap-2 bg-[rgba(0,0,0,0.5)] drop-shadow-blue-glow">
      <Switch>
        <Match when={props.result}>
          <p>
            {props.result.status === "settled" ? "Sent" : "On its way:"} {props.result.amount} sats via{" "}
            {RAILS[props.result.rail] ?? props.result.rail}
          </p>
          <pre class="text-sm font-mono whitespace-pre-line break-all">{props.result.destination}</pre>
          <Show when={txLink(props.result)}>{(href) => <a href={href()}>View transaction</a>}</Show>
          <button class={SIMPLE_BUTTON} onClick={() => window.location.reload()}>Start Over</button>
        </Match>
        <Match when={props.error}>
          <p>Something went wrong</p>
          <code>{props.error.message}</code>
          <button class={SIMPLE_BUTTON} onClick={() => window.location.reload()}>Try again</button>
        </Match>
      </Switch>
    </div>
  );
}

export function Arkade() {
  const [amount, setAmount] = createSignal("50000");
  const [sendResult, { Form }] = createRouteAction(async (formData: FormData) => {
    const sats = parseInt(formData.get("how_much")?.toString() ?? "50000");
    const destination = (formData.get("destination")?.toString() ?? "").replace(/^"|"$/g, "").trim();

    const res = await api.post("api/arkade", { address: destination, sats });
    if (!res.ok) {
      const text = await res.text();
      if (text.startsWith("<!DOCTYPE html>")) {
        throw new Error("Rate limit exceeded");
      }
      let message = text;
      try {
        const json = JSON.parse(text);
        if (typeof json?.error === "string") {
          message = json.error;
        }
      } catch {
        // Keep the raw response when it isn't JSON.
      }
      throw new Error(message);
    }
    return { ...(await res.json()), destination };
  });

  return (
    <div class="border border-white/50 rounded-xl p-4 w-full gap-2 flex flex-col">
      <h2 class="font-bold text-xl font-mono">Send with Arkade</h2>
      <Switch>
        <Match when={sendResult.result || sendResult.error}>
          <Result result={sendResult.result} error={sendResult.error} />
        </Match>
        <Match when={true}>
          <Form class="rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)] w-full drop-shadow-blue-glow">
            <label for="how_much">How much? (sats; an invoice's own amount is used if lower)</label>
            <input type="number" name="how_much" min={1} placeholder="sats" value={amount()}
              onInput={(e) => setAmount(e.currentTarget.value)} />
            <label for="destination">Destination</label>
            <input type="text" name="destination" placeholder="tark1…, tb1…, lntbs…, user@domain, bitcoin:…" />
            <input type="submit" disabled={sendResult.pending}
              value={sendResult.pending ? "..." : "Send"}
              class="mt-4 p-4 rounded-xl text-xl font-semibold bg-[#1EA67F] text-white disabled:bg-gray-500" />
          </Form>
        </Match>
      </Switch>
    </div>
  );
}
