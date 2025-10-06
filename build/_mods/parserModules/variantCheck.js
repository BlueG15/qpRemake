"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../../types/abstract/parser");
class variantCheckModule extends parser_1.parserModule {
    constructor() {
        super(...arguments);
        this.cmdName = [
            'variantInclude', 'variantExclude'
        ];
        this.requiredAttr = new Array(2).fill(["variantID"]);
        this.doCheckRequiredAttr = true;
    }
    isValidAttr(cmdIndex, attrName, attr) {
        const k = attr.split(" ");
        for (let i = 0; i < k.length; i++) {
            if (!k[i].length)
                return false;
        }
        return true;
    }
    recurModify(tree, sectionID) {
        tree.forEach(i => {
            if (i instanceof parser_1.component) {
                i.addSectionID(sectionID);
            }
            else {
                this.recurModify(i, sectionID);
            }
            ;
        });
    }
    evaluate(cmd, args, option, raw) {
        let k = args.getChilren();
        if (option.mode == parser_1.mode.debug)
            return k;
        //remove bracket by default
        const checkVariant = args.getAttr("expr").split(' ');
        let correctVariantFlag = option.cardData && option.cardData.variants.some(i => checkVariant.includes(i));
        if ((correctVariantFlag && cmd == "variantExclude") || (!correctVariantFlag && cmd == "variantInclude")) {
            return [];
        }
        if (option.mode == parser_1.mode.info) {
            k = [
                [new parser_1.textComponent("[", undefined, cmd, raw)],
                k,
                [new parser_1.textComponent("]", undefined, cmd, raw)]
            ];
        }
        this.recurModify(k, cmd);
        return k;
    }
}
exports.default = variantCheckModule;
