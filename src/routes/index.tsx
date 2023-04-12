import { Faucet } from "~/components/Faucet";

export default function Home() {
  return (
    <main class="flex flex-col items-center w-full max-w-[40rem] mx-auto">
      <h1 class="font-mono text-4xl drop-shadow-text-glow p-8 font-bold">mutinynet</h1>
      <Faucet />
      <div class="border border-white/50 rounded-xl p-4 w-full mt-4 gap-2 flex flex-col">
        <h1 class="font-bold text-xl font-mono">Join the mutinynet</h1>
        <p>(add this to your <code>bitcoin.conf</code> file)</p>
        <pre class="overflow-x-auto whitespace-pre-line break-all p-4 bg-white/10 rounded-lg">
          {
            `[signet]
signetchallenge=512102f7561d208dd9ae99bf497273e16f389bdbd6c4742ddb8e6b216e64fa2928ad8f51ae
addnode=45.79.52.207:38333
dnsseed=0
signetblocktime=30
          `
          }
        </pre>
      </div>
    </main>
  );
}
