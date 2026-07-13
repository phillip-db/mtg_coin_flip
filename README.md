# MTG Coin Flip Simulator

A coin flip simulator inspired by Magic: The Gathering. Choose heads or tails, flip a group of coins, and track your results across multiple rounds. Available as a CLI, a desktop GUI, and a web app.

## Setup

### Python (CLI + Desktop GUI)

Requires **Python 3.10+**.

```bash
# Clone and enter the project
cd mtg_coin_flip

# (Optional) Create a virtual environment
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux

# Install dependencies (only needed for the desktop GUI)
pip install -r requirements.txt
```

### Web App

Requires **Node.js 18+**.

```bash
cd web
npm install
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

Each round displays every coin's result, marks matches, and shows whether you won or lost the round. A summary prints at the end. After the summary, you are prompted to run again - pressing Enter reuses your previous settings as defaults.

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
- **Save Preset** - Enter a name and click "Save Preset" to store the current form settings for later use.
- **Preset Sidebar** - A sidebar on the right lists all saved presets. Each preset shows its name and a short description of its config. Click **Load** to fill the form, **Run** to start the simulation immediately, or the delete button to remove it. Presets are saved to a `presets.json` file in the project directory.

### Simulation Screen

- **Current Round** - When pausing is enabled, displays the round number, coin images (gold for heads, silver for tails), match count, and a win/lost indicator. A "Next Flip" button advances to the next round. On the final round the button changes to "Finish".
- **History** - A scrollable log listing every completed round with its match count and win/loss status.
- **Summary** - Appears when the simulation ends, showing total flips, rounds won, total coins flipped, and overall match percentage. A "Reset" button returns to the setup screen.

When pausing is disabled, the simulation runs instantly and the history log and summary are shown without the current-round panel.

Clicking "Reset" returns to the setup screen with your previous settings pre-filled.

A session history panel is visible across all screens, showing the result of each completed game (flips won and the player's coin choice) for the current session.

## Web Version

A React + TypeScript frontend with the same features as the desktop GUI, running entirely in the browser. No Python required.

### Running the Dev Server

```bash
cd web
npm run dev
```

The app is configured with a base path for GitHub Pages deployment, so the local URL includes the project name. Open `http://localhost:5173/mtg_coin_flip/` (note the trailing slash).

The web app includes the same setup form, coin images (rendered as inline SVG), scrollable history log, and summary panel. The pause/unpause toggle works identically to the desktop GUI. Clicking "Reset" pre-fills the setup form with your previous settings. A session history panel persists across all screens, tracking flips won and the player's coin choice for each completed game.

A **Presets** sidebar appears next to the setup form. Enter a name and click "Save Preset" to store the current configuration. Saved presets can be loaded into the form, run immediately, or deleted. Presets persist in `localStorage` across browser sessions.

### Production Build

```bash
cd web
npm run build
```

The output lands in `web/dist/` and can be deployed as a static site to any host (GitHub Pages, Vercel, Netlify, etc.).

## Project Structure

```
mtg_coin_flip/
├── coin_flip.py          # Core logic, enums, CLI entry point
├── gui.py                # Tkinter desktop GUI
├── requirements.txt      # Pillow dependency (desktop GUI only)
├── DESIGN.md             # GUI design document
├── .gitignore
├── README.md
└── web/                  # React web app
    ├── package.json
    ├── index.html
    ├── vite.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── App.css
        ├── index.css
        ├── types.ts
        ├── hooks/
        │   └── usePresets.ts
        ├── logic/
        │   └── simulation.ts
        └── components/
            ├── CoinImage.tsx
            ├── SetupPanel.tsx
            ├── PresetSidebar.tsx
            ├── CurrentRound.tsx
            ├── HistoryLog.tsx
            ├── SessionHistory.tsx
            └── SummaryPanel.tsx
```
