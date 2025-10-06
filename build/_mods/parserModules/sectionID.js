"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../../types/abstract/parser");
class sectionIDModule extends parser_1.parserModule {
    constructor() {
        super(...arguments);
        this.quickKeyword = ['void', 'decompile', 'pathed', 'exposed', 'exec', 'align', 'cover', 'suspend', 'automate'];
        this.normalKeyword = ['key', 'physical', 'magic', 'health', 'attack', 'specialbuff'];
        this.pastKeyword = ['decompiled', 'exec-ed', 'aligned'];
        this.colorKeyword = ['red', 'green', 'blue', 'white', 'black', 'yellow', 'orange', 'purple'];
        this.cmdName = [
            ...this.normalKeyword,
            ...this.pastKeyword,
            ...this.quickKeyword,
            ...this.colorKeyword,
            'physical2', 'magic2',
        ];
        this.requiredAttr = new Array(this.cmdName.length).fill([]);
        this.doCheckRequiredAttr = false;
    }
    recurModify(tree, sectionID, upperCase) {
        tree.forEach(i => {
            if (i instanceof parser_1.component) {
                i.addSectionID(sectionID);
                if (i.id == parser_1.componentID.text && upperCase) {
                    i.str = i.str.toUpperCase();
                }
            }
            else {
                this.recurModify(i, sectionID, upperCase);
            }
            ;
        });
    }
    evaluate(cmd, args, option, raw) {
        let quickFlag = this.quickKeyword.includes(cmd);
        let addIconFlag = cmd.endsWith('2');
        let x = cmd;
        if (addIconFlag)
            x = x.slice(0, -1);
        let final = args.getChilren();
        if (quickFlag && !final.length) {
            //special behavior
            // x = x.toLowerCase()
            return [
                new parser_1.symbolComponent("key_" + x, undefined, cmd, raw)
            ];
        }
        this.recurModify(final, x, quickFlag);
        if (addIconFlag) {
            final = [final, [new parser_1.iconComponent((x == "physical") ? parser_1.iconID.dmg_phys : parser_1.iconID.dmg_magic, undefined, cmd, raw)]];
        }
        return final;
    }
}
exports.default = sectionIDModule;
