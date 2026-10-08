import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import QRCode from "qrcode";
import { loginL402 } from "~/stores/auth";

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;

export function L402Login() {
  const [invoice, setInvoice] = createSignal<string | null>(null);
  const [l402Token, setL402Token] = createSignal<string | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [polling, setPolling] = createSignal(false);
  const [copied, setCopied] = createSignal(false);
  const [qrSvg, setQrSvg] = createSignal<string | null>(null);

  createEffect(() => {
    const inv = invoice();
    setQrSvg(null);
    if (!inv) return;
    QRCode.toString(`lightning:${inv.toUpperCase()}`, { type: "svg", margin: 2 })
      .then((svg) => {
        if (invoice() === inv) setQrSvg(svg);
      })
      .catch(() => {});
  });

  let pollInterval: ReturnType<typeof setInterval> | undefined;

  onCleanup(() => {
    if (pollInterval) clearInterval(pollInterval);
  });

  const startL402 = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${FAUCET_API_URL}/api/l402`, { method: "POST" });
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      const data = await res.json();
      setInvoice(data.invoice);
      setL402Token(data.token);
      setPolling(true);

      pollInterval = setInterval(async () => {
        try {
          const checkRes = await fetch(
            `${FAUCET_API_URL}/api/l402/check?token=${encodeURIComponent(data.token)}`,
            { headers: { "X-L402-Claim": data.claim } }
          );
          if (!checkRes.ok) return;
          const check = await checkRes.json();
          if (check.status === "settled") {
            clearInterval(pollInterval);
            setPolling(false);
            if (check.preimage) {
              loginL402(data.token, check.preimage);
            } else {
              setError("Payment received but login failed. Please contact us.");
            }
          } else if (check.status === "expired") {
            clearInterval(pollInterval);
            setPolling(false);
            setError("Invoice expired. Try again.");
            setInvoice(null);
            setL402Token(null);
          }
        } catch {
          // keep polling
        }
      }, 3000);
    } catch (e: any) {
      setError(e.message || "Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  };

  const copyInvoice = () => {
    const inv = invoice();
    if (inv) {
      navigator.clipboard.writeText(inv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div class="flex flex-col gap-3 items-center w-full">
      <Show
        when={invoice()}
        fallback={
          <button
            onClick={startL402}
            disabled={loading()}
            class="px-4 py-2 bg-[#F7931A] text-white rounded disabled:bg-gray-500"
          >
            {loading() ? "..." : "Pay with Lightning"}
          </button>
        }
      >
        <p class="text-sm text-center">Pay this invoice to log in:</p>
        <Show when={qrSvg()}>
          <a
            href={`lightning:${invoice()}`}
            class="block w-64 max-w-full bg-white rounded-lg overflow-hidden"
            innerHTML={qrSvg()!}
          />
        </Show>
        <pre
          onClick={copyInvoice}
          class="overflow-x-auto whitespace-pre-line break-all p-4 bg-white/10 rounded-lg w-full text-sm cursor-pointer"
        >
          {invoice()}
        </pre>
        <p class="text-xs text-white/50">
          {copied() ? "Copied!" : "Click to copy"}
        </p>
        <Show when={polling()}>
          <p class="text-sm text-white/70">Waiting for payment...</p>
        </Show>
      </Show>
      <Show when={error()}>
        <p class="text-sm text-red-400">{error()}</p>
      </Show>
    </div>
  );
}
