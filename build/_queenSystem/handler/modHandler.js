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
const loader_mod_1 = __importDefault(require("../loader/loader_mod"));
class modHandler {
    constructor(s, regs) {
        this.loaded = false;
        this.loader = new loader_mod_1.default(s);
        this.regs = regs;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            this.loaded = false;
            yield this.loader.load();
            this.loader.getAll().forEach(i => {
                i.load(this.regs);
            });
            this.loaded = true;
        });
    }
    get isLoaded() {
        return this.loaded;
    }
}
exports.default = modHandler;
