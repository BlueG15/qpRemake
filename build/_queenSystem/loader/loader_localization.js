"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../../types/abstract/gameComponents/settings");
class localizationLoader {
    constructor(s) {
        this.localizationMap = new Map();
        this.setting = s;
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            let p = this.setting.localizationFolder;
            if (!p.endsWith("/"))
                p += "/";
            let map = (yield Promise.resolve(`${p + this.currentLanguageStr}`).then(s => __importStar(require(s)))).default;
            this.localizationMap.set(this.currentLanguageStr, map);
        });
    }
    add(lang, key, val) {
        if (!this.localizationMap.has(lang))
            return;
        this.localizationMap.get(lang)[key] = val;
    }
    get currentLanguageID() { return this.setting.languageID; }
    get currentLanguageStr() { var _a; return (_a = settings_1.supporttedLanguages[this.currentLanguageID]) !== null && _a !== void 0 ? _a : "English"; }
    getSymbolMap(lang = this.currentLanguageStr) {
        if (!this.localizationMap.has(lang))
            return;
        return this.localizationMap.get(lang);
    }
}
exports.default = localizationLoader;
