"use client";
import { useState } from "react";
import type { Episode } from "@/lib/types";

export default function Home() {
  const [links, setLinks] = useState("\n");
  const [length, setLength] = useState("short");
  const [tone, setTone] = useState("clear");
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setError(""); setEpisode(null); setLoading(true);
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ urls: links.split("\n").map(s => s.trim()).filter(Boolean), length, tone }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not generate episode.");
      setEpisode(result);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Something went wrong."); }
    finally { setLoading(false); }
  }

  return <main className="shell">
    <header><span className="brand">BRIEF<span>CAST</span></span><span className="tag">Your reading list, heard.</span></header>
    <section className="hero"><p className="eyebrow">A BETTER WAY TO CATCH UP</p><h1>Many links.<br/><em>One good listen.</em></h1><p>Turn articles and newsletters into a short podcast with a clear trail back to every source.</p></section>
    <section className="panel"><div className="panelTitle"><span className="step">01</span><h2>Build your episode</h2></div>
      <label htmlFor="links">Article links <small>2–5 links, one per line</small></label>
      <textarea id="links" value={links} onChange={e => setLinks(e.target.value)} placeholder={"https://example.com/story-one\nhttps://example.com/story-two"} rows={5}/>
      <div className="controls"><div><label htmlFor="length">Length</label><select id="length" value={length} onChange={e => setLength(e.target.value)}><option value="short">Quick listen</option><option value="standard">Deeper dive</option></select></div><div><label htmlFor="tone">Tone</label><select id="tone" value={tone} onChange={e => setTone(e.target.value)}><option value="clear">Clear & focused</option><option value="casual">Casual</option></select></div></div>
      <button onClick={generate} disabled={loading}>{loading ? "Reading and producing your episode…" : "Create episode"}<span>↗</span></button>
      {error && <p className="error" role="alert">{error}</p>}
    </section>
    {episode && <section className="result"><div className="panelTitle"><span className="step">02</span><h2>Your episode</h2></div><h3>{episode.title}</h3><p>{episode.summary}</p>
      {episode.audioBase64 && <audio controls src={`data:audio/mpeg;base64,${episode.audioBase64}`}/>}
      <details><summary>Read the transcript</summary>{episode.segments.map((s,i)=><p key={i}>{s.text} <span className="citations">{s.sourceIds.map(id => <a key={id} href={episode.sources.find(x=>x.id===id)?.url} target="_blank" rel="noreferrer">[{id}]</a>)}</span></p>)}</details>
      <h4>Sources</h4><ol>{episode.sources.map(s=><li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ol>
    </section>}
    <footer>BriefCast · Source-aware audio for curious people</footer>
  </main>;
}
