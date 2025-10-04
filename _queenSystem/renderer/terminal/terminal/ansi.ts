import stripAnsi from "strip-ansi";

export const ANSI_CODES = {
  // Cursor movement
  CURSOR_HOME: "\u001b[H", // Move to (1,1)
  CURSOR_TO: (row: number, col: number) => `\u001b[${row};${col}H`,

  // Screen clearing
  CLEAR_SCREEN: "\u001b[2J", // Clear entire screen
  CLEAR_LINE: "\u001b[2K", // Clear entire line
  CLEAR_TO_END: "\u001b[0J", // Clear from cursor to end

  // Cursor visibility
  HIDE_CURSOR: "\u001b[?25l",
  SHOW_CURSOR: "\u001b[?25h",

  // Save/restore
  SAVE_CURSOR: "\u001b[s",
  RESTORE_CURSOR: "\u001b[u",
} as const;

export function isANSI(ansi: string) {
  return stripAnsi(ansi).length === 0;
}

export function toKeyCode(a: Buffer<ArrayBufferLike>) {
  const hex = a.toString("hex");
  const char = a.toString();

  switch (hex) {
  }
}
