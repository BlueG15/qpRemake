"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
class cannotLoad extends error_1.default {
    constructor(itemID, type) {
        super();
        this.messege = `Cannot load item ${itemID} ${type ? `type = ${type}` : ""}`;
    }
}
exports.default = cannotLoad;
