# Caesar Verifier

Paste a claim, a paragraph, or a URL. Every factual claim is checked against **live web sources** and shown with the exact passage it came from and **the moment that source was captured** — not a model's memory.

Free. No signup. No API key. Powered by [Caesar](https://trycaesar.com) search.

## Why this is different

Most "fact check" tools ask a model what it remembers. This one **reads live sources** and shows you the receipt: the passage, the source link, and a capture timestamp you can point to. It never claims "true" or "false" — it tells you whether a claim is **supported by a live source captured at a specific moment**:

- **VERIFIED** — the claim's terms and a hard token (a number, date, or acronym) appear in a captured passage.
- **NEEDS CONTEXT** — the source discusses the same thing, but the specific figure isn't there.
- **UNSUPPORTED** — the source was read, and it doesn't back the claim.

## Run it locally (zero setup)

```bash
git clone https://github.com/TF-Caesar/caesar-verifier
cd caesar-verifier
npm install
npm run dev
```

No keys required — it runs on Caesar's free anonymous tier. Optional env:

- `CAESAR_SEARCH_API_KEY` — higher rate limits.
- `CLAIMS_LLM_KEY` — an Anthropic key for sharper claim extraction (off by default; deterministic otherwise).
- `VERIFIER_DEMO=1` — force the cached demo response (offline showcase).

## How it works

`search` the claim → `read` the top sources → match the claim against the **captured passage** → label it. The entire Caesar integration is one small, dependency-light file you can copy into your own project: [`lib/caesar.ts`](lib/caesar.ts).

## License

MIT.
