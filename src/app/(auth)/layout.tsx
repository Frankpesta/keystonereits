import { ChatWidget } from "@/components/shared/chat-widget";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
