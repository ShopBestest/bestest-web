# bestest-mcp

A public, read-only remote MCP server for Bestest's screened used-car inventory in Orange County, CA. It lets ChatGPT (Apps SDK / plugin directory) and Claude (connectors directory) search the same feed shopbestest.com renders, so every result an assistant shows has already passed Bestest's screen: approved model, year and trim, under 50K miles, factory-authorized dealer.

- Runtime: Cloudflare Worker, Streamable HTTP transport (MCP spec 2025-11-25 via `@modelcontextprotocol/sdk`), stateless, no auth.
- Data: `https://bestest-inventory-feed.sweet-paper-5a21.workers.dev/` (same feed `js/srp-engine.js` consumes), cached for 5 minutes in Worker memory and at the edge.
- Zip → lat/lng: a bundled centroid table (`data/zips.json`, 536 Southern California ZCTAs). No external geocoding calls.
- Images: the feed's `img` value is passed through verbatim. The server never builds Cloudinary transformation URLs.

## Endpoints

| Path | Purpose |
| --- | --- |
| `POST /mcp` | MCP Streamable HTTP endpoint. `GET`/`DELETE` return 405 (stateless, nothing to stream). |
| `GET /` or `/health` | JSON status document (tool names, endpoint URL, zip table size). |
| `GET /.well-known/openai-apps-challenge` | Serves the `OPENAI_APPS_CHALLENGE` var as plain text for OpenAI's domain check. 404 until set. |
| `GET /privacy`, `/terms` | 302 to the same paths on shopbestest.com. |

## Tools

All three are annotated `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`, `openWorldHint: false` and carry a `title` (both directories require this).

| Tool | Inputs | Returns |
| --- | --- | --- |
| `search_cars` | `segment`, `make`, `model`, `powertrain` (gas / hybrid / plug-in hybrid / electric), `max_price`, `max_miles`, `min_year`, `zip` + `radius_miles` (default 25), `sort` (price / miles / distance), `limit` (1–20, default 10), `offset` | Qualifying cars: title, trim, price, miles, powertrain, segment, dealer + city, distance when a zip is given, listing URL (`/used/{slug}`), image URL. Total count for paging. |
| `get_car` | `slug` or `id` (a pasted listing URL also works), optional `zip` | One car with the same fields. |
| `list_segments` | none | Every segment with count, price range, median and the segment page URL. Includes the site's two virtual segments, Hybrids and Electric Vehicles. |

Every response ends with the line: *Every car listed passed Bestest's screen: approved model, year and trim, under 50K miles, sold by a factory-authorized dealer. https://shopbestest.com*. Responses also carry `structuredContent` (JSON) alongside the text, which ChatGPT and Claude both read.

Wording rules baked into descriptions and responses: "screened", "approved", "qualify". Never "only N" or "more coming". Empty results say "No screened cars currently qualify for …" and suggest widening the filters.

Filter behavior mirrors the site: segment names resolve case-insensitively with aliases (`evs`, `minivans`, `luxury midsize suv`); make/model use prefix matching (`crv` finds CR-V, `model 3` finds Model 3); powertrain buckets the feed vocabulary (`HEV`/`Hybrid`, `PHEV`/`Plug-in Hybrid`, `BEV`/`EV`, everything else is gas). Distance uses the same haversine (R = 3958.8 mi) as `js/distance.js`. A radius search leaves out dealers that have no coordinates in the feed.

## Local development

Requires Node 20+.

```bash
cd workers/bestest-mcp
npm install
npm test            # vitest: filter/sort/distance logic + in-process end-to-end over Streamable HTTP
npm run typecheck
npm run dev         # wrangler dev on http://127.0.0.1:8787 (uses the live feed)
```

To develop against a fixture instead of the live feed, serve `test/fixture.json` locally and point the Worker at it:

```bash
(cd test && python3 -m http.server 8099 --bind 127.0.0.1) &
npx wrangler dev --port 8787 --var FEED_URL:http://127.0.0.1:8099/fixture.json
```

### Test with MCP Inspector

