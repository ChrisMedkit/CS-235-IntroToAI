"""Tennis win probabilities from serve-point win rates.

Standard independent-points model (Klaassen & Magnus, "Analyzing Wimbledon", 2014):
each player wins a point on their own serve with a fixed probability, and every
point is independent. Game, tiebreak, set and match probabilities follow by
recursion over the score.

Conventions:
- p1, p2: chance that player 1 / player 2 wins a point *on their own serve*.
- a, b: points won in the current game or tiebreak by player 1 / player 2,
  as plain counts (0, 1, 2, 3, 4 ... where 4 means "AD" if the other has 3).
- 2023 Wimbledon: every set has a 7-point tiebreak at 6-6, and the final set
  has a 10-point tiebreak at 6-6.
"""
from functools import lru_cache


@lru_cache(maxsize=None)
def p_game(p: float, a: int, b: int) -> float:
    """Chance the server wins the game from server points a, receiver points b."""
    if a >= 4 and a - b >= 2:
        return 1.0
    if b >= 4 and b - a >= 2:
        return 0.0
    if a >= 3 and b >= 3 and a == b:
        # Deuce: the server needs two points in a row before the receiver does.
        q = 1 - p
        return p * p / (p * p + q * q)
    return p * p_game(p, a + 1, b) + (1 - p) * p_game(p, a, b + 1)


def tiebreak_server(first: int, played: int) -> int:
    """Who serves the next tiebreak point: first server takes 1, then 2 each."""
    return first if ((played + 1) // 2) % 2 == 0 else 3 - first


@lru_cache(maxsize=None)
def p_tiebreak(p1: float, p2: float, a: int, b: int, first_to: int, server_first: int) -> float:
    """Chance player 1 wins the tiebreak from a-b (player 1 - player 2)."""
    if a >= first_to and a - b >= 2:
        return 1.0
    if b >= first_to and b - a >= 2:
        return 0.0
    if a == b and a >= first_to - 1 and (a + b) % 2 == 0:
        # Tied near the end at an even count: the next two points have one serve
        # each, so it's "win both" vs "lose both", with a split meaning tied again.
        win_both = p1 * (1 - p2)
        lose_both = (1 - p1) * p2
        return win_both / (win_both + lose_both)
    server = tiebreak_server(server_first, a + b)
    w = p1 if server == 1 else 1 - p2  # player 1's chance to win this point
    return w * p_tiebreak(p1, p2, a + 1, b, first_to, server_first) + \
        (1 - w) * p_tiebreak(p1, p2, a, b + 1, first_to, server_first)


def _game_for_p1(p1: float, p2: float, server: int) -> float:
    """Chance player 1 wins a fresh game (0-0) with the given server."""
    return p_game(p1, 0, 0) if server == 1 else 1 - p_game(p2, 0, 0)


def _set_over(g1: int, g2: int) -> int:
    """0 if the set continues, otherwise the set winner (1 or 2)."""
    if g1 == 7 or (g1 >= 6 and g1 - g2 >= 2):
        return 1
    if g2 == 7 or (g2 >= 6 and g2 - g1 >= 2):
        return 2
    return 0


@lru_cache(maxsize=None)
def p_set(p1: float, p2: float, g1: int, g2: int, server: int, final_set: bool) -> float:
    """Chance player 1 wins the set from games g1-g2, at the start of a game."""
    done = _set_over(g1, g2)
    if done:
        return 1.0 if done == 1 else 0.0
    if g1 == 6 and g2 == 6:
        return p_tiebreak(p1, p2, 0, 0, 10 if final_set else 7, server)
    w = _game_for_p1(p1, p2, server)
    nxt = 3 - server
    return w * p_set(p1, p2, g1 + 1, g2, nxt, final_set) + \
        (1 - w) * p_set(p1, p2, g1, g2 + 1, nxt, final_set)


@lru_cache(maxsize=None)
def _match_from_game_start(p1: float, p2: float, s1: int, s2: int,
                           g1: int, g2: int, server: int, need: int) -> float:
    """Chance player 1 wins the match from the start of a game.

    Works game by game (a tiebreak counts as one game) so the serve order
    carries correctly from one set into the next.
    """
    if s1 == need:
        return 1.0
    if s2 == need:
        return 0.0
    done = _set_over(g1, g2)
    if done:
        s1n, s2n = (s1 + 1, s2) if done == 1 else (s1, s2 + 1)
        return _match_from_game_start(p1, p2, s1n, s2n, 0, 0, server, need)
    final_set = s1 == s2 == need - 1
    if g1 == 6 and g2 == 6:
        w = p_tiebreak(p1, p2, 0, 0, 10 if final_set else 7, server)
    else:
        w = _game_for_p1(p1, p2, server)
    nxt = 3 - server
    return w * _match_from_game_start(p1, p2, s1, s2, g1 + 1, g2, nxt, need) + \
        (1 - w) * _match_from_game_start(p1, p2, s1, s2, g1, g2 + 1, nxt, need)


def p_match(p1: float, p2: float, s1: int, s2: int, g1: int, g2: int,
            a: int, b: int, server: int, in_tiebreak: bool, best_of: int = 5) -> float:
    """Chance player 1 wins the match from the full current score.

    s = sets, g = games, a/b = points in the current game or tiebreak
    (player 1 / player 2), server = who serves the next point.
    """
    need = best_of // 2 + 1
    if s1 >= need:
        return 1.0
    if s2 >= need:
        return 0.0
    final_set = s1 == s2 == need - 1
    if in_tiebreak:
        played = a + b
        # Work back to who served the first tiebreak point.
        first = server if tiebreak_server(server, played) == server else 3 - server
        w = p_tiebreak(p1, p2, a, b, 10 if final_set else 7, first)
        nxt = 3 - first  # the tiebreak's first receiver serves the next set
        win = _match_from_game_start(p1, p2, s1 + 1, s2, 0, 0, nxt, need)
        lose = _match_from_game_start(p1, p2, s1, s2 + 1, 0, 0, nxt, need)
        return w * win + (1 - w) * lose
    if server == 1:
        w = p_game(p1, a, b)
    else:
        w = 1 - p_game(p2, b, a)
    nxt = 3 - server
    return w * _match_from_game_start(p1, p2, s1, s2, g1 + 1, g2, nxt, need) + \
        (1 - w) * _match_from_game_start(p1, p2, s1, s2, g1, g2 + 1, nxt, need)


def estimate_serve(won: int, played: int, baseline: float, k: int = 20) -> float:
    """Serve-point win rate so far, pulled toward the tournament baseline early on."""
    return (won + k * baseline) / (played + k)


def update_momentum(m: float, p1_won: bool, p1_expected: float, lam: float = 0.9) -> float:
    """Exponentially weighted 'better than expected' score from player 1's side.

    Each point adds (result - expected): winning a point you were expected to win
    adds little; winning one you were expected to lose adds a lot.
    """
    x = 1.0 if p1_won else 0.0
    m = lam * m + (1 - lam) * (x - p1_expected)
    return max(-1.0, min(1.0, m))
