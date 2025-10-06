"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../../types/abstract/parser");
class uadduminusModule extends parser_1.parserModule {
    constructor() {
        super(...arguments);
        this.cmdName = ['uadd', 'uminus'];
        this.requiredAttr = [[], []];
        this.doCheckRequiredAttr = false;
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
        let upgradeFlag = option.cardData && option.cardData.variants.join(" ").toLowerCase().includes("upgrade");
        if ((upgradeFlag && cmd == "uminus") || (!upgradeFlag && cmd == "uadd")) {
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
exports.default = uadduminusModule;
