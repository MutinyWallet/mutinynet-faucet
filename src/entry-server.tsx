import {
  StartServer,
  createHandler,
  renderAsync,
} from "solid-start/entry-server";
import {
  appendAgentLinkHeaders,
  handleAgentRequest,
} from "~/agent-ready";

export default createHandler(
  ({ forward }) => async (event) => {
    const response = handleAgentRequest(event.request);
    if (response) return response;
    return forward(event);
  },
  renderAsync((event) => {
    if (new URL(event.request.url).pathname === "/") {
      appendAgentLinkHeaders(event.responseHeaders);
    }
    return <StartServer event={event} />;
  })
);
