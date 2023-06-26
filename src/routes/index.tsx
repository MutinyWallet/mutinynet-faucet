import { Faucet } from "~/components/Faucet";
import { LnFaucet } from "~/components/LnFaucet";

export default function Home() {
  return (
    <main class="flex flex-col gap-4 items-center w-full max-w-[40rem] mx-auto">
      <h1 class="font-mono text-4xl drop-shadow-text-glow p-8 font-bold">
        mutinynet
      </h1>
      <Faucet />
      <LnFaucet />
      <div class="border border-white/50 rounded-xl p-4 w-full gap-2 flex flex-col">
        <h1 class="font-bold text-xl font-mono">Join the mutinynet</h1>
        <p>
          (add this to your <code>bitcoin.conf</code> file)
        </p>
        <pre class="overflow-x-auto whitespace-pre-line break-all p-4 bg-white/10 rounded-lg">
          {`[signet]
signetchallenge=512102f7561d208dd9ae99bf497273e16f389bdbd6c4742ddb8e6b216e64fa2928ad8f51ae
addnode=45.79.52.207:38333
dnsseed=0
signetblocktime=30
          `}
        </pre>
        <p>
          For now you'll{" "}
          <a href="https://github.com/bitcoin/bitcoin/pull/27446">
            need to run a fork of bitcoin core
          </a>{" "}
          to make it work.
        </p>
      </div>
      <div class="h-4" />
    </main>
  );
}
