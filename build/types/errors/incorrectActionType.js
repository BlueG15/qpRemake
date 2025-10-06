"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
class incorrectActiontype extends error_1.default {
    constructor(got, expected) {
        super();
        this.messege = `wrong action type received : got : ${got}, expected : ${expected}`;
    }
}
exports.default = incorrectActiontype;
