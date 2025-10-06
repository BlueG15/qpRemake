"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
class subTypeOverrideConflict extends error_1.default {
    constructor(cid, eid, conflictIndexes) {
        super(cid);
        this.effectID = eid;
        this.conflictIndexes = conflictIndexes;
        this.messege = conflictIndexes.length + " subtypes attempted to override the result differently in card with id " + cid + " on effect " + eid;
    }
}
exports.default = subTypeOverrideConflict;
