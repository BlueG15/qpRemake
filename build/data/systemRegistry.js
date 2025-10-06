"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputType = exports.identificationType = exports.suspensionReason = exports.GamePhase = exports.TurnPhase = void 0;
var TurnPhase;
(function (TurnPhase) {
    TurnPhase[TurnPhase["declare"] = 1] = "declare";
    TurnPhase[TurnPhase["input"] = 2] = "input";
    TurnPhase[TurnPhase["chain"] = 3] = "chain";
    TurnPhase[TurnPhase["recur"] = 4] = "recur";
    TurnPhase[TurnPhase["resolve"] = 5] = "resolve";
    TurnPhase[TurnPhase["trigger"] = 6] = "trigger";
    TurnPhase[TurnPhase["complete"] = 7] = "complete";
})(TurnPhase || (exports.TurnPhase = TurnPhase = {}));
var GamePhase;
(function (GamePhase) {
    GamePhase[GamePhase["idle"] = 0] = "idle";
    GamePhase[GamePhase["resolving"] = 1] = "resolving";
    GamePhase[GamePhase["infinite_loop"] = 2] = "infinite_loop";
    GamePhase[GamePhase["p1_win"] = 3] = "p1_win";
    GamePhase[GamePhase["p2_win"] = 4] = "p2_win";
})(GamePhase || (exports.GamePhase = GamePhase = {}));
var suspensionReason;
(function (suspensionReason) {
    suspensionReason[suspensionReason["taking_input"] = 1] = "taking_input";
    suspensionReason[suspensionReason["infinite_loop"] = 2] = "infinite_loop";
    suspensionReason[suspensionReason["game_finished"] = 3] = "game_finished";
})(suspensionReason || (exports.suspensionReason = suspensionReason = {}));
var identificationType;
(function (identificationType) {
    identificationType[identificationType["zone"] = 0] = "zone";
    identificationType[identificationType["card"] = 1] = "card";
    identificationType[identificationType["partition"] = 2] = "partition";
    identificationType[identificationType["effect"] = 3] = "effect";
    identificationType[identificationType["effectSubtype"] = 4] = "effectSubtype";
    identificationType[identificationType["position"] = 5] = "position";
    identificationType[identificationType["action"] = 6] = "action";
    identificationType[identificationType["player"] = 7] = "player";
    identificationType[identificationType["none"] = 8] = "none";
    identificationType[identificationType["system"] = 9] = "system";
})(identificationType || (exports.identificationType = identificationType = {}));
var inputType;
(function (inputType) {
    inputType[inputType["zone"] = 0] = "zone";
    inputType[inputType["card"] = 1] = "card";
    inputType[inputType["effect"] = 2] = "effect";
    inputType[inputType["effectSubtype"] = 3] = "effectSubtype";
    inputType[inputType["position"] = 4] = "position";
    inputType[inputType["player"] = 5] = "player";
    inputType[inputType["string"] = 6] = "string";
    inputType[inputType["boolean"] = 7] = "boolean";
    inputType[inputType["number"] = 8] = "number";
})(inputType || (exports.inputType = inputType = {}));
// import type { StrictGenerator } from "../types/misc"
// export type inputRequester_format<T extends inputType = inputType, T2 extends inputType = T> = [validSetFormat<T2>, StrictGenerator<validSetFormat<T>, validSetFormat<T> | void, inputDataSpecific<T>>]
// export type Action_final_generatorType<T extends inputType = inputType> = Generator<validSetFormat<T>, Action[], inputDataSpecific<T>>
// export type Action_final_generatorType_recur<T extends inputType = inputType> = Generator<inputRequester_format<T>, Action[] | Action_final_generatorType_recur<T>, inputDataSpecific<T>>
