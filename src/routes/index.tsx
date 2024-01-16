import { Faucet } from "~/components/Faucet";
import { LnChannel } from "~/components/LnChannel";
import { LnFaucet } from "~/components/LnFaucet";
import { NWC } from "~/components/NWC";

export default function Home() {
  return (
    <main class="flex flex-col gap-4 items-center w-full max-w-[40rem] mx-auto">
      <h1 class="font-mono text-4xl drop-shadow-text-glow p-8 font-bold">
        mutinynet
      </h1>
      <Faucet />
      <LnFaucet />
      <LnChannel />
      <NWC />
      <div class="border border-white/50 rounded-xl p-4 w-full gap-2 flex flex-col">
        <h1 class="font-bold text-xl font-mono">Send back your unused sats</h1>
        <pre class="overflow-x-auto whitespace-pre-line break-all p-4 bg-white/10 rounded-lg">
          refund@lnurl-staging.mutinywallet.com
        </pre>
        <pre class="overflow-x-auto whitespace-pre-line break-all p-4 bg-white/10 rounded-lg">
          tb1qd28npep0s8frcm3y7dxqajkcy2m40eysplyr9v
        </pre>
      </div>
      <div class="border border-white/50 rounded-xl p-4 w-full gap-2 flex flex-col">
        <h1 class="font-bold text-xl font-mono">Infinite LNURL Withdrawal!</h1>
        <pre class="overflow-x-auto whitespace-pre-line break-all p-4 bg-white/10 rounded-lg">
          lnurl1dp68gurn8ghj7enpw43k2apwd46hg6tw09hx2apwvdhk6tmpwp5j7mrww4excac7utxd6
        </pre>
      </div>
      <div class="border border-white/50 rounded-xl p-4 w-full gap-2 flex flex-col">
        <h1 class="font-bold text-xl font-mono">Join the Federation</h1>
        <pre class="overflow-x-auto whitespace-pre-line break-all p-4 bg-white/10 rounded-lg">
          fed11qgqzc2nhwden5te0vejkg6tdd9h8gepwvejkg6tdd9h8garhduhx6at5d9h8jmn9wshxxmmd9uqqzgxg6s3evnr6m9zdxr6hxkdkukexpcs3mn7mj3g5pc5dfh63l4tj6g9zk4er
        </pre>
      </div>
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
