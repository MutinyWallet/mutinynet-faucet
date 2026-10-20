import { isServer } from "solid-js/web";
import { A, Title, useServerContext } from "solid-start";
import { Logo } from "~/components/Logo";

export default function NotFound() {
  // Set the status directly: solid-start's <HttpStatusCode> resets it to 200
  // in onCleanup, which runs before the response is built.
  const event = useServerContext();
  if (isServer) event.setStatusCode(404);

  return (
    <section class="relative">
      <Title>Not found · MUTINYNET</Title>
      <div class="hero-halo absolute inset-x-0 top-0 h-[36rem] -z-10 pointer-events-none" />
      <div class="max-w-xl mx-auto px-4 pt-20 pb-16 flex flex-col items-center text-center gap-5">
        <Logo class="w-16 h-16 text-white drop-shadow-[0_0_40px_rgba(30,80,200,0.6)]" />
        <h1 class="font-mono text-7xl sm:text-8xl font-bold tracking-tight">404</h1>
        <p class="font-mono text-lg">This block was never mined.</p>
        <p class="text-white/60 max-w-sm">
          Nothing lives at this path. Head back to the faucet for coins, channels and the rest.
        </p>
        <A href="/" class="btn-primary no-underline px-8 mt-2">
          Back to the faucet
        </A>
      </div>
    </section>
  );
}
