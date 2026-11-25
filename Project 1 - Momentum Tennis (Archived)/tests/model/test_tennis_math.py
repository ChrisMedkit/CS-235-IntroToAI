import pytest
from tennis_math import (p_game, p_tiebreak, p_set, p_match,
                         estimate_serve, update_momentum)


def test_game_even():
    assert p_game(0.5, 0, 0) == pytest.approx(0.5)


def test_game_known():
    assert p_game(0.6, 0, 0) == pytest.approx(0.7357, abs=1e-3)


@pytest.mark.parametrize("p", [0.55, 0.7])
def test_game_deuce_symmetry(p):
    assert p_game(p, 3, 3) == pytest.approx(p * p / (p * p + (1 - p) ** 2))


def test_game_advantage():
    p = 0.6
    assert p_game(p, 4, 3) == pytest.approx(p + (1 - p) * p_game(p, 3, 3))


def test_game_finished():
    assert p_game(0.6, 4, 2) == 1
    assert p_game(0.6, 1, 4) == 0


@pytest.mark.parametrize("first_to", [7, 10])
def test_tiebreak_even(first_to):
    assert p_tiebreak(0.6, 0.6, 0, 0, first_to, 1) == pytest.approx(0.5)


def test_tiebreak_finished():
    assert p_tiebreak(0.6, 0.6, 7, 5, 7, 1) == 1
    assert p_tiebreak(0.6, 0.6, 8, 10, 10, 1) == 0


def test_set_even():
    assert p_set(0.65, 0.65, 0, 0, 1, False) == pytest.approx(0.5, abs=1e-9)


def test_match_even():
    assert p_match(0.65, 0.65, 0, 0, 0, 0, 0, 0, 1, False) == pytest.approx(0.5, abs=1e-9)


def test_match_monotone():
    assert p_match(0.68, 0.62, 0, 0, 0, 0, 0, 0, 1, False) > 0.5


def test_match_terminal():
    assert p_match(0.6, 0.6, 3, 1, 0, 0, 0, 0, 1, False) == 1.0
    assert p_match(0.6, 0.6, 0, 3, 0, 0, 0, 0, 1, False) == 0.0


def test_all_in_range():
    states = [
        (0, 0, 0, 0, 0, 0, 1, False),
        (2, 2, 6, 6, 9, 9, 1, True),    # final-set 10-point tiebreak, 9-9
        (2, 2, 6, 6, 9, 8, 2, True),
        (1, 1, 6, 6, 6, 6, 2, True),    # normal tiebreak, 6-6
        (2, 1, 5, 4, 4, 3, 1, False),   # AD to the server
        (0, 2, 3, 5, 3, 3, 2, False),   # deuce
    ]
    for p1 in (0.3, 0.55, 0.7, 0.9):
        for p2 in (0.3, 0.6, 0.85):
            for st in states:
                v = p_match(p1, p2, *st)
                assert 0.0 <= v <= 1.0, (p1, p2, st, v)


def test_estimate_serve_prior():
    assert estimate_serve(0, 0, 0.673) == pytest.approx(0.673)
    assert estimate_serve(20, 20, 0.5) == pytest.approx(0.75)


def test_momentum_bounds():
    m = 0.0
    for _ in range(500):
        m = update_momentum(m, True, 0.0)
    assert -1.0 <= m <= 1.0
    assert m > 0.9
