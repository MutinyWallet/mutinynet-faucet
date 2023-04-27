import { authenticatedLndGrpc, decodePaymentRequest, getChannelBalance, getWalletInfo, pay } from "lightning";

const cert = import.meta.env.VITE_TLS_CERT as string;
const macaroon = import.meta.env.VITE_ADMIN_MACAROON as string;
const socket = import.meta.env.VITE_LND_GRPC as string;

export type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E };

export async function payInvoice(bolt11: string): Promise<Result<{ id: string }>> {
    try {
        const { lnd } = authenticatedLndGrpc({
            cert,
            macaroon,
            socket,
        });

        let balance = await getChannelBalance({ lnd });

        const { destination, tokens } = await decodePaymentRequest({ lnd, request: bolt11 });

        const requestBalance = tokens;

        console.log(`New request for ${tokens} sats to ${destination}, we have ${balance.channel_balance} sats left to spend`);

        // If it's more than half our funds, or more than 1M sats, reject it
        if (requestBalance > balance.channel_balance / 2 || requestBalance > 1000000) {
            console.error(`Not enough funds to pay ${destination}`)
            return ({ ok: false, error: new Error("Insufficient funds, try a smaller amount") })
        } else {
            const { id } = await pay({ lnd, request: bolt11 });
            console.log(`Paid to ${destination}`)
            return ({ ok: true, value: { id } })
        }
    } catch (e) {
        // The weirdest error object of all time
        const [code, type, obj] = e as any;

        if (e) {
            return ({ ok: false, error: new Error(type) })
        } else {
            return ({ ok: false, error: new Error("Something went wrong, try again later") })
        }

    }
}

