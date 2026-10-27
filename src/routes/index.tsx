import { Faucet } from "~/components/Faucet";
import { LimitProgress } from "~/components/LimitProgress";
import { LnChannel } from "~/components/LnChannel";
import { LnFaucet } from "~/components/LnFaucet";
import { NWC } from "~/components/NWC";
import { Arkade } from "~/components/Arkade";
import { Logo } from "~/components/Logo";
import { CopyButton } from "~/components/CopyButton";
import {createSignal, For, JSX, onMount, Show} from "solid-js";
import {isAuthed, logout, setToken, token} from "~/stores/auth";
import {AuthButton} from "~/components/AuthButton";
import {L402Login} from "~/components/L402Login";
import {api} from "~/api/client";

const BITCOIN_CONF = `[signet]
signetchallenge=512102f7561d208dd9ae99bf497273e16f389bdbd6c4742ddb8e6b216e64fa2928ad8f51ae
addnode=45.79.52.207:38333
dnsseed=0
signetblocktime=30`;

const FAUCET_NODE = "02465ed5be53d04fde66c9418ff14a5f2267723810176c9212b722e542dc1afb1b@45.79.52.207:9735";
const FEDIMINT_INVITE = "fed11qgqzc2nhwden5te0vejkg6tdd9h8gepwvejkg6tdd9h8garhduhx6at5d9h8jmn9wshxxmmd9uqqzgxg6s3evnr6m9zdxr6hxkdkukexpcs3mn7mj3g5pc5dfh63l4tj6g9zk4er";
const CASHU_MINT = "https://cashu.mutinynet.com";
const LNURL_WITHDRAW = "lnurl1dp68gurn8ghj7enpw43k2apwd46hg6tw09hx2apwvdhk6tmpwp5j7mrww4excac7utxd6";
const REFUND_LN_ADDRESS = "refund@lnurl.mutinynet.com";
const REFUND_ADDRESS = "tb1qmt3ue2senlg6ddgmr76hwsk0rdvdk4rgeaen7l";

type Action = {
    id: string;
    icon: string;
    title: string;
    desc: string;
    // Whether the action needs a GitHub or L402 login.
    auth: boolean;
};

const ACTIONS: Action[] = [
    { id: "onchain", icon: "₿", title: "Get coins", desc: "On-chain signet sats", auth: true },
    { id: "lightning", icon: "⚡", title: "Pay invoice", desc: "The faucet pays your bolt11", auth: true },
    { id: "channel", icon: "⇄", title: "Open channel", desc: "Inbound liquidity to you", auth: true },
    { id: "nwc", icon: "◎", title: "Test NWC", desc: "Zaps and keysends", auth: true },
    { id: "arkade", icon: "⛵", title: "Arkade", desc: "Pay any destination", auth: true },
    { id: "node", icon: "⚓", title: "Run a node", desc: "bitcoin.conf and peers", auth: false },
];

function InfoCard(props: { title: string; value: string; wrap?: boolean }) {
    return (
        <div class="rounded-2xl border border-white/10 bg-black/30 p-4 flex flex-col gap-2 min-w-0">
            <div class="flex justify-between items-center gap-2">
                <h3 class="font-mono font-bold text-sm">{props.title}</h3>
                <CopyButton text={props.value} />
            </div>
            <code class={`text-xs text-white/60 ${props.wrap ? "break-all" : "truncate"}`}>{props.value}</code>
        </div>
    );
}

function NodeSetup() {
    return (
        <div class="flex flex-col gap-3">
            <div class="flex justify-between items-baseline gap-2">
                <span class="field-label">
                    Add this to your <code>bitcoin.conf</code>
                </span>
                <CopyButton text={BITCOIN_CONF} />
            </div>
            <pre class="p-4 rounded-lg bg-white/5 text-sm overflow-x-auto">{BITCOIN_CONF}</pre>
            <p class="text-xs text-white/50">
                For now you'll{" "}
                <a href="https://github.com/benthecarman/bitcoin/releases">
                    need to run a fork of bitcoin core
                </a>{" "}
                to make it work.
            </p>
        </div>
    );
}

function SignInPrompt() {
    return (
        <div class="flex flex-col items-center gap-3 py-6 text-center">
            <p class="text-white/70">Sign in to use this.</p>
            <button
                type="button"
                class="btn-secondary"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
                Sign in
            </button>
        </div>
    );
}

