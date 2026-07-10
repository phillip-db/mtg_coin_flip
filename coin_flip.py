from collections.abc import Generator
import random
from enum import Enum, unique
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("-p", "--pause", 
                    action="store_true", 
                    help="Enable pausing between each set of flips")

# Mode Enum
@unique
class Mode(Enum):
    """
    `Fixed`: Flip `n` number of times.

    `Persistent`: Flip until no coins in a round land on the user's choice.
    """
    def __new__(cls, value, description=''):
        obj = object.__new__(cls)
        obj._value_ = value
        obj.description = description
        return obj

    FIXED = 1, 'Fixed number of flips'
    PERSISTENT = 2, 'Flip until no coin lands on your choice'

class Coin(Enum):
    HEADS = 1
    TAILS = 2

def get_choice() -> Coin:
    """
    Prompt the user to pick heads or tails, re-asking on invalid input.

    Returns:
        User's choice of `heads` or `tails`.
    """
    while True:
        choice = input("Choose heads or tails (h/t): ").strip().lower()
        if choice in ("h", "heads"):
            return Coin.HEADS
        if choice in ("t", "tails"):
            return Coin.TAILS
        print("Invalid input. Please enter 'h' or 't'.")

def get_positive_int(prompt: str) -> int:
    """
    Prompt the user for a positive integer, re-asking on invalid input.

    Args:
        prompt: Text prompt displayed to the user.

    Returns:
        Positive integer converted from result of user response.
    """
    while True:
        try:
            value = int(input(prompt).strip())
            if value > 0:
                return value
            print("Please enter a positive integer.")
        except ValueError:
            print("Invalid input. Please enter a number.")

def get_mode() -> Mode:
    """
    Prompt the user to choose the stop condition: fixed number of flips or flip until no matches.

    Returns:
        The user's chosen simulation `Mode.`
    """
    while True:
        print("\nStop condition:")
        for m in Mode:
            print(f"  {m.value}) {m.description}")
        valid = [m.value for m in Mode]
        mode = int(input(f"Select mode {valid}: ").strip())
        if mode in valid:
            return Mode(mode)
        print(f"Invalid input. Please enter a number from {valid}.")

def flip_coins(n: int) -> list[Coin]:
    """
    Simulate flipping `n` coins.

    Args:
        n: Number of flips to perform.

    Returns:
        A list of "heads" or "tails" results.
    """
    return [random.choice(list(Coin)) for _ in range(n)]

def display_flip(flip_num: int, results: list[Coin], count: dict, choice: Coin) -> int:
    """
    Print the results of a single flip round, marking coins that match the user's choice. Returns the match count.

    Args:
        flip_num: Total number of flips performed during the simulation.
        results: List of "heads" and "tails" results from the simulation.
        choice: The user's choice of "h" or "t."

    Returns:
        The number of rounds the user won.
    """
    matches = count[choice]
    total = len(results)
    print(f"\n--- Flip {flip_num} ---")
    for i, result in enumerate(results, 1):
        marker = " <--" if result == choice else ""
        print(f"  Coin {i}: {result.name}{marker}")
    print(f"  {matches}/{total} landed on {choice.name}")
    print("✓ ROUND WON" if is_win(count, choice) else "X ROUND LOST")

def is_win(round: dict, choice: Coin) -> bool:
    return round[choice] > 0

def simulate(choice: Coin, num_coins: int, mode: Mode, max_flips: int | None = None) -> Generator:
    num_flips = 0

    while True:
        num_flips += 1
        results = flip_coins(num_coins)
        results_dict = {side: results.count(side) for side in Coin}

        yield (results, results_dict)

        if mode == Mode.FIXED and num_flips >= max_flips:
            break
        if mode == Mode.PERSISTENT and results_dict[choice] == 0:
            break

def summarize(rounds: list[dict], choice: Coin) -> dict:
    total_coins = sum([sum(r.values()) for r in rounds])
    total_matches = sum([r[choice] for r in rounds])

    return {"total_flips": len(rounds), 
            "total_coins": total_coins, 
            "total_matches": total_matches, 
            "match_pct": total_matches / total_coins * 100, 
            "rounds_won": sum([is_win(r, choice) for r in rounds])}

def run_simulation():
    """
    Main entry point: gathers user input, runs the flip loop, and prints the summary.
    """
    print("=== Coin Flip Simulator ===\n")

    choice = get_choice()
    n = get_positive_int("How many coins to flip at once? ")
    mode = get_mode()

    max_flips = None
    if mode == Mode.FIXED:
        max_flips = get_positive_int("How many flips? ")

    print(f"\nYour choice: {choice.name}")
    print(f"Coins per flip: {n}")
    if max_flips:
        print(f"Number of flips: {max_flips}")
    else:
        print("Flipping until no coin lands on your choice.")

    sim = simulate(choice, n, mode, max_flips)
    results = []
    for i, (result, count) in enumerate(sim):
        display_flip(i+1, result, count, choice)
        if parser.parse_args().pause:
            input("\nPress any key to continue to the next flip.")
        results.append(count)

    if mode == Mode.PERSISTENT:
        print(f"\nNo coins landed on {choice.name}! Stopping.")
    
    summary = summarize(results, choice)

    print(f"\n=== Summary ===")
    print(f"Total flips: {summary["total_flips"]}")
    print(f"Total coins flipped: {summary["total_coins"]}")
    print(f"Total landing on {choice.name}: {summary["total_matches"]}/{summary["total_coins"]} "
          f"({summary["match_pct"]:.1f}%)")
    print(f"Rounds won: {summary["rounds_won"]}/{summary["total_flips"]}")


if __name__ == "__main__":
    run_simulation()
