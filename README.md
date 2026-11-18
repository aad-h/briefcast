# BriefCast

BriefCast turns 2–5 article or newsletter links into a short, cited podcast episode. It extracts readable text, asks an LLM to draft a source-linked script, validates the script's structure and citation IDs, and generates MP3 audio. The transcript links back to the original articles.

## Run locally

1. Install Node.js 20+ and run `npm install`.
2. Copy `.env.example` to `.env.local` and add an OpenAI API key. This uses paid API calls.
3. Optionally set `DATABASE_URL` to a PostgreSQL connection string. Without it, generation still works but episodes are not saved.
4. Run `npm run dev` and open http://localhost:3000.

Use two or more public HTML article URLs. Paywalled pages and some JavaScript-heavy sites may not provide readable content.

## Architecture

- Next.js + TypeScript client and API route
- Mozilla Readability + JSDOM for extraction
- OpenAI Responses API for script generation; speech API for MP3
- PostgreSQL for optional episode metadata and transcripts (audio is returned to the browser, not stored)

## Current limits

This is a local MVP. There is no login, episode library, audio persistence, timestamp synchronization, or claim-level factual verification. Citation validation checks that each segment references a supplied source; it cannot prove every claim is supported. Run behind authentication and add rate limiting before public deployment.