export default function Home() {
    // Client-only flag to prevent SSR hydration issues
    const [isClient, setIsClient] = createSignal(false);
    const [selected, setSelected] = createSignal("onchain");

    onMount(() => {
        // Mark as client-side
        setIsClient(true);

        // Ensure token is loaded from localStorage
        const storedToken = localStorage.getItem("token");
        if (storedToken && !token()) {
            setToken(storedToken);
        }

        // Handle auth callback
        const params = new URLSearchParams(window.location.search);
        const tk = params.get("token");

        if (tk) {
            // Store token in localStorage and state (GitHub OAuth callback)
            localStorage.setItem("token", tk);
            setToken(tk);

            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (token()) {
            // Check if Bearer token is still valid
            api.get("auth/check").then(async res => {
                let json = await res.json();
                if (json.status !== "OK") {
                    // Logout if token is invalid
                    localStorage.removeItem("token");
                    setToken(null);
                }
            });
        }
    });

    const authed = () => isClient() && isAuthed();

    // Keep every authed form mounted so switching tiles doesn't drop typed input.
    const panels: Record<string, () => JSX.Element> = {
        onchain: () => <Faucet />,
        lightning: () => <LnFaucet />,
        channel: () => <LnChannel />,
        nwc: () => <NWC />,
        arkade: () => <Arkade />,
    };

  return (
    <>
      <section class="relative">
        <div class="hero-halo absolute inset-x-0 top-0 h-[36rem] -z-10 pointer-events-none" />
        <div class="relative max-w-3xl mx-auto px-4 pt-14 pb-12 flex flex-col items-center text-center gap-5">
          <Logo class="w-20 h-20 sm:w-24 sm:h-24 text-white drop-shadow-[0_0_40px_rgba(30,80,200,0.6)]" />
          <h1 class="font-mono text-5xl sm:text-6xl font-bold tracking-tight">mutinynet</h1>
          <p class="text-lg text-white/70 max-w-md">
            A signet with 30-second blocks. Free coins, Lightning, Fedimint, Cashu and Arkade for testing your
            bitcoin app.
          </p>

          <Show when={isClient()} fallback={<div class="h-12" />}>
            <Show
              when={isAuthed()}
              fallback={
                <>
                  <div class="flex flex-wrap justify-center gap-3 mt-2">
                    <AuthButton />
                    <L402Login />
                  </div>
                  <p class="text-xs text-white/40">
                    No account needed with Lightning &mdash; pay an invoice to get access.{" "}
                    Agents: <a href="/llms.txt">llms.txt</a>
                  </p>
                </>
              }
            >
              <div class="w-full max-w-md mt-2 flex flex-col gap-2">
                <LimitProgress />
                <button type="button" onClick={logout} class="self-end text-xs font-mono text-white/40 hover:text-white">
                  logout
                </button>
              </div>
            </Show>
          </Show>
        </div>
      </section>

      <main class="w-full max-w-4xl mx-auto px-4 flex flex-col gap-10">
        <section class="flex flex-col gap-4">
          <div class="flex items-baseline justify-between gap-2">
            <h2 class="font-mono text-xl font-bold">What do you need?</h2>
            <Show when={isClient() && !isAuthed()}>
              <span class="text-xs text-white/40">sign in to use these</span>
            </Show>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <For each={ACTIONS}>
              {(action) => (
                <button
                  type="button"
                  onClick={() => setSelected(action.id)}
                  aria-pressed={selected() === action.id}
                  class="text-left rounded-2xl border p-4 transition-colors"
                  classList={{
                    "border-mint bg-mint/10": selected() === action.id,
                    "border-white/10 bg-black/40 hover:border-white/40": selected() !== action.id,
                  }}
                >
                  <div class="text-2xl">{action.icon}</div>
                  <div class="mt-2 font-mono font-bold">{action.title}</div>
                  <div class="text-xs text-white/50">{action.desc}</div>
                </button>
              )}
            </For>
          </div>

          <div class="panel">
            <Show when={selected() === "node"}>
              <NodeSetup />
            </Show>
            <Show when={selected() !== "node"}>
              <Show when={authed()} fallback={<SignInPrompt />}>
                <For each={Object.keys(panels)}>
                  {(id) => <div classList={{ hidden: selected() !== id }}>{panels[id]()}</div>}
                </For>
              </Show>
            </Show>
          </div>
        </section>

        <section class="flex flex-col gap-4">
          <h2 class="font-mono text-xl font-bold">Plug in</h2>
          <div class="grid sm:grid-cols-2 gap-3">
            <InfoCard title="Faucet Lightning node" value={FAUCET_NODE} wrap />
            <InfoCard title="Join the Federation" value={FEDIMINT_INVITE} />
            <InfoCard title="Cashu mint" value={CASHU_MINT} />
            <Show when={authed()}>
              <InfoCard title="Infinite LNURL withdrawal" value={LNURL_WITHDRAW} />
            </Show>
          </div>
        </section>

        <section class="rounded-2xl bg-navy/40 border border-white/10 p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
          <div class="flex-1">
            <h2 class="font-mono text-lg font-bold">Done testing?</h2>
            <p class="text-sm text-white/60">Send back your unused sats so the faucet stays full.</p>
          </div>
          <div class="flex flex-col gap-2 text-sm font-mono min-w-0">
            <CopyButton
              text={REFUND_LN_ADDRESS}
              class="text-left px-3 py-2 rounded-lg bg-black/40 hover:bg-black/60 truncate"
            >
              ⚡ {REFUND_LN_ADDRESS}
            </CopyButton>
            <CopyButton
              text={REFUND_ADDRESS}
              class="text-left px-3 py-2 rounded-lg bg-black/40 hover:bg-black/60 truncate sm:max-w-xs"
            >
              ₿ {REFUND_ADDRESS}
            </CopyButton>
          </div>
        </section>
      </main>
    </>
  );
}
