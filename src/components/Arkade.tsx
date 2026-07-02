import { Match, Switch, createSignal } from "solid-js";
import { createRouteAction } from "solid-start";
import { api } from "~/api/client";

const SIMPLE_BUTTON =
  "mt-4 px-4 py-2 rounded-xl text-xl font-semibold bg-black text-white border border-white";

function Result(props: { result: any; error: any }) {
  return (
    <div class="rounded-xl p-4 flex flex-col items-center gap-2 bg-[rgba(0,0,0,0.5)] drop-shadow-blue-glow">
      <Switch>
        <Match when={props.result?.txid}>
          <p>Sent {props.result?.sats} sats to Arkade</p>
          <pre class="text-sm font-mono whitespace-pre-line break-all">{props.result?.address}</pre>
          <a href={`https://explorer.mutinynet.arkade.sh/tx/${props.result?.txid}`}>View on Arkade explorer</a>
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
    let address = (formData.get("address")?.toString() ?? "").replace(/^"|"$/g, "").trim();

    const res = await api.post("api/arkade", { address, sats });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text.startsWith("<!DOCTYPE html>") ? "Rate limit exceeded" : text);
    }
    const json = await res.json();
    return { txid: json.txid, sats, address };
  });

  return (
    <div class="border border-white/50 rounded-xl p-4 w-full gap-2 flex flex-col">
      <h2 class="font-bold text-xl font-mono">Send to Arkade</h2>
      <Switch>
        <Match when={sendResult.result || sendResult.error}>
          <Result result={sendResult.result} error={sendResult.error} />
        </Match>
        <Match when={true}>
          <Form class="rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)] w-full drop-shadow-blue-glow">
            <label for="how_much">How much? (sats)</label>
            <input type="number" name="how_much" placeholder="sats" value={amount()}
              onInput={(e) => setAmount(e.currentTarget.value)} />
            <label for="address">Arkade address</label>
            <input type="text" name="address" placeholder="tark1..." />
            <input type="submit" disabled={sendResult.pending}
              value={sendResult.pending ? "..." : "Send to Arkade"}
              class="mt-4 p-4 rounded-xl text-xl font-semibold bg-[#1EA67F] text-white disabled:bg-gray-500" />
          </Form>
        </Match>
      </Switch>
    </div>
  );
}
