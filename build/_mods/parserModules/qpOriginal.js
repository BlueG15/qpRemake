"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const numeric_1 = __importDefault(require("./numeric"));
const string_1 = __importDefault(require("./string"));
const genericIf_1 = __importDefault(require("./genericIf"));
const img_1 = __importDefault(require("./img"));
const sectionID_1 = __importDefault(require("./sectionID"));
const tags_1 = __importDefault(require("./tags"));
const uaddminus_1 = __importDefault(require("./uaddminus"));
const variantCheck_1 = __importDefault(require("./variantCheck"));
const parser_1 = require("../../types/abstract/parser");
class qpOriginalPack extends parser_1.modPack {
    constructor() {
        super();
        this.moduleArr = [
            new img_1.default(),
            new sectionID_1.default(),
            new uaddminus_1.default(),
            new variantCheck_1.default(),
            new tags_1.default(),
            new numeric_1.default(),
            new string_1.default(),
            new genericIf_1.default(),
        ];
        this.loadModules();
    }
}
exports.default = qpOriginalPack;
