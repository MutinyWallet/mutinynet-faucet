import { createSignal, Match, Switch } from "solid-js";
import { createRouteAction } from "solid-start";
import {setToken, token} from "~/stores/auth";
import {api} from "~/api/client";

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;

const SIMPLE_BUTTON = "btn-secondary mt-2";

function Pop(props: any) {
  return (
    <div class="w-full flex flex-col items-center gap-2 text-center">
      {/* {JSON.stringify(props, null, 2)} */}
      <Switch>
        <Match when={props.result}>
          <p>Opened the channel, here's the transaction id</p>
          <pre class="text-sm font-mono break-all whitespace-pre-wrap">{props.result?.txid}</pre>
          <a href={`https://mutinynet.com/tx/${props.result?.txid}`}>
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
          <p>Something went wrong</p>
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

export function LnChannel() {
  const [sendResult, { Form }] = createRouteAction(
    async (formData: FormData) => {
      const connectionString = formData.get("connectionString")?.toString();

      if (!connectionString) {
        throw new Error("Invalid connection string");
      }

      let pubkey: string;
      let host: string | undefined;
      if (connectionString?.includes("@")) {
        const [pk, h] = connectionString?.split("@") || [];
        pubkey = pk;
        host = h;
      } else {
        pubkey = connectionString;
      }

      if (!pubkey) {
        throw new Error("Invalid connection string");
      }

      const capacity = parseInt(formData.get("capacity")?.toString() || "", 10);
      if (Number.isNaN(capacity)) {
        throw new Error("Invalid capacity");
      }

      const pushPercentage = parseInt(
        formData.get("pushPercentage")?.toString() || "",
        10
      );
      if (Number.isNaN(pushPercentage)) {
        throw new Error("Invalid push percentage");
      }
      const pushAmount = Math.round(capacity / 100) * pushPercentage;

      const res = await api.post("api/channel", {
          push_amount: pushAmount,
          capacity,
          pubkey,
          host,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      } else {
        return res.json();
      }
    }
  );

  const [capacity, setCapacity] = createSignal("100000");
  const [pushPercentage, setPushPercentage] = createSignal("50");

  return (
    <Switch>
      <Match when={sendResult.result || sendResult.error}>
        <Pop result={sendResult.result} error={sendResult.error} />
      </Match>
      <Match when={true}>
        <Form class="flex flex-col gap-4">
          <div class="grid sm:grid-cols-3 gap-4">
            <div class="flex flex-col gap-2">
              <label for="capacity" class="field-label">Capacity (sats)</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                placeholder="sats"
                value={capacity()}
                onInput={(e) => setCapacity(e.currentTarget.value)}
                max="1000000"
              />
              <div class="flex gap-2">
                <button type="button" onClick={() => setCapacity("1000000")} class="chip">
                  1M
                </button>
                <button type="button" onClick={() => setCapacity("100000")} class="chip">
                  100K
                </button>
                <button type="button" onClick={() => setCapacity("10000")} class="chip">
                  10K
                </button>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <label for="pushPercentage" class="field-label">Push to you (%)</label>
              <input
                type="number"
                id="pushPercentage"
                name="pushPercentage"
                placeholder="50"
                value={pushPercentage()}
                onInput={(e) => setPushPercentage(e.currentTarget.value)}
                max="100"
              />
              <div class="flex gap-2">
                <button type="button" onClick={() => setPushPercentage("0")} class="chip">
                  0%
                </button>
                <button type="button" onClick={() => setPushPercentage("50")} class="chip">
                  50%
                </button>
                <button type="button" onClick={() => setPushPercentage("100")} class="chip">
                  100%
                </button>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <label for="connectionString" class="field-label">Your node</label>
              <input
                type="text"
                id="connectionString"
                name="connectionString"
                placeholder="pubkey@host:port"
              />
            </div>
          </div>
          <input
            type="submit"
            disabled={sendResult.pending}
            value={sendResult.pending ? "..." : "Gimme a lightning channel"}
            class="btn-primary"
          />
        </Form>
      </Match>
    </Switch>
  );
}
