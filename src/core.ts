import Client from 'bitcoin-core';

// As a "server action" this should only run on the server, shouldn't leak anything to the client
export async function sendToAddress(address: string, amountSats: number) {
    const HOST = import.meta.env.VITE_HOST;
    const PORT = import.meta.env.VITE_PORT;
    const USER = import.meta.env.VITE_USER;
    const PASS = import.meta.env.VITE_PASS;
    const NETWORK = import.meta.env.VITE_NETWORK;

    const client = new Client({ network: NETWORK, username: USER, password: PASS, host: HOST, port: PORT });

    // Dangerously divide by 100_000_000 to convert sats to btc
    let howMuch = amountSats / 100000000
    console.log(`Request to send ${howMuch} BTC to ${address}`)

    // Prevent sending more than 1 BTC
    howMuch = Math.min(howMuch, 1.0)

    // Prevent sending more than half the current balance
    const currentBalance = await client.getBalance('*', 110)
    console.log(`Current node balance: ${currentBalance}`);
    howMuch = Math.min(howMuch, currentBalance / 2);

    console.log(`Actually sending ${howMuch} BTC to ${address}`)

    const txid = await client.sendToAddress(address, howMuch) as string;

    return txid
}