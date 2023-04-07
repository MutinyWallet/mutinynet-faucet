import { Faucet } from "~/components/Faucet";

export default function Home() {
  return (
    <main class="flex flex-col items-center w-full">
      <h1 class="font-mono text-4xl drop-shadow-text-glow p-8">mutinynet</h1>
      <Faucet />
    </main>
  );
}
