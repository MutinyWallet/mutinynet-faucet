import { APIEvent, json } from "solid-start";
import { payInvoice } from "~/lnd";


// handles HTTP POST requests to /api/invoice
export async function POST({ request }: APIEvent) {
    const payload = await new Response(request.body).json();

    const result = await payInvoice(payload.bolt11)
    if (!result.ok) {
        return new Response(result.error.message, { status: 402 })
    }

    return json(result.value);
}