import { Match, Switch } from "solid-js";
import { Form } from "solid-start/data/Form";
import { createServerAction$ } from "solid-start/server";
import { payInvoice } from "~/lnd";

const SIMPLE_BUTTON = "mt-4 px-4 py-2 rounded-xl text-xl font-semibold bg-black text-white border border-white";

function Pop(props: any) {
    return (
        <div class="rounded-xl p-4 w-full flex flex-col items-center gap-2 bg-[rgba(0,0,0,0.5)] drop-shadow-blue-glow">
            {/* {JSON.stringify(props, null, 2)} */}
            <Switch>
                <Match when={props.result}>
                    <p>Paid the invoice, here's your proof</p>
                    <pre class="text-sm font-mono">{props.result?.id}</pre>
                    <button class={SIMPLE_BUTTON} onClick={() => window.location.reload()}>Start Over</button>
                </Match>
                <Match when={props.error}>
                    <p>Something went wrong</p>
                    <code>{props.error.message}</code>
                    <button class={SIMPLE_BUTTON} onClick={() => window.location.reload()}>Try again</button>
                </Match>
                <Match when={true}>
                    <p>You probably screwed this up didn't you?</p>
                    <p>(Make sure you're using a signet address btw, and don't ask for more than 1BTC)</p>
                    <button class={SIMPLE_BUTTON} onClick={() => window.location.reload()}>Try again</button>
                </Match>
            </Switch>
        </div>
    )
}

export function LnFaucet() {

    const [sendResult, { Form }] = createServerAction$(async (formData: FormData) => {
        // If all else fails give them 100k sats for trying
        const bolt11 = formData.get("bolt11")?.toString();

        if (!bolt11) {
            throw new Error("No bolt11 provided")
        } else {
            const result = await payInvoice(bolt11);
            if (result.ok) {
                return result.value
            } else {
                throw result.error
            }
        }
    });

    return (
        <Switch>
            <Match when={sendResult.result || sendResult.error}>
                <Pop result={sendResult.result} error={sendResult.error} />
            </Match>
            <Match when={true}>
                <Form class="rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)] w-full drop-shadow-blue-glow">
                    <label for="address">Bolt11 Payment Request</label>
                    <textarea rows="4" name="bolt11" placeholder="lntb..." />
                    <input type="submit" disabled={sendResult.pending} value={sendResult.pending ? "..." : "Strike me now"} class="mt-4 p-4 rounded-xl text-xl font-semibold bg-[#1EA67F] text-white disabled:bg-gray-500" />
                </Form>
            </Match>
        </Switch>
    )
}

