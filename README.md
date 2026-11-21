# Leonida Platinum Ledger — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/arestafirman/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/arestafirman/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze, 28 PSN-hidden). Built for the [GTA 6 Trophy Guide bounty](https://make.fun/bounty/gta6-trophy-guide-01) on Make.fun.

## What it does

- **Tracker** — checklist of all 55 trophies with official name, description and grade; progress saved in localStorage, with Export/Import of progress; filters by kind (story, missable, collectibles, activities, online), grade, PSN-hidden, disputed and not-earned; search; a spoiler shield that hides story trophy names and descriptions until they are earned; per-trophy counters (meditations 18, stunts 250, WAiNK scans 100, …).
- **Roadmap** — 6 stages in story order, with the trophies in each stage and the points of no return.
- **Missables & disputes** — the one missable trophy (the Chapter 1 balcony meditation) with its last-chance window, plus a dispute panel wherever sources disagree, showing both versions and our call.
- **Cited guidance** — every trophy gets a 6-step guide in our own words plus 9 cited claims. The audit strip across the top is computed at runtime from the data: claims cited, claims backed by 2+ sources, sources read, disputes shown, unconfirmed facts flagged. Facts no source confirms are flagged **UNCONFIRMED**, never invented.
- **Sources registry** — 24 pages read on 21 Nov 2026 across 22 sites, with per-source citation counts computed at runtime.
- **100% Ledger** — trophy targets next to the stricter 100% completion targets (300 stunts vs 250, 70 of 80 challenges vs 50, …).

## Honest numbers (computed at runtime, not typed in)

- 495/495 claims cited, 495 backed by 2+ sources
- 24 sources read, 22 sites, 15 sites cited in guides
- 24 dispute panels, 19 unconfirmed facts flagged, 55/55 guides cite sources

The game launched 19 Nov 2026, two days before this guide was written, so where guides are thin this ledger says so instead of inventing a location or a step.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Fully offline: no network requests, no external assets, no Rockstar logo or artwork.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored Make.fun library (`vendor/makefun-frontend.ts`, unchanged from the kit).
