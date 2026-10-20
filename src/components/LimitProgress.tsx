import { createSignal, onMount, Show } from "solid-js";
import { api } from "~/api/client";

type LimitsResponse = {
  max_daily_sats: number;
  user_used_sats: number;
  ip_used_sats: number;
  remaining_sats: number;
  is_premium: boolean;
  window_seconds: number;
};

function formatSats(sats: number): string {
  return sats.toLocaleString("en-US");
}

export function LimitProgress() {
  const [limits, setLimits] = createSignal<LimitsResponse | null>(null);
  const [error, setError] = createSignal<string | null>(null);

  const load = async () => {
    try {
      const res = await api.get("api/limits");
      if (!res.ok) {
        setError(`Failed to load limits (${res.status})`);
        return;
      }
      const json = (await res.json()) as LimitsResponse;
      setLimits(json);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load limits");
    }
  };

  onMount(() => {
    load();
    // Refresh after each send so the bar reflects new usage.
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  });

  return (
    <Show when={limits()}>
      {(l) => {
        const used = () => Math.max(l().user_used_sats, l().ip_used_sats);
        const pct = () =>
          l().is_premium
            ? 0
            : Math.min(100, Math.round((used() / l().max_daily_sats) * 100));
        const barColor = () => {
          if (l().is_premium) return "bg-mint";
          const p = pct();
          if (p >= 100) return "bg-red-500";
          if (p >= 80) return "bg-yellow-400";
          return "bg-mint";
        };

        return (
          <div class="w-full rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col gap-2 text-left">
            <div class="flex justify-between items-baseline font-mono text-sm">
              <span class="text-white/60">24h limit</span>
              <Show
                when={!l().is_premium}
                fallback={<span class="text-mint">Premium &mdash; no limit</span>}
              >
                <span>
                  <b>{formatSats(l().remaining_sats)}</b>{" "}
                  <span class="text-white/50">sats left</span>
                </span>
              </Show>
            </div>
            <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                class={`h-full ${barColor()} transition-all duration-300`}
                style={{ width: `${l().is_premium ? 100 : pct()}%` }}
              />
            </div>
            <Show when={!l().is_premium}>
              <div class="flex justify-between text-xs text-white/40 font-mono">
                <span>
                  {formatSats(used())} / {formatSats(l().max_daily_sats)} sats
                </span>
                <span>{pct()}% used</span>
              </div>
            </Show>
          </div>
        );
      }}
    </Show>
  );
}
