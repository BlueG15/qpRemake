"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const queenSystem_1 = __importDefault(require("./_queenSystem/queenSystem"));
const settings_1 = require("./types/abstract/gameComponents/settings");
const global_1 = __importDefault(require("./global"));
global_1.default.load();
const operatorRegistry_1 = require("./data/operatorRegistry");
const terminalRenderer_1 = require("./_queenSystem/renderer/terminalRenderer");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let setting = new settings_1.defaultSetting();
        let renderer = new terminalRenderer_1.qpTerminalRenderer();
        let s = new queenSystem_1.default(setting, renderer);
        renderer.bind(s);
        s.addPlayers("player", operatorRegistry_1.operatorRegistry.o_esper);
        s.addPlayers("enemy", operatorRegistry_1.operatorRegistry.o_null);
        yield s.load();
        renderer.start();
    });
}
main();
