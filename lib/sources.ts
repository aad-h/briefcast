import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import type { Source } from "./types";

function publicAddress(address: string): boolean {
  if (address.includes(":")) return !(/^(::1|fc|fd|fe80|::ffff:127\.|::ffff:10\.)/i.test(address));
  const p = address.split(".").map(Number);
  return !(p[0] === 0 || p[0] === 10 || p[0] === 127 || p[0] >= 224 ||
    (p[0] === 169 && p[1] === 254) || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
    (p[0] === 192 && p[1] === 168) || (p[0] === 100 && p[1] >= 64 && p[1] <= 127));
}

async function checkedUrl(input: string): Promise<URL> {
  const url = new URL(input);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.port && !["80", "443"].includes(url.port)) throw new Error("Use a public HTTP or HTTPS article URL.");
  if (isIP(url.hostname) || url.hostname === "localhost" || url.hostname.endsWith(".local")) throw new Error("Private or local URLs are not allowed.");
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => !publicAddress(address))) throw new Error("Private or local URLs are not allowed.");
  return url;
}

export async function extractSource(input: string, id: number): Promise<Source> {
  let current = input;
  for (let hop = 0; hop < 4; hop++) {
    const url = await checkedUrl(current);
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(12000), headers: { "User-Agent": "BriefCast/0.1 (personal podcast tool)" } });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Article redirect had no destination.");
      current = new URL(location, url).toString();
      continue;
    }
    if (!response.ok) throw new Error(`Could not load article (${response.status}).`);
    if (!(response.headers.get("content-type") || "").includes("text/html")) throw new Error("Link must point to an HTML article.");
    const html = await response.text();
    if (html.length > 2_000_000) throw new Error("Article is too large.");
    const dom = new JSDOM(html, { url: url.toString() });
    const article = new Readability(dom.window.document).parse();
    dom.window.close();
    const text = (article?.textContent || "").replace(/\s+/g, " ").trim();
    if (text.length < 250) throw new Error("Could not extract enough article text. Try another link.");
    return { id, url: url.toString(), title: article?.title || url.hostname, text: text.slice(0, 12000) };
  }
  throw new Error("Too many redirects.");
}
