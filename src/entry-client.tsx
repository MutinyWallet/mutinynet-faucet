import { mount, StartClient } from "solid-start/entry-client";
import { registerWebMCPTools } from "~/webmcp";

mount(() => <StartClient />, document);

registerWebMCPTools();
