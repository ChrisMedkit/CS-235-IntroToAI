"""Build the website's replay data from the 2023 Wimbledon point-by-point CSV.

Each CSV row is one point, with the score as it stood *before* the point.
For every point we write the model's view before it is played (serve estimates,
win chances for the point, game, next game and match, and momentum) plus who won it.

Run:  python3 model/build_data.py
"""
import json
import sys
from pathlib import Path

import pandas as pd

from tennis_math import (p_game, p_tiebreak, p_match, estimate_serve,
                         update_momentum, tiebreak_server)

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "model" / "raw" / "2024_Wimbledon_featured_matches.csv"
OUT_DIR = ROOT / "data" / "tennis"

GAME_POINTS = {"0": 0, "15": 1, "30": 2, "40": 3, "AD": 4}
ROUNDS = {"13": "Third round", "14": "Fourth round", "15": "Quarterfinal",
          "16": "Semifinal", "17": "Final"}


def parse_point_score(s: str, tiebreak: bool) -> int:
    """'0','15','30','40','AD' -> 0..4 in a normal game; plain counts in a tiebreak."""
    s = str(s).strip()
    return int(s) if tiebreak else GAME_POINTS[s]


def serve_baseline(df: pd.DataFrame) -> float:
    """Share of all points in the dataset won by the server (about 0.673)."""
    return float((df["server"] == df["point_victor"]).mean())


def r3(x: float) -> float:
    return round(float(x), 3)


def pair(p1: float) -> list:
    """[player 1, player 2] chances, rounded so they still add to 1."""
    a = r3(p1)
    return [a, r3(1 - a)]


def build_match(rows: pd.DataFrame, baseline: float) -> dict:
    """Turn one match's rows into the JSON contract used by js/replay.js."""
    rows = rows.sort_values("point_no")
    first = rows.iloc[0]
    served = {1: 0, 2: 0}   # serve points played so far, per player
    held = {1: 0, 2: 0}     # serve points won so far, per player
    momentum = 0.0
    points = []

    for n, row in enumerate(rows.itertuples(index=False), start=1):
        server = int(row.server)
        g1, g2 = int(row.p1_games), int(row.p2_games)
        s1, s2 = int(row.p1_sets), int(row.p2_sets)
        tiebreak = g1 == 6 and g2 == 6
        a = parse_point_score(row.p1_score, tiebreak)
        b = parse_point_score(row.p2_score, tiebreak)
        final_set = s1 == 2 and s2 == 2

        # Serve estimates use only points before this one.
        sp1 = estimate_serve(held[1], served[1], baseline)
        sp2 = estimate_serve(held[2], served[2], baseline)

        point_p1 = sp1 if server == 1 else 1 - sp2
        if tiebreak:
            played = a + b
            tb_first = server if tiebreak_server(server, played) == server else 3 - server
            game_p1 = p_tiebreak(sp1, sp2, a, b, 10 if final_set else 7, tb_first)
        elif server == 1:
            game_p1 = p_game(sp1, a, b)
        else:
            game_p1 = 1 - p_game(sp2, b, a)
        # The next game is a fresh game served by the other player.
        nxt = 3 - server
        next_game_p1 = p_game(sp1, 0, 0) if nxt == 1 else 1 - p_game(sp2, 0, 0)
        match_p1 = p_match(sp1, sp2, s1, s2, g1, g2, a, b, server, tiebreak)

        winner = int(row.point_victor)
        points.append({
            "n": n, "set": int(row.set_no), "game": int(row.game_no), "server": server,
            "sets": [s1, s2], "games": [g1, g2],
            "score": [str(row.p1_score), str(row.p2_score)], "tiebreak": tiebreak,
            "p_serve": [r3(sp1), r3(sp2)],
            "p_point": pair(point_p1), "p_game": pair(game_p1),
            "p_next_game": pair(next_game_p1), "p_match": pair(match_p1),
            "momentum": r3(momentum), "winner": winner,
        })

        # Update running totals *after* recording the point.
        served[server] += 1
        held[server] += 1 if winner == server else 0
        momentum = update_momentum(momentum, winner == 1, point_p1)

    return {
        "id": first.match_id,
        "players": [first.player1, first.player2],
        "best_of": 5,
        "winner": int(rows.iloc[-1].point_victor),  # the last point wins the match
        "points": points,
    }


def summary(match: dict) -> str:
    last = match["points"][-1]
    sets = list(last["sets"])
    sets[match["winner"] - 1] += 1
    w = match["players"][match["winner"] - 1]
    l = match["players"][2 - match["winner"]]
    return f"{w} beat {l} {max(sets)}–{min(sets)} in sets"


def main(csv_path=CSV_PATH, out_dir=OUT_DIR) -> None:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(csv_path)
    baseline = serve_baseline(df)
    entries = []
    # Final first, then semifinals, and so on down to the third round.
    for match_id in sorted(df["match_id"].unique(), reverse=True):
        match = build_match(df[df["match_id"] == match_id], baseline)
        fname = f"match-{match_id}.json"
        (out_dir / fname).write_text(json.dumps(match, separators=(",", ":")))
        code = match_id.rsplit("-", 1)[1]
        entries.append({
            "id": match_id, "players": match["players"],
            "round": ROUNDS.get(code[:2], "Round"), "file": fname,
            "summary": summary(match),
        })
    index = {"sport": "tennis", "matches": entries}
    (out_dir / "index.json").write_text(json.dumps(index, indent=1))
    print(f"wrote {len(entries)} matches to {out_dir} (baseline {baseline:.3f})")


if __name__ == "__main__":
    main(*sys.argv[1:])
