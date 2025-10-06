"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
class cardNotExist extends error_1.default {
    constructor() {
        super();
        this.messege = `Try to access something thats not a card pretending to be a card`;
    }
}
exports.default = cardNotExist;
