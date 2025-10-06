"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
class unregisteredAction extends error_1.default {
    constructor(a) {
        super();
        this.messege = `an unregistered action is being resolved with type = ${a.type}`;
    }
}
exports.default = unregisteredAction;
