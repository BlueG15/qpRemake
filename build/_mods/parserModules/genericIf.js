"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../../types/abstract/parser");
class genericIfModule extends parser_1.parserModule {
    constructor() {
        super(...arguments);
        this.cmdName = ['if'];
        this.requiredAttr = [['type']];
        this.doCheckRequiredAttr = true;
    }
    isValidAttr(cmdIndex, attrName, attr) {
        if (attr != 'string' && attr != 'numeric' && attr != "number" && attr != "auto")
            return false;
        return true;
    }
    evaluate(cmd, args, option, raw) {
        const type = args.getAttr('type');
        if (!type)
            return [];
        const children = args.getChilren();
        if (children.length != 3)
            return children;
        //console.log(children)
        let condition = children[0];
        let isCondFalse = false;
        if (condition instanceof parser_1.component) {
            if (type == "string") {
                if (condition.id != parser_1.componentID.text)
                    return [];
                if (condition.str.length == 0)
                    isCondFalse = true;
            }
            else if (type != "auto") {
                if (condition.id != parser_1.componentID.number)
                    return [];
                if (condition.num == 0 || isNaN(condition.num))
                    isCondFalse = true;
            }
            else {
                if (condition.id == parser_1.componentID.number) {
                    if (condition.num == 0 || isNaN(condition.num))
                        isCondFalse = true;
                }
                else if (condition.id == parser_1.componentID.text) {
                    if (condition.str.length == 0)
                        isCondFalse = true;
                }
                else
                    return [];
            }
        }
        else if (condition.length == 1 && condition[0] instanceof parser_1.component) {
            if (type == "string") {
                if (condition[0].id != parser_1.componentID.text)
                    return [];
                if (condition[0].str.length == 0)
                    isCondFalse = true;
            }
            else if (type != "auto") {
                if (condition[0].id != parser_1.componentID.number)
                    return [];
                if (condition[0].num == 0 || isNaN(condition[0].num))
                    isCondFalse = true;
            }
            else {
                if (condition[0].id == parser_1.componentID.number) {
                    if (condition[0].num == 0 || isNaN(condition[0].num))
                        isCondFalse = true;
                }
                else if (condition[0].id == parser_1.componentID.text) {
                    if (condition[0].str.length == 0)
                        isCondFalse = true;
                }
                else
                    return [];
            }
        }
        else
            return [];
        let pi = isCondFalse ? 2 : 1;
        return ((children[pi] instanceof parser_1.component) ? [children[pi]] : children[pi]);
    }
}
exports.default = genericIfModule;
