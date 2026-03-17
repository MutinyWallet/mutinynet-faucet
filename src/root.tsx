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
        <Scripts />
      </Body>
    </Html>
  );
}
