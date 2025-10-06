"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lib_parse_option = exports.loadOptions = exports.parseOptions = exports.parseMode = void 0;
//TODO : integrate cardData and effectData into this
var parseMode;
(function (parseMode) {
    parseMode[parseMode["gameplay"] = 0] = "gameplay";
    parseMode[parseMode["catalog"] = 1] = "catalog";
    parseMode[parseMode["reprogram"] = 2] = "reprogram";
    parseMode[parseMode["info"] = 3] = "info";
    parseMode[parseMode["debug"] = 4] = "debug";
})(parseMode || (exports.parseMode = parseMode = {}));
class parseOptions {
    constructor(mode, input, flat_parse = false, card) {
        this.flat_parse = flat_parse;
        this.mode = mode;
        this.cardData = card;
        this.inputNumber = [];
        this.inputString = [];
        input.forEach(i => {
            if (typeof i == "string")
                this.inputString.push(i);
            else
                this.inputNumber.push(i);
        });
    }
}
exports.parseOptions = parseOptions;
class loadOptions {
    constructor(modulePath, modules = []) {
        this.modulePath = modulePath;
        this.modulesInUse = modules;
    }
}
exports.loadOptions = loadOptions;
const lib_parse_option = {
    preserveComments: false,
    preserveXmlDeclaration: false,
    preserveDocumentType: false,
    ignoreUndefinedEntities: false,
    includeOffsets: true,
    sortAttributes: false,
    preserveCdata: false,
};
exports.lib_parse_option = lib_parse_option;