CLI mode (what Anthropic's docs suggest for a protocol check):

```bash
npx @modelcontextprotocol/inspector --cli http://127.0.0.1:8787/mcp --transport http --method tools/list
```

```bash
npx @modelcontextprotocol/inspector --cli http://127.0.0.1:8787/mcp --transport http \
  --method tools/call --tool-name search_cars \
  --tool-arg zip=92868 --tool-arg radius_miles=15 --tool-arg segment="Compact SUV" --tool-arg limit=5
```

```bash
npx @modelcontextprotocol/inspector --cli http://127.0.0.1:8787/mcp --transport http \
  --method tools/call --tool-name get_car --tool-arg slug=<slug from search_cars>
```

```bash
npx @modelcontextprotocol/inspector --cli http://127.0.0.1:8787/mcp --transport http --method tools/call --tool-name list_segments
```

UI mode: `npx @modelcontextprotocol/inspector`, open the printed URL, choose transport "Streamable HTTP", URL `http://127.0.0.1:8787/mcp`, Connect, then use the Tools tab. Note: the Inspector CLI coerces `zip=92868` to a number, so the schema accepts a string or a number.

### Test in Claude as a custom connector

Claude reaches the server from Anthropic's network, so it needs a public URL: either the deployed Worker or a tunnel (`cloudflared tunnel --url http://127.0.0.1:8787`). In claude.ai go to Customize → Connectors → Add custom connector, paste `https://<host>/mcp`, no auth. Check that the three tools appear under Tool permissions, then ask something like "Find a hybrid compact SUV under $32K near 92660" and confirm the tool call and the result.

### Test in ChatGPT (developer mode)

Settings → Apps & Connectors → Advanced → Developer mode, then Create: name, `https://<host>/mcp`, no auth. In a chat, mention the app and try the starter prompts below.

## Deploy

```bash
cd workers/bestest-mcp
npx wrangler login
npx wrangler deploy
```

That publishes `https://bestest-mcp.<account>.workers.dev/mcp`. For a branded URL (recommended before submitting; reviewers compare the MCP domain to the company domain), add a custom domain by uncommenting the `routes` line in `wrangler.toml` once `shopbestest.com` is on Cloudflare, e.g. `mcp.shopbestest.com`, and deploy again.

Config lives in `wrangler.toml` `[vars]`: `FEED_URL`, `FEED_CACHE_SECONDS`, `SITE_URL`, `OPENAI_APPS_CHALLENGE`. None are secrets. The Worker holds no state and no user data.

Running costs: one feed fetch per 5 minutes per isolate; everything else is in-memory filtering of about 1,250 records.

## Submission checklists

Requirements below were checked on 2026-11-01. The Claude list is from Anthropic's docs at `claude.com/docs/connectors/building/submission` and `…/review-criteria`. OpenAI's developer site (`developers.openai.com`) was not reachable from the session that wrote this, so that list is assembled from OpenAI's help-center article, the public submission schema and recent third-party write-ups. Re-check it against `developers.openai.com/apps-sdk/deploy/submission` and `…/app-developer-guidelines` before submitting. Note that OpenAI renamed ChatGPT apps to "plugins" in mid-2026 and the docs now live under `/plugins/`.

### Claude connectors directory

Portal: `claude.ai/directory/manage` → Submit new → MCP connector. Any paid Claude plan can submit. Default outcome is an automatic policy scan and a **Community** listing; Anthropic may escalate to Verified review.

Server requirements (all met by this code):

- [x] Remote, reachable over HTTPS, Streamable HTTP transport.
- [x] No authentication (public data). Authless is a supported type (`none`).
- [x] Every tool has a `title` and `readOnlyHint`/`destructiveHint` (portal flags missing ones).
- [x] Tool names ≤ 64 chars, narrow accurate descriptions, no prompt-injection patterns (descriptions say what the tool does, not how Claude should behave, and do not promote products).
- [x] Valid calls return success; invalid input returns actionable errors, not bare "Bad Request".
- [x] Responses are sized for the task (max 20 cars per call).
- [x] Calls only our own first-party API (the feed Worker). Server domain should match the company: use `mcp.shopbestest.com`.
- [x] Reads nothing from the conversation beyond the tool arguments.

Listing materials Jason supplies in the portal:

- [ ] **Server URL**: `https://mcp.shopbestest.com/mcp` (universal URL).
- [ ] **Name** (≤ 100 chars): Bestest.
- [ ] **One-liner** (≤ 200 chars): Search screened used cars in Orange County, CA. Every listing already passed Bestest's screen.
- [ ] **Description** (≤ 2,000 chars): see draft below.
- [ ] **Categories** (1–5): e.g. Shopping, Automotive, Local.
- [ ] **Documentation URL**: a public page. This README on GitHub qualifies, or a help article on shopbestest.com. Public docs are required by the publish date.
- [ ] **Privacy policy URL**: `https://shopbestest.com/privacy` (must exist; draft below).
- [ ] **Support contact**: an email or page.
- [ ] **Icon**: square PNG/SVG of the Bestest mark. The portal does not publish exact pixel sizes; 512×512 PNG with transparent background is safe.
- [ ] **URL slug** for the listing page (permanent once published): `bestest`.
- [ ] **Use cases** step: primary use cases, what users need before connecting (nothing: no account), reads data only.
- [ ] **Company** step: company name, website, primary contact.
- [ ] **Authentication** step: "No authentication required".
- [ ] **Data handling** step: the API is our own; no personal health data; no sponsored content.
- [ ] **Test & launch** step: test-account instructions. For an authless server write "No account needed. Connect to the URL and call `list_segments`, then `search_cars` with `zip: 92868`." Confirm every tool was run via MCP Inspector or as a custom connector.
- [ ] **Compliance** step: seven acknowledgments (directory guidelines, first-party API usage, financial transactions, AI media generation, prompt injection, conversation data collection, public documentation).
- [ ] Optional: **Allowed link URIs** `https://shopbestest.com` so listing links open without a confirmation prompt (only needed if the server ever uses `ui/open-link`; it does not today).
- [ ] Not an MCP App (no interactive UI), so no carousel screenshots are needed.

Escalations: `mcp-review@anthropic.com`.

### OpenAI Apps SDK / ChatGPT app (plugin) directory

Portal: `platform.openai.com/apps-manage` (Platform dashboard). Submission requires a **verified** OpenAI Platform organization (individual or business verification), submitted by an org **Owner**, with the global data-residency project (EU residency is not supported for apps). Only one version per app can be in review at a time; tool names, signatures and descriptions are locked after publication and changes need a new review.

Server requirements:

- [x] Public HTTPS MCP server, streaming HTTP, reasonable timeouts. No localhost or test endpoints.
- [x] Tool annotations accurate (`readOnlyHint` true only for tools that change nothing). Inaccurate annotations are a common rejection reason.
- [x] Tool descriptions state when to use the tool and what comes back; no competitor comparisons, no marketing language, no overly broad triggering.
- [x] Inputs limited to what the tool needs. No raw location fields beyond a zip the user types, no conversation history.
- [x] `structuredContent` plus text `content` on every result; `_meta["openai/toolInvocation/invoking"|"invoked"]` status strings set.
- [x] `/.well-known/openai-apps-challenge` route exists for the domain verification token (`OPENAI_APPS_CHALLENGE` var).
- [x] `/health` returns JSON status.
- [ ] Optional UI component (widget). Not built. The server works as a tools-only app; a carousel widget of car cards can be added later via `openai/outputTemplate`.

Listing materials Jason supplies:

- [ ] **Org verification** complete on the OpenAI Platform.
- [ ] **Domain verification**: set `OPENAI_APPS_CHALLENGE` in `wrangler.toml` to the token OpenAI issues and redeploy, or host the same token at `https://shopbestest.com/.well-known/openai-apps-challenge` if OpenAI verifies the website domain instead of the MCP host.
- [ ] **Name and description**: accurate, no implication of OpenAI endorsement.
- [ ] **Category**.
- [ ] **Icons**: primary listing icon (`logo`) is required before submission; a `composerIcon` is required for Codex packaging. Square, high-resolution PNG; provide light and dark variants if asked.
- [ ] **Website URL**, **support URL**, **privacy policy URL**, **terms of service URL**: all four are required for public review of a remote MCP app. Privacy must cover data collected, purposes, recipients, retention and user controls. Terms must cover service description, acceptable use, IP, disclaimers, rate limits, termination, governing law, contact.
- [ ] **Starter prompts**: up to 3, ≤ 128 chars each, unique, no @mentions. Drafts below.
- [ ] **Test cases**: the submission form (schema `chatgpt-app-submission.v1.json`) wants at least 5 positive cases (prompt, expected tools, observable expected result) and at least 3 negative cases (prompts that should not trigger the app). Drafts below.
- [ ] **Test account**: not applicable (no auth). State that in the form.
- [ ] Confirm IP ownership, policy compliance and metadata accuracy checkboxes, then Submit for Review. After approval click Publish.

Prohibited-content check: a used-car search with external checkout at the dealer is allowed ("physical goods via external checkout"). The app sells nothing in-chat and collects no payment data.

### Draft listing copy

**Description (both directories)**

Bestest is a curated used-car marketplace for Orange County, California. Every car on Bestest has already passed our screen: it is an approved model, year and trim, it has under 50,000 miles, and it is sold by a factory-authorized dealer. This connector searches that screened inventory. Ask for a segment (compact SUV, minivan, luxury midsize SUV), a make and model, a powertrain (hybrid, plug-in hybrid, electric), a price or mileage cap, a minimum model year, and a zip code with a radius, and get back the cars that qualify with price, miles, dealer, distance, a photo and a link to the listing on shopbestest.com. No account is needed and nothing is stored.

**Starter prompts (≤ 128 chars)**

1. Find a hybrid compact SUV under $32K within 15 miles of 92660
2. What's the lowest-mileage Toyota Sienna on Bestest right now?
3. Which segments does Bestest have screened cars in, and what do they cost?

**Positive test cases (should call the app)**

| Prompt | Expected tools | Observable result |
| --- | --- | --- |
| Find a hybrid compact SUV under $32,000 near 92660 | `search_cars` | A list of screened hybrid compact SUVs with price, miles, dealer, distance and shopbestest.com links |
| Show me used Lexus RX listings on Bestest sorted by miles | `search_cars` | Lexus RX results in ascending mileage order |
| What segments does Bestest have cars in right now? | `list_segments` | Segment names with counts and price ranges |
| Tell me more about the 2023 Toyota RAV4 Prime you just listed | `get_car` | One listing with price, miles, dealer, photo and link |
| Any electric cars under $30K within 25 miles of Irvine (92618)? | `search_cars` | Screened EVs in range, or a "no screened cars currently qualify" message with suggestions |

**Negative test cases (should not call the app)**

| Prompt | Why |
| --- | --- |
| How do I change the oil on a 2015 Civic? | Maintenance question, not inventory search |
| What's the best new electric car coming out next year? | New cars and future models are out of scope |
| Find me a used truck in Austin, Texas | Outside the coverage area; the assistant should say so without calling the tool, or the tool returns a clear out-of-area error |

### Draft privacy policy (for shopbestest.com/privacy)

> **Bestest connector for ChatGPT and Claude.** The Bestest connector searches Bestest's public used-car inventory. When you use it, the assistant sends the connector only the search terms you asked for (for example a segment, make, model, price limit or zip code). The connector returns matching listings. It does not require an account, does not set cookies, and does not store search terms, zip codes, conversation content or any personal information. Requests pass through Cloudflare, which processes standard connection metadata (such as IP address) under Cloudflare's privacy policy for the purpose of serving the request. Listing data comes from Bestest's own inventory feed. Links in results go to shopbestest.com, where the site's general privacy policy applies. Questions: [support contact].

## Zip table

`data/zips.json` maps 5-digit zips to `[lat, lng]`. It was hand-built for this PR (Orange County completely, plus LA, Inland Empire, North San Diego and the Ventura edge) with centroids accurate to roughly a mile. Before launch, regenerate it from the Census ZCTA gazetteer so every zip in the bounding box is present and exact:

```bash
# download https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_Gaz_zcta_national.zip and extract it
node scripts/build-zips.mjs path/to/2020_Gaz_zcta_national.txt
```

A zip outside the table returns a clear error telling the user to search without a zip or use a nearby Orange County zip.

## Files

```
workers/bestest-mcp/
  wrangler.toml          Worker config and public vars
  src/index.ts           Worker entry (default export only)
  src/app.ts             HTTP routing, CORS, health, challenge, MCP transport
  src/mcp.ts             McpServer + the three tools + response formatting
  src/inventory.ts       Pure filter / sort / distance / segment logic
  src/feed.ts            Feed fetch with memory + edge cache, stale-on-error
  src/geo.ts             Haversine, zip normalization and lookup
  data/zips.json         Bundled ZCTA centroids
  scripts/build-zips.mjs Regenerates data/zips.json from the Census gazetteer
  test/                  vitest suites + a 10-car fixture
```
