import stripAnsi from "strip-ansi";
import ansiRegex from "ansi-regex"

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

  // Color
  RESET: "\x1b[0m"
} as const;

export function isANSI(ansi: string) {
  return stripAnsi(ansi).length === 0;
}

export class ANSI_String {
  private plain: string = "";
  private parts: { text: string; ansi: string[] }[] = [];

  constructor(str: string | ANSI_String) {
    if(typeof str === "string"){
      this.plain = stripAnsi(str);
      this.parts = this.parseAnsi(str);
    } else {
      this.plain = str.plain
      this.parts = str.parts
    }
  }

  get length(){
    return this.visible.length
  }

  get visible(): string {
    return this.plain;
  }

  get full(): string {
    return this.parts.reduce((prev, cur) => prev + cur.ansi.join("") + cur.text + ANSI_CODES.RESET, "")
  }


  slice(start = 0, end?: number): this {
    let visibleCount = 0;
    const newParts: { text: string; ansi: string[] }[] = [];
    let newPlain = "";

    for (const part of this.parts) {
      const { text, ansi } = part;
      const nextVisible = visibleCount + text.length;

      if (nextVisible < start) {
        visibleCount = nextVisible;
        continue;
      }

      const s = Math.max(start - visibleCount, 0);
      const e = end ? Math.min(end - visibleCount, text.length) : text.length;
      if (s < e) {
        newParts.push({ text: text.slice(s, e), ansi: [...ansi] });
        newPlain += text.slice(s, e);
      }

      visibleCount = nextVisible;
      if (end !== undefined && visibleCount >= end) break;
    }

    this.parts = newParts;
    this.plain = newPlain;
    return this;
  }

  /** Parse text into chunks of visible text + ANSI codes */
  private parseAnsi(str: string): { text: string; ansi: string[] }[] {
    const regex = ansiRegex();
    const parts: { text: string; ansi: string[] }[] = [];
    let lastIndex = 0;
    let match;
    let activeAnsi: string[] = [];

    while ((match = regex.exec(str))) {
      const before = str.slice(lastIndex, match.index);
      if (before) parts.push({ text: before, ansi: [...activeAnsi] });

      const code = match[0];
      if (code.endsWith("m")) {
        // handle SGR color reset or change
        if (code === ANSI_CODES.RESET) activeAnsi = [];
        else activeAnsi.push(code);
      }

      lastIndex = regex.lastIndex;
    }

    // Remaining text
    if (lastIndex < str.length) {
      parts.push({ text: str.slice(lastIndex), ansi: [...activeAnsi] });
    }

    return parts;
  }

  concat(...a: ANSI_String[]): this {
    for (const ansiStr of a) {
      this.parts = this.parts.concat(ansiStr.parts);
      this.plain += ansiStr.plain;
    }
    return this;
  }

  static from(arr : (ANSI_String | string)[], joinStr : ANSI_String | string = ""): ANSI_String {
    if (arr.length === 0) return new ANSI_String("");

    const joinAnsi = new ANSI_String(joinStr);
  
    const [first, ...rest] = arr;
    let res = new ANSI_String(first)
    rest.forEach(str => {
      res = res.concat(joinAnsi, new ANSI_String(str))
    })

    return res;
  }
}

