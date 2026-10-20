import { Match, Show, Switch, createSignal } from "solid-js";
import { createRouteAction } from "solid-start";
import { api } from "~/api/client";

const SIMPLE_BUTTON = "btn-secondary mt-2";

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
    <div class="flex flex-col items-center gap-2 text-center">
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
    const json = await res.json();
    // Older backends answer with only `txid`, for a settled Arkade send.
    return { ...json, rail: json.rail ?? "ark", status: json.status ?? "settled", amount: json.amount ?? sats, destination };
  });

  return (
    <Switch>
      <Match when={sendResult.result || sendResult.error}>
        <Result result={sendResult.result} error={sendResult.error} />
      </Match>
      <Match when={true}>
        <Form class="flex flex-col gap-4">
          <div class="grid sm:grid-cols-[12rem_1fr] gap-4">
            <div class="flex flex-col gap-2">
              <label for="ark_how_much" class="field-label">Amount (sats)</label>
              <input type="number" id="ark_how_much" name="how_much" min={1} placeholder="sats" value={amount()}
                onInput={(e) => setAmount(e.currentTarget.value)} />
            </div>
            <div class="flex flex-col gap-2">
              <label for="destination" class="field-label">Destination</label>
              <input type="text" id="destination" name="destination" placeholder="tark1…, tb1…, lntbs…, user@domain, bitcoin:…" />
            </div>
          </div>
          <p class="text-xs text-white/50 -mt-2">An invoice's own amount is used if it is lower.</p>
          <input type="submit" disabled={sendResult.pending}
            value={sendResult.pending ? "..." : "Send with Arkade"}
            class="btn-primary" />
        </Form>
      </Match>
    </Switch>
  );
}
