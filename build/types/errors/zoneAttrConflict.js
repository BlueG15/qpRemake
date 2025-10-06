"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
class zoneAttrConflict extends error_1.default {
    constructor(zoneID, actionName, cardID) {
        super(cardID);
        this.messege = `Attempts to interact with zone with id ${zoneID} is not allowed by zone attribute`;
        if (actionName)
            this.messege += ", forbidden action: " + actionName;
    }
}
exports.default = zoneAttrConflict;
