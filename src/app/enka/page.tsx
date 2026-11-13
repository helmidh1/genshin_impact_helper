import type { Metadata } from "next";
import { EnkaLookupClient } from "@/components/EnkaLookupClient";

export const metadata: Metadata = {
  title: "Enka Showcase Lookup — Teyvat Strategist",
  description:
    "Look up any public 9- or 10-digit Genshin Impact UID showcase via Enka.Network without logging in.",
};

export default function EnkaPage() {
  return <EnkaLookupClient />;
}
