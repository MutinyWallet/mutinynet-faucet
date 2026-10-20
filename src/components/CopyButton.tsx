import { createSignal, JSX } from "solid-js";

export function CopyButton(props: { text: string; class?: string; children?: JSX.Element }) {
  const [copied, setCopied] = createSignal(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(props.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (e.g. insecure context); leave the text selectable.
    }
  };

  return (
    <button type="button" onClick={copy} class={props.class ?? "chip shrink-0"}>
      {props.children ? (copied() ? "copied" : props.children) : copied() ? "copied" : "copy"}
    </button>
  );
}
