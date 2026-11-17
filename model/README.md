# Model pipeline

Turns point-by-point Wimbledon data into the JSON files the website replays.

## Data

`raw/2024_Wimbledon_featured_matches.csv` and `raw/2024_data_dictionary.csv` come from
COMAP's 2024 MCM Problem C ("Momentum in Tennis"): 31 matches and 7,284 points from the
2023 Wimbledon men's singles, third round (last 32) onward. The owner has permission to publish them.

## Methods (public)

- **Independent points** (Klaassen & Magnus, *Analyzing Wimbledon*, Oxford University Press, 2014):
  each player wins a point on their own serve with probability `p`, and points are independent.
  Game, tiebreak, set and match chances follow by recursion over the score (`tennis_math.py`).
  2023 rules: 7-point tiebreak at 6-6 in every set, 10-point tiebreak at 6-6 in the fifth.
- **Serve estimate with a prior:** `p = (serve points won + k·baseline) / (serve points played + k)`
  with `k = 20` and `baseline` = the whole dataset's serve-point win rate (about 0.673).
  Only points *before* the current one are used.
- **Momentum:** `m ← 0.9·m + 0.1·(result − expected)` from player 1's side, clamped to [-1, 1].
  Version 1 only **shows** momentum; it does not feed back into the point model.

## Run

```bash
python3 model/build_data.py      # writes data/tennis/*.json
python3 -m pytest tests/model -q # checks the math and the output
```
