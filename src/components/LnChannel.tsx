import { createSignal, Match, Switch } from "solid-js";
import { createRouteAction } from "solid-start";
import { token } from "~/stores/auth";

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;

const SIMPLE_BUTTON =
  "mt-4 px-4 py-2 rounded-xl text-xl font-semibold bg-black text-white border border-white";

function Pop(props: any) {
  return (
    <div class="rounded-xl p-4 w-full flex flex-col items-center gap-2 bg-[rgba(0,0,0,0.5)] drop-shadow-blue-glow">
      {/* {JSON.stringify(props, null, 2)} */}
      <Switch>
        <Match when={props.result}>
          <p>Opened the channel, here's the transaction id</p>
          <pre class="text-sm font-mono">{props.result?.txid}</pre>
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

      const res = await fetch(`${FAUCET_API_URL}/api/channel`, {
        method: "POST",
        body: JSON.stringify({
          push_amount: pushAmount,
          capacity,
          pubkey,
          host,
        }),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token()}`,
        },
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
        <Form class="rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)] w-full drop-shadow-blue-glow">
          <label for="capacity">Channel capacity? (sats)</label>
          <input
            type="number"
            name="capacity"
            placeholder="sats"
            value={capacity()}
            onInput={(e) => setCapacity(e.currentTarget.value)}
            max="10000001"
          />
          <div class="flex gap-2 -mt-2 mb-2">
            <button
              type="button"
              onClick={() => setCapacity("10000000")}
              class={SIMPLE_BUTTON}
            >
              10M
            </button>
            <button
              type="button"
              onClick={() => setCapacity("1000000")}
              class={SIMPLE_BUTTON}
            >
              1M
            </button>
            <button
              type="button"
              onClick={() => setCapacity("100000")}
              class={SIMPLE_BUTTON}
            >
              100K
            </button>
          </div>
          <label for="pushPercentage">Amount to push? (percentage)</label>
          <input
            type="number"
            name="pushPercentage"
            placeholder="50"
            value={pushPercentage()}
            onInput={(e) => setPushPercentage(e.currentTarget.value)}
            max="100"
          />
          <div class="flex gap-2 -mt-2 mb-2">
            <button
              type="button"
              onClick={() => setPushPercentage("0")}
              class={SIMPLE_BUTTON}
            >
              0%
            </button>
            <button
              type="button"
              onClick={() => setPushPercentage("50")}
              class={SIMPLE_BUTTON}
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => setPushPercentage("100")}
              class={SIMPLE_BUTTON}
            >
              100%
            </button>
          </div>
          <label for="address">Connection string</label>
          <input
            type="text"
            name="connectionString"
            placeholder="pubkey@host:port"
          />
          <input
            type="submit"
            disabled={sendResult.pending}
            value={sendResult.pending ? "..." : "Gimme a lightning channel"}
            class="mt-4 p-4 rounded-xl text-xl font-semibold bg-[#1EA67F] text-white disabled:bg-gray-500"
          />
        </Form>
      </Match>
    </Switch>
  );
}
