"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
class cardNotInApplicableZone extends error_1.default {
    constructor(zoneID, cardID) {
        super(cardID);
        this.messege = `Action done when card is not in zone with id ${zoneID} is invalid, cardID = ${cardID}`;
    }
}
exports.default = cardNotInApplicableZone;
