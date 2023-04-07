import { Match, Show, Switch, createSignal } from "solid-js";
import { createServerAction$ } from "solid-start/server";
import { sendToAddress } from "~/core";

const SIMPLE_BUTTON = "mt-4 px-4 py-2 rounded-xl text-xl font-semibold bg-black text-white border border-white";

function Tx(props: { result: { txid: string, howMuchSats: number, toAddress: string } }) {
    const { txid, howMuchSats, toAddress } = props.result;
    return (
        <div class="rounded-xl p-4 flex flex-col items-center gap-2 bg-[rgba(0,0,0,0.5)] max-w-[40rem] drop-shadow-blue-glow">
            <Show when={txid} fallback={
                <>
                    <p>You probably screwed this up didn't you?</p>
                    <button class={SIMPLE_BUTTON} onClick={() => window.location.reload()}>Try again</button>
                </>
            }>
                <p>Sent {howMuchSats} sats to</p>
                <pre class="text-sm font-mono">{toAddress}</pre>
                <a href={`https://mutinynet.com/tx/${txid}`} class="">View on mempool.space</a>
            </Show>
        </div>
    )
}

export function Faucet() {
    const [sendResult, { Form }] = createServerAction$(async (formData: FormData) => {
        // If all else fails give them 1mil sats for trying
        const howMuchSats = parseInt(formData.get("how_much")?.toString() ?? "1000000");
        const toAddress = formData.get("address")?.toString() ?? "tb1q...";

        const txid = await sendToAddress(toAddress, howMuchSats / 100_000_000) as string;
        return { txid, howMuchSats, toAddress }
    });

    const [amount, setAmount] = createSignal("100000");

    return (
        <>
            <Switch>
                <Match when={sendResult.result}>
                    <Tx result={sendResult.result!} />
                </Match>
                <Match when={true}>
                    <Form class="rounded-xl p-4 flex flex-col gap-2 bg-[rgba(0,0,0,0.5)] w-full max-w-[40rem] drop-shadow-blue-glow">
                        <label for="how_much">How much? (sats)</label>
                        <input type="number" name="how_much" placeholder="sats" value={amount()} onChange={(e) => setAmount(e.currentTarget.value)} />
                        <div class="flex gap-2 -mt-2 mb-2">
                            <button type="button" onClick={() => setAmount("10000000")} class={SIMPLE_BUTTON}>10M</button>
                            <button type="button" onClick={() => setAmount("1000000")} class={SIMPLE_BUTTON}>1M</button>
                            <button type="button" onClick={() => setAmount("100000")} class={SIMPLE_BUTTON}>100K</button>
                        </div>
                        <label for="address">Destination</label>
                        <input type="text" name="address" placeholder="tb1q..." />
                        <input type="submit" value="Make it rain" class="mt-4 p-4 rounded-xl text-xl font-semibold bg-[#1EA67F] text-white" />
                    </Form>
                </Match>
            </Switch>

        </>
    );
}