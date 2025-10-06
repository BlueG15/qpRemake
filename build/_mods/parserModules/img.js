"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../../types/abstract/parser");
class imgModule extends parser_1.parserModule {
    constructor() {
        super(...arguments);
        this.cmdName = ['img', 'icon'];
        this.requiredAttr = [[], []];
        this.doCheckRequiredAttr = false;
    }
    getIconID(key) {
        let k = key;
        let x = parser_1.iconID[k];
        if (!x)
            return [parser_1.iconID.crash, false];
        return [x, true];
    }
    evaluate(cmd, args, option, raw) {
        let isInIconMode = false;
        let str = args.getAttr('id');
        if (str)
            isInIconMode = true;
        else
            str = args.getAttr('url');
        if (str)
            isInIconMode = false;
        else
            return [];
        if (isInIconMode) {
            let [iconID, isCorrect] = this.getIconID(str);
            return [
                new parser_1.iconComponent(iconID, isCorrect ? undefined : `Wrong iconID, received = ${str}`, cmd, raw)
            ];
        }
        else {
            return [
                new parser_1.imageComponent(str, undefined, cmd, raw)
            ];
        }
    }
}
exports.default = imgModule;
