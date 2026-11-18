import { NextResponse } from "next/server";
import { extractSource } from "@/lib/sources";
import { createAudio, generateEpisode } from "@/lib/generate";
import { saveEpisode } from "@/lib/db";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const { urls, length, tone } = body as Record<string, unknown>;
    if (!Array.isArray(urls) || urls.length < 2 || urls.length > 5 || !urls.every(u => typeof u === "string" && u.length < 2048))
      return NextResponse.json({ error: "Enter 2–5 article links." }, { status: 400 });
    const unique = [...new Set(urls.map(u => (u as string).trim()))];
    if (unique.length < 2) return NextResponse.json({ error: "Enter at least two different links." }, { status: 400 });
    const sources = await Promise.all(unique.map((url, index) => extractSource(url, index + 1)));
    const episode = await generateEpisode(sources, length === "short" ? "short" : "standard", tone === "casual" ? "casual" : "clear and professional");
    episode.audioBase64 = await createAudio(episode);
    await saveEpisode(episode);
    return NextResponse.json(episode);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate episode.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
