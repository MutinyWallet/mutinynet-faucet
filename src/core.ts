// As a "server action" this should only run on the server, shouldn't leak anything to the client
export async function sendToAddress(address: string, amountSats: number) {

    const Client = require('bitcoin-core');

    const HOST = import.meta.env.VITE_HOST;
    const PORT = import.meta.env.VITE_PORT;
    const USER = import.meta.env.VITE_USER;
    const PASS = import.meta.env.VITE_PASS;
    const NETWORK = import.meta.env.VITE_NETWORK;

    const client = new Client({ network: NETWORK, username: USER, password: PASS, host: HOST, port: PORT });

    // Dangerously divide by 100_000_000 to convert sats to btc
    const txid = await client.sendToAddress(address, amountSats / 100_000_000) as string;

    return txid
}