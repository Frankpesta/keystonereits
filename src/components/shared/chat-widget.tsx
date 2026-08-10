import Script from "next/script";

/** Chatway live-chat widget — loaded on public-facing surfaces (marketing + auth), not the authenticated dashboards. */
export function ChatWidget() {
  return <Script id="chatway" src="https://cdn.chatway.app/widget.js?id=jZXjwZGnJ2os" strategy="afterInteractive" />;
}
