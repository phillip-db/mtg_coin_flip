import tkinter as tk
from PIL import Image, ImageDraw, ImageFont, ImageTk
from coin_flip import Coin, Mode, simulate, summarize, is_win


class App:
    def __init__(self, root):
        self.root = root
        self.root.title("MTG Coin Flip Simulator")
        self.root.minsize(450, 550)

        self.coin_images = self._generate_coin_images()

        self.frame_setup = tk.Frame(root)
        self.frame_simulation = tk.Frame(root)

        self._build_setup_panel()
        self._build_simulation_panel()

        self.show_frame(self.frame_setup)

    def _generate_coin_images(self):
        images = {}
        for coin, letter, bg in [(Coin.HEADS, "H", "#FFD700"), (Coin.TAILS, "T", "#C0C0C0")]:
            img = Image.new("RGBA", (80, 80), (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            draw.ellipse([2, 2, 77, 77], fill=bg, outline="#333333", width=2)
            try:
                font = ImageFont.truetype("arial.ttf", 36)
            except OSError:
                try:
                    font = ImageFont.load_default(size=36)
                except TypeError:
                    font = ImageFont.load_default()
            bbox = draw.textbbox((0, 0), letter, font=font)
            tw = bbox[2] - bbox[0]
            draw.text(((80 - tw) // 2, (80 - bbox[3]) // 2), letter, fill="#333333", font=font)
            images[coin] = ImageTk.PhotoImage(img)
        return images

    def _build_setup_panel(self):
        self.choice = tk.IntVar(value=Coin.HEADS.value)
        self.mode_var = tk.IntVar(value=Mode.FIXED.value)
        self.coins = tk.IntVar(value=1)
        self.flips = tk.IntVar(value=1)
        self.pause = tk.BooleanVar(value=True)

        tk.Label(self.frame_setup, text="SETUP SIMULATION",
                 font=("", 14, "bold")).pack(pady=20)

        panel = tk.Frame(self.frame_setup)
        for col in range(3):
            panel.columnconfigure(col, weight=1, uniform="setup")

        tk.Label(panel, text="Choice:", anchor=tk.W).grid(
            row=0, column=0, sticky="nsew")
        tk.Radiobutton(panel, text="Heads", variable=self.choice,
                       value=Coin.HEADS.value, anchor=tk.W).grid(
            row=0, column=1, sticky="nsew")
        tk.Radiobutton(panel, text="Tails", variable=self.choice,
                       value=Coin.TAILS.value, anchor=tk.W).grid(
            row=0, column=2, sticky="nsew")

        tk.Label(panel, text="Coins:", anchor=tk.W).grid(
            row=1, column=0, sticky="nsew")
        tk.Spinbox(panel, from_=1, to=100, width=10,
                   textvariable=self.coins).grid(
            row=1, column=1, sticky="nsew")

        tk.Label(panel, text="Mode:", anchor=tk.W).grid(
            row=2, column=0, sticky="nsew")
        tk.Radiobutton(panel, text="Fixed", variable=self.mode_var,
                       value=Mode.FIXED.value, anchor=tk.W,
                       command=self._on_mode_change).grid(
            row=2, column=1, sticky="nsew")
        tk.Radiobutton(panel, text="Continuous", variable=self.mode_var,
                       value=Mode.PERSISTENT.value, anchor=tk.W,
                       command=self._on_mode_change).grid(
            row=2, column=2, sticky="nsew")

        self.num_flips_opt = tk.Frame(panel)
        tk.Label(self.num_flips_opt, text="Flips:", anchor=tk.W).grid(
            row=0, column=0, sticky="nsew")
        tk.Spinbox(self.num_flips_opt, from_=1, to=1000, width=10,
                   textvariable=self.flips).grid(
            row=0, column=1, sticky="nsew")
        self.num_flips_opt.grid(row=3, columnspan=3)

        tk.Checkbutton(panel, text="Pause between flips (show coin images)",
                       anchor=tk.W, variable=self.pause).grid(
            row=4, column=0, columnspan=3, sticky="nsew")

        panel.pack(pady=10)
        tk.Button(self.frame_setup, text="Start Flipping",
                  command=self._start_simulation).pack(pady=10)

    def _build_simulation_panel(self):
        self.frame_simulation.columnconfigure(0, weight=1)

        # Current round display (coin images + match count)
        self.panel_current = tk.LabelFrame(self.frame_simulation,
                                           text="Current Round")
        self.lbl_round = tk.Label(self.panel_current, font=("", 12, "bold"))
        self.lbl_round.pack(pady=(5, 0))
        self.frame_coins = tk.Frame(self.panel_current)
        self.frame_coins.pack(pady=5)
        self.lbl_matches = tk.Label(self.panel_current)
        self.lbl_matches.pack()
        self.lbl_win = tk.Label(self.panel_current, font=("", 10, "bold"))
        self.lbl_win.pack(pady=(0, 5))

        self.btn_next = tk.Button(self.frame_simulation, text="Next Flip",
                                  command=self._advance_round)

        # History log
        self.panel_history = tk.LabelFrame(self.frame_simulation,
                                           text="History")
        history_inner = tk.Frame(self.panel_history)
        history_inner.pack(fill="both", expand=True)
        self.history_text = tk.Text(history_inner, height=8, state="disabled",
                                    wrap="none")
        scrollbar = tk.Scrollbar(history_inner,
                                 command=self.history_text.yview)
        self.history_text.config(yscrollcommand=scrollbar.set)
        self.history_text.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        # Summary panel
        self.panel_summary = tk.LabelFrame(self.frame_simulation,
                                           text="Summary")
        self.lbl_summary = tk.Label(self.panel_summary, justify="left",
                                    anchor="w", font=("Courier", 10))
        self.lbl_summary.pack(padx=10, pady=5, fill="x")
        tk.Button(self.panel_summary, text="Reset",
                  command=self._reset).pack(pady=(0, 5))

    def _on_mode_change(self):
        if self.mode_var.get() == Mode.FIXED.value:
            self.num_flips_opt.grid(row=3, column=0)
        else:
            self.num_flips_opt.grid_forget()

    def show_frame(self, frame):
        for f in (self.frame_setup, self.frame_simulation):
            f.pack_forget()
        frame.pack(fill="both", expand=True, padx=20, pady=10)

    def _start_simulation(self):
        self.current_choice = Coin(self.choice.get())
        self.current_mode = Mode(self.mode_var.get())
        self.max_flips = (self.flips.get()
                          if self.current_mode == Mode.FIXED else None)
        self.sim = simulate(self.current_choice, self.coins.get(),
                            self.current_mode, self.max_flips)
        self.collected_results = []
        self.round_num = 0
        self.sim_done = False

        self._clear_coin_images()
        self.history_text.config(state="normal")
        self.history_text.delete("1.0", "end")
        self.history_text.config(state="disabled")
        self.panel_summary.grid_forget()
        self.btn_next.config(text="Next Flip")

        self.show_frame(self.frame_simulation)

        if self.pause.get():
            self.panel_current.grid(row=0, column=0, sticky="ew",
                                    pady=(0, 10))
            self.btn_next.grid(row=1, column=0, pady=(0, 10))
            self.panel_history.grid(row=2, column=0, sticky="nsew",
                                    pady=(0, 10))
            self._advance_round()
        else:
            self.panel_current.grid_forget()
            self.btn_next.grid_forget()
            self.panel_history.grid(row=0, column=0, sticky="nsew",
                                    pady=(0, 10))
            for coins, counts in self.sim:
                self.round_num += 1
                self.collected_results.append(counts)
                self._log_round(self.round_num, counts)
            self._show_summary()

    def _advance_round(self):
        if self.sim_done:
            self._show_summary()
            return

        try:
            coins, counts = next(self.sim)
        except StopIteration:
            self._show_summary()
            return

        self.round_num += 1
        self.collected_results.append(counts)

        self.lbl_round.config(text=f"--- Round {self.round_num} ---")
        self._show_coin_images(coins)

        matches = counts[self.current_choice]
        total = sum(counts.values())
        self.lbl_matches.config(
            text=f"{matches}/{total} landed on {self.current_choice.name}")
        won = is_win(counts, self.current_choice)
        self.lbl_win.config(
            text="\u2713 ROUND WON" if won else "\u2717 ROUND LOST",
            fg="green" if won else "red")

        self._log_round(self.round_num, counts)

        is_last = False
        if (self.current_mode == Mode.FIXED
                and self.round_num >= self.max_flips):
            is_last = True
        if self.current_mode == Mode.PERSISTENT and matches == 0:
            is_last = True

        if is_last:
            self.sim_done = True
            self.btn_next.config(text="Finish")

    def _show_coin_images(self, coins):
        self._clear_coin_images()
        for i, coin in enumerate(coins):
            lbl = tk.Label(self.frame_coins, image=self.coin_images[coin])
            lbl.grid(row=0, column=i, padx=4)

    def _clear_coin_images(self):
        for widget in self.frame_coins.winfo_children():
            widget.destroy()

    def _log_round(self, round_num, counts):
        matches = counts[self.current_choice]
        total = sum(counts.values())
        won = is_win(counts, self.current_choice)
        marker = "\u2713 won" if won else "\u2717 lost"
        line = (f"Round {round_num}: {matches}/{total} "
                f"{self.current_choice.name}  {marker}\n")
        self.history_text.config(state="normal")
        self.history_text.insert("end", line)
        self.history_text.see("end")
        self.history_text.config(state="disabled")

    def _show_summary(self):
        summary = summarize(self.collected_results, self.current_choice)
        text = (
            f"Total flips:   {summary['total_flips']}\n"
            f"Rounds won:    {summary['rounds_won']}/{summary['total_flips']}\n"
            f"Total coins:   {summary['total_coins']}\n"
            f"Matches:       {summary['total_matches']}/{summary['total_coins']}"
            f" ({summary['match_pct']:.1f}%)")
        self.lbl_summary.config(text=text)
        self.panel_current.grid_forget()
        self.btn_next.grid_forget()
        self.panel_summary.grid(row=3, column=0, sticky="ew", pady=(0, 10))

    def _reset(self):
        self.sim_done = False
        self.btn_next.config(text="Next Flip")
        self.panel_current.grid_forget()
        self.btn_next.grid_forget()
        self.panel_summary.grid_forget()
        self.panel_history.grid_forget()
        self.show_frame(self.frame_setup)


root = tk.Tk()
app = App(root)
root.mainloop()
