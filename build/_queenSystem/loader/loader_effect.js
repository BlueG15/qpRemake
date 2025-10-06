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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const effect_1 = __importDefault(require("../../types/abstract/gameComponents/effect"));
//Cards have 2 parts
//Data and Code
//As denoted b4 in the README file, there are 3 approaches
// naive -> load everything into mem
// dynamic -> async load both class and data if needed
// fixxed size cache -> use some kind of eviction scheme, similar to paging  
class effectLoader {
    constructor(dataRegistry, subtypeLoader, typeLoader) {
        this.classCache = new Map();
        this.countCache = new Map();
        this.dataCache = new Map(Object.entries(dataRegistry));
        this.subtypeLoader = subtypeLoader;
        this.typeLoader = typeLoader;
    }
    get classkeys() {
        return Array.from(this.classCache.keys());
    }
    get datakeys() {
        return Array.from(this.dataCache.keys());
    }
    loadSingle(path, eid, s) {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = (yield Promise.resolve(`${path + eid}`).then(s => __importStar(require(s)))).default;
            if (typeof obj === "function") {
                this.classCache.set(eid, obj);
            }
            else if (typeof obj === "object") {
                Object.keys(obj).forEach(k => {
                    if (typeof obj[k] === "function") {
                        this.classCache.set(k, obj[k]);
                    }
                });
            }
        });
    }
    load(s) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = s.effectFolder;
            if (!path.endsWith("/"))
                path += "/";
            let arr = [];
            s.effectFiles.forEach(eid => {
                arr.push(this.loadSingle(path, eid, s));
            });
            yield Promise.all(arr);
        });
    }
    ;
    add(key, param) {
        if (typeof param == "function") {
            this.classCache.set(key, param);
        }
        else {
            this.dataCache.set(key, param);
        }
    }
    //most hacky fix ever
    //ahhhh
    //TODO : find a better solution
    validator(x) {
        try {
            x();
            return false;
        }
        catch (e) {
            try {
                return e.message.includes("cannot be invoked without 'new'");
            }
            catch (e) {
                return false;
            }
        }
    }
    getEffect(eid, s, edata) {
        let data = this.dataCache.get(eid);
        if (!data)
            return undefined;
        let eclass = this.classCache.get(eid);
        if (!eclass) {
            console.log("No class Data for key ", eid);
            return undefined;
        }
        if (edata)
            Utils.patchGeneric(data, edata);
        return this.getDirect(eid, s, eclass, data);
    }
    getDirect(eid, s, eclass, data) {
        let c = this.countCache.get(eid);
        c = (c) ? (c + 1) % s.max_id_count : 0;
        this.countCache.set(eid, c);
        //load type
        let type = this.typeLoader.getType(data.typeID, s, eid);
        if (!type)
            return undefined;
        let runID = Utils.dataIDToUniqueID(eid, c, s, ...data.subTypeIDs);
        //load subtypes
        let k = [];
        data.subTypeIDs.forEach(i => {
            let st = this.subtypeLoader.getSubtype(i, s, eid);
            if (st)
                k.push(st);
        });
        if (k.length != data.subTypeIDs.length && !s.ignore_undefined_subtype) {
            return undefined;
        }
        if (this.validator(eclass)) {
            const res = new eclass(runID, eid, type, k, data);
            return (res instanceof effect_1.default) ? res : undefined;
        }
        return undefined;
    }
}
exports.default = effectLoader;
