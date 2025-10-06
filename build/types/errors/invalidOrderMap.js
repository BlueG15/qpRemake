"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
class invalidOrderMap extends error_1.default {
    constructor(orderMap) {
        super();
        this.orderMap = orderMap;
        this.messege = `Invalid order map`;
    }
}
exports.default = invalidOrderMap;
