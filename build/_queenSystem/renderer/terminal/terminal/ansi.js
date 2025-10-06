"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANSI_CODES = void 0;
exports.isANSI = isANSI;
exports.toKeyCode = toKeyCode;
const strip_ansi_1 = __importDefault(require("strip-ansi"));
exports.ANSI_CODES = {
    // Cursor movement
    CURSOR_HOME: "\u001b[H", // Move to (1,1)
    CURSOR_TO: (row, col) => `\u001b[${row};${col}H`,
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
};
function isANSI(ansi) {
    return (0, strip_ansi_1.default)(ansi).length === 0;
}
function toKeyCode(a) {
    const hex = a.toString("hex");
    const char = a.toString();
    switch (hex) {
    }
}
