import json
from pathlib import Path

import pandas as pd
import pytest

from build_data import parse_point_score, build_match, main, CSV_PATH, serve_baseline

POINT_KEYS = {"n", "set", "game", "server", "sets", "games", "score", "tiebreak",
              "p_serve", "p_point", "p_game", "p_next_game", "p_match", "momentum", "winner"}
PAIRS = ["p_serve", "p_point", "p_game", "p_next_game", "p_match"]


@pytest.fixture(scope="module")
def df():
    return pd.read_csv(CSV_PATH)


@pytest.fixture(scope="module")
def final(df):
    rows = df[df.match_id == "2023-wimbledon-1701"]
    return rows, build_match(rows, serve_baseline(df))


def test_parse_scores():
    assert [parse_point_score(s, False) for s in ["0", "15", "30", "40", "AD"]] == [0, 1, 2, 3, 4]
    assert parse_point_score("9", True) == 9
    assert parse_point_score("0", True) == 0


def test_build_final_basics(final):
    rows, m = final
    assert m["players"] == ["Carlos Alcaraz", "Novak Djokovic"]
    assert m["winner"] == 1
    assert m["best_of"] == 5
    assert len(m["points"]) == len(rows)


def test_build_final_point_shape(final):
    _, m = final
    for p in m["points"]:
        assert POINT_KEYS <= p.keys()
        for k in ("p_point", "p_game", "p_next_game", "p_match"):
            assert all(0 <= v <= 1 for v in p[k]), (p["n"], k)
            assert sum(p[k]) == pytest.approx(1, abs=1e-6), (p["n"], k)
        assert all(0 <= v <= 1 for v in p["p_serve"])
        assert -1 <= p["momentum"] <= 1


def test_build_final_starts_near_even(final):
    _, m = final
    assert 0.3 <= m["points"][0]["p_match"][0] <= 0.7


def test_final_points_favor_winner(final):
    _, m = final
    assert m["points"][-1]["p_match"][0] > 0.6


def test_serve_estimate_uses_only_past_points(df):
    rows = df[df.match_id == "2023-wimbledon-1701"]
    base = serve_baseline(df)
    full = build_match(rows, base)
    cut = build_match(rows.iloc[:40], base)
    # Point 40's inputs must not change when later points are removed.
    assert full["points"][39]["p_serve"] == cut["points"][39]["p_serve"]
    assert full["points"][0]["p_serve"] == [round(base, 3), round(base, 3)]


def test_index_lists_all_files(tmp_path):
    main(CSV_PATH, tmp_path)
    index = json.loads((tmp_path / "index.json").read_text())
    assert index["sport"] == "tennis"
    assert len(index["matches"]) == 31
    for m in index["matches"]:
        assert (tmp_path / m["file"]).exists()
    assert index["matches"][0]["id"] == "2023-wimbledon-1701"  # final listed first
