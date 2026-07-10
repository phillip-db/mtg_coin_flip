# MTG Coin Flip Simulator

A coin flip simulator inspired by Magic: The Gathering. Choose heads or tails, flip a group of coins, and track your results across multiple rounds. Available as both a command-line tool and a graphical desktop app.

## Setup

Requires **Python 3.10+**.

```bash
# Clone and enter the project
cd mtg_coin_flip

# (Optional) Create a virtual environment
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies (only needed for the GUI)
pip install -r requirements.txt
```

## CLI Version

Run the simulator in your terminal with interactive prompts:

```bash
python coin_flip.py
```

You will be prompted to:

1. **Choose heads or tails** - pick the side you're betting on.
2. **Set the number of coins** - how many coins are flipped each round.
3. **Pick a mode:**
   - **Fixed** - run a set number of rounds.
   - **Persistent** - keep flipping until no coin in a round lands on your choice.
4. **Set the number of flips** (Fixed mode only).

Each round displays every coin's result, marks matches, and shows whether you won or lost the round. A summary prints at the end.

### Pause Flag

Use `--pause` (or `-p`) to pause between each round and wait for a keypress before continuing:

```bash
python coin_flip.py --pause
```

### Example Output

```
=== Coin Flip Simulator ===

Choose heads or tails (h/t): h
How many coins to flip at once? 3

Stop condition:
  1) Fixed number of flips
  2) Flip until no coin lands on your choice
Select mode [1, 2]: 1
How many flips? 2

--- Flip 1 ---
  Coin 1: HEADS <--
  Coin 2: TAILS
  Coin 3: HEADS <--
  2/3 landed on HEADS
✓ ROUND WON

--- Flip 2 ---
  Coin 1: TAILS
  Coin 2: TAILS
  Coin 3: TAILS
  0/3 landed on HEADS
X ROUND LOST

=== Summary ===
Total flips: 2
Total coins flipped: 6
Total landing on HEADS: 2/6 (33.3%)
Rounds won: 1/2
```

## GUI Version

Launch the graphical interface:

```bash
python gui.py
```

> **Requires Pillow** - install with `pip install -r requirements.txt` if you haven't already.

### Setup Screen

Configure the simulation with the same options as the CLI:

- **Choice** - Heads or Tails radio buttons.
- **Coins** - Spinbox for the number of coins per round (1-100).
- **Mode** - Fixed or Continuous (Persistent). The flips spinbox appears only in Fixed mode.
- **Pause between flips** - Checkbox that controls whether rounds advance one at a time with coin images, or all at once.

### Simulation Screen

- **Current Round** - When pausing is enabled, displays the round number, coin images (gold for heads, silver for tails), match count, and a win/lost indicator. A "Next Flip" button advances to the next round. On the final round the button changes to "Finish".
- **History** - A scrollable log listing every completed round with its match count and win/loss status.
- **Summary** - Appears when the simulation ends, showing total flips, rounds won, total coins flipped, and overall match percentage. A "Reset" button returns to the setup screen.

When pausing is disabled, the simulation runs instantly and the history log and summary are shown without the current-round panel.

## Project Structure

```
mtg_coin_flip/
├── coin_flip.py      # Core logic, enums, CLI entry point
├── gui.py            # Tkinter GUI
├── requirements.txt  # Pillow dependency (GUI only)
├── DESIGN.md         # GUI design document
├── .gitignore
└── README.md
```
