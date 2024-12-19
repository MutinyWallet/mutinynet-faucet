// @refresh reload
import {Match, Show, Suspense, Switch} from "solid-js";
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
import { AuthButton } from "./components/AuthButton";
import {token} from "~/stores/auth";

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>MUTINYNET</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Link rel="icon" href="/favicon.svg" />
        <Show when={token()}>
            <AuthButton />
        </Show>
      </Head>
      <Body>
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
