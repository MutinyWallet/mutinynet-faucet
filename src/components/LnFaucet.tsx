import {setToken, token} from "~/stores/auth";
import { Match, Switch } from "solid-js";
import { createRouteAction } from "solid-start";
import {api} from "~/api/client";

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;

const SIMPLE_BUTTON = "btn-secondary mt-2";

function Pop(props: any) {
  return (
    <div class="w-full flex flex-col items-center gap-2 text-center">
      {/* {JSON.stringify(props, null, 2)} */}
      <Switch>
        <Match when={props.result}>
          <p>Paid the invoice, here's your proof</p>
          <pre class="text-sm font-mono break-all whitespace-pre-wrap">{props.result?.payment_hash}</pre>
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

export function LnFaucet() {
  const [sendResult, { Form }] = createRouteAction(
    async (formData: FormData) => {
      let bolt11 = formData.get("bolt11")?.toString();

      if (!bolt11) {
        throw new Error("No bolt11 provided");
      } else {
        // Strip surrounding quotation marks if they exist
        bolt11 = bolt11.replace(/^"|"$/g, '').trim();

        // Remove "lightning:" prefix if it exists
        if (bolt11.startsWith("lightning:")) {
          bolt11 = bolt11.substring(10);
        }

        // const result = await payInvoice(bolt11);
        const res = await api.post("api/lightning", {
          bolt11
        });

        if (!res.ok) {
          const text = await res.text();
          if (text.startsWith("<!DOCTYPE html>")) {
            throw new Error("Rate limit exceeded");
          } else {
            throw new Error(text);
          }
        } else {
          return res.json();
        }
      }
    }
  );

  return (
    <Switch>
      <Match when={sendResult.result || sendResult.error}>
        <Pop result={sendResult.result} error={sendResult.error} />
      </Match>
      <Match when={true}>
        <Form class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="bolt11" class="field-label">Bolt11 payment request</label>
            <textarea rows="4" id="bolt11" name="bolt11" placeholder="lntb..." />
          </div>
          <input
            type="submit"
            disabled={sendResult.pending}
            value={sendResult.pending ? "..." : "Strike me now"}
            class="btn-primary"
          />
        </Form>
      </Match>
    </Switch>
  );
}

