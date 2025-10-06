"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../../types/abstract/parser");
class addSymbolModule extends parser_1.parserModule {
    constructor() {
        super(...arguments);
        this.cmdName = ['symbol'];
        this.requiredAttr = [["id"]];
        this.doCheckRequiredAttr = true;
    }
    evaluate(cmd, args, option, raw) {
        let x = args.getAttr("id");
        if (!x)
            return [];
        return [new parser_1.symbolComponent(x, undefined, "symbol", raw).addSectionID(x)];
    }
}
exports.default = addSymbolModule;
