import { Match, Switch, createSignal } from "solid-js";
import { createRouteAction, useSearchParams } from "solid-start";
import {setToken, token} from "~/stores/auth";
import {api} from "~/api/client";

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;

const SIMPLE_BUTTON = "btn-secondary mt-2";

function Tx(props: { result: any; error: any }) {
  //   const { txid, howMuchSats, toAddress } = props.result?.result || {};
  return (
    <div class="flex flex-col items-center gap-2 text-center">
      <Switch>
        <Match when={props.result && props.result?.txid}>
          <p>Sent {props.result?.howMuchSats} sats to</p>
          <pre class="text-sm font-mono break-all whitespace-pre-wrap">{props.result?.toAddress}</pre>
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

      const res = await api.post("api/onchain", {
        sats: howMuchSats,
        address: toAddress,
      });

      if (!res.ok) {
        const text = await res.text();
        if (text.startsWith("<!DOCTYPE html>")) {
          throw new Error("Rate limit exceeded");
        } else {
          throw new Error(text);
        }
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
          <Form class="flex flex-col gap-4">
            <div class="grid sm:grid-cols-[12rem_1fr] gap-4">
              <div class="flex flex-col gap-2">
                <label for="how_much" class="field-label">Amount (sats)</label>
                <input
                  type="number"
                  id="how_much"
                  name="how_much"
                  placeholder="sats"
                  value={amount()}
                  onInput={(e) => setAmount(e.currentTarget.value)}
                  max="1000000"
                />
                <div class="flex gap-2">
                  <button type="button" onClick={() => setAmount("1000000")} class="chip">
                    1M
                  </button>
                  <button type="button" onClick={() => setAmount("100000")} class="chip">
                    100K
                  </button>
                  <button type="button" onClick={() => setAmount("10000")} class="chip">
                    10K
                  </button>
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <label for="address" class="field-label">Destination</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="tb1q..."
                  value={searchParams.address || ""}
                />
              </div>
            </div>
            <input
              type="submit"
              disabled={sendResult.pending}
              value={sendResult.pending ? "..." : "Make it rain"}
              class="btn-primary"
            />
          </Form>
        </Match>
      </Switch>
    </>
  );
}
