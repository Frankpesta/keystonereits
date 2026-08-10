import { notFound } from "next/navigation";
import { StyleGuideContent } from "./style-guide-content";

export const metadata = {
  title: "Style Guide (dev only)",
};

export default function StyleGuidePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <StyleGuideContent />;
}
