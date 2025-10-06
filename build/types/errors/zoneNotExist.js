"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
class zoneNotExist extends error_1.default {
    constructor(zid) {
        super();
        this.messege = `Try to access something thats not a zone pretending to be a zone, accessing index : ${zid}`;
    }
}
exports.default = zoneNotExist;
