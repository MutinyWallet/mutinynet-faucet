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
          if (l().is_premium) return "bg-[#1EA67F]";
          const p = pct();
          if (p >= 100) return "bg-red-500";
          if (p >= 80) return "bg-yellow-400";
          return "bg-[#1EA67F]";
        };

        return (
          <div class="border border-white/50 rounded-xl p-4 w-full gap-2 flex flex-col">
            <div class="flex justify-between items-baseline">
              <h2 class="font-bold text-xl font-mono">24h Limit</h2>
              <Show
                when={!l().is_premium}
                fallback={
                  <span class="text-sm text-[#1EA67F] font-mono">
                    Premium &mdash; no limit
                  </span>
                }
              >
                <span class="text-sm font-mono text-white/80">
                  {formatSats(l().remaining_sats)} sats left
                </span>
              </Show>
            </div>
            <div class="w-full h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                class={`h-full ${barColor()} transition-all duration-300`}
                style={{ width: `${l().is_premium ? 100 : pct()}%` }}
              />
            </div>
            <Show when={!l().is_premium}>
              <div class="flex justify-between text-xs text-white/60 font-mono">
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
