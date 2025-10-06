"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../../types/abstract/parser");
class tagsModule extends parser_1.parserModule {
    constructor() {
        super(...arguments);
        this.cmdName = ["tags"];
        this.requiredAttr = [["ID"]];
        this.doCheckRequiredAttr = true;
    }
    recurModify(tree, sectionIDs) {
        tree.forEach(i => {
            if (i instanceof parser_1.component) {
                i.addSectionID(sectionIDs);
            }
            else {
                this.recurModify(i, sectionIDs);
            }
            ;
        });
    }
    evaluate(cmd, args, option, raw) {
        let IDs = args.getAttr("ID").split(" ");
        let final = args.getChilren();
        this.recurModify(final, IDs);
        return final;
    }
}
exports.default = tagsModule;
