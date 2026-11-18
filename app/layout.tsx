import type { Metadata } from "next";
import "./style.css";

export const metadata: Metadata = {
  title: "BriefCast",
  description: "Turn several articles into one cited podcast episode."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
