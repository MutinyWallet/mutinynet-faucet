// @refresh reload
import { Suspense } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
  Link,
} from "solid-start";
import "./root.css";

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>MUTINYNET</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Link rel="icon" href="/favicon.svg" />
      </Head>
      <Body>
        <a
          href="https://github.com/benthecarman/mutinynet-cli"
          target="_blank"
          rel="noopener noreferrer"
          class="block w-full bg-white/10 px-4 py-2 text-center text-sm font-mono text-white hover:bg-white/20 transition-colors"
        >
          New: interact with mutinynet from the command line &rarr; <code>mutinynet-cli</code>
        </a>
        <Suspense>
          <ErrorBoundary>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <footer class="w-full border-t border-white/20 mt-8 py-6 text-center text-sm text-white/60">
          <p>
            For consulting, reach out at{" "}
            <a href="mailto:hello@mutinynet.com" class="underline text-white/80 hover:text-white">
              hello@mutinynet.com
            </a>
            {" "}&middot;{" "}
            <a
              href="https://x.com/benthecarman"
              target="_blank"
              rel="noopener noreferrer"
              class="underline text-white/80 hover:text-white"
            >
              @benthecarman
            </a>
          </p>
        </footer>
        <Scripts />
      </Body>
    </Html>
  );
}
