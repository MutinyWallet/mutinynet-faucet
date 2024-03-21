import { Match, Switch, createSignal } from "solid-js";
import { createRouteAction, useSearchParams } from "solid-start";

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;

const SIMPLE_BUTTON =
  "mt-4 px-4 py-2 rounded-xl text-xl font-semibold bg-black text-white border border-white";

function Tx(props: { result: any; error: any }) {
  //   const { txid, howMuchSats, toAddress } = props.result?.result || {};
  return (
    <div class="rounded-xl p-4 flex flex-col items-center gap-2 bg-[rgba(0,0,0,0.5)] drop-shadow-blue-glow">
      <Switch>
        <Match when={props.result && props.result?.txid}>
          <p>Sent {props.result?.howMuchSats} sats to</p>
          <pre class="text-sm font-mono">{props.result?.toAddress}</pre>
          <a href={`https://mutinynet.com/tx/${props.result?.txid}`} class="">
            View on mempool.space
          </a>
          <button
            class={SIMPLE_BUTTON}
            onClick={() => window.location.reload()}
          >
            Start Over
          </button>
        </Match>
        <Match when={props.error}>
          <p>Something went wrong on the backend</p>
          <code>{props.error.message}</code>
          <button
            class={SIMPLE_BUTTON}
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </Match>
        <Match when={true}>
          <p>You probably screwed this up didn't you?</p>
          <p>
            (Make sure you're using a signet address btw, and don't ask for more
            than 1BTC)
          </p>
          <button
            class={SIMPLE_BUTTON}
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </Match>
      </Switch>
    </div>
  );
}

export function Faucet() {
  const [sendResult, { Form }] = createRouteAction(
    async (formData: FormData) => {
      // If all else fails give them 1mil sats for trying
      const howMuchSats = parseInt(
        formData.get("how_much")?.toString() ?? "1000000"
      );
      let toAddress = formData.get("address")?.toString() ?? "tb1q...";
      // Strip surrounding quotation marks if they exist
      toAddress = toAddress.replace(/^"|"$/g, '').trim();

      const res = await fetch(`${FAUCET_API_URL}/api/onchain`, {
        method: "POST",
        body: JSON.stringify({ sats: howMuchSats, address: toAddress }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(await res.text());
      } else {
        let json = await res.json();
        return { txid: json.txid, howMuchSats, toAddress: json.address };
      }
    }
  );

  const [amount, setAmount] = createSignal("100000");
  const [searchParams] = useSearchParams();

  return (
    <>
      <Switch>
        <Match when={sendResult.result || sendResult.error}>
          <Tx result={sendResult.result} error={sendResult.error} />
        </Match>
        <Match when={true}>
          <Form class="rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)] w-full drop-shadow-blue-glow">
            <label for="how_much">How much? (sats)</label>
            <input
              type="number"
              name="how_much"
              placeholder="sats"
              value={amount()}
              onInput={(e) => setAmount(e.currentTarget.value)}
              max="10000001"
            />
            <div class="flex gap-2 -mt-2 mb-2">
              <button
                type="button"
                onClick={() => setAmount("10000000")}
                class={SIMPLE_BUTTON}
              >
                10M
              </button>
              <button
                type="button"
                onClick={() => setAmount("1000000")}
                class={SIMPLE_BUTTON}
              >
                1M
              </button>
              <button
                type="button"
                onClick={() => setAmount("100000")}
                class={SIMPLE_BUTTON}
              >
                100K
              </button>
            </div>
            <label for="address">Destination</label>
            <input
              type="text"
              name="address"
              placeholder="tb1q..."
              value={searchParams.address || ""}
            />
            <input
              type="submit"
              disabled={sendResult.pending}
              value={sendResult.pending ? "..." : "Make it rain"}
              class="mt-4 p-4 rounded-xl text-xl font-semibold bg-[#1EA67F] text-white disabled:bg-gray-500"
            />
          </Form>
        </Match>
      </Switch>
    </>
  );
}
