"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
class zoneFull extends error_1.default {
    constructor(zoneID, cardID) {
        super(cardID);
        this.messege = `Cannot add card with id ${cardID} to zone with id ${zoneID} full, extra card discarded`;
    }
}
exports.default = zoneFull;
