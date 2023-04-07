import { APIEvent, json } from "solid-start";
import { sendToAddress } from "~/core";

// handles HTTP GET requests to /api/faucet
export async function POST({ request }: APIEvent) {
    const payload = await new Response(request.body).json();
    console.log(payload);

    const txid = await sendToAddress(payload.address, payload.sats)

    return json({ txid });
}