import DefParser from './expression_parser';
import { ParserModule, moduleInputObject, parseOptions, TextComponent, DisplayComponent } from '../../types/parser';
import utils from "util"
import type { nestedTree } from '../../types/misc'

export default class expressionModule extends ParserModule {

    override cmdName = ['expression', "expr", "ex"];
    override requiredAttr = [["expr"]];
    override doCheckRequiredAttr = false;

    override evaluate(cmd : string, args: moduleInputObject, option: parseOptions, raw : string){
        let expr : undefined | string | ReturnType<ParserModule["try_collapse_child_to_text"]> = args.getAttr("expr");
        if(!expr) expr = this.try_collapse_child_to_text(args);
        if(!expr) return [new TextComponent("", "No expr", cmd, raw)]

        DefParser.bindVariables(option.inputNumber, option.inputString)

        try{
            const parse_result = DefParser.parse(expr)
            // const debug = parse_result.flatMap(r => 
            //     r ? r.toString().split("\n").map(str => new textComponent(str, undefined, cmd, raw)) : []
            // )

            const eval_result = parse_result.map(expr => expr.evaluate(DefParser)[0])

            const flattened_parse_result = DefParser.flattenExpressions<nestedTree<DisplayComponent>>(eval_result)
            const res = flattened_parse_result.map(e => {
                if(typeof e === "string"){
                    return new TextComponent(e, undefined, cmd, raw)
                }
                return e
            })
            // res.unshift(...debug)
            // res.unshift(new textComponent(`Parsed Len : ${res.length}`, undefined, cmd, raw))
            return res as any
        }catch(e){
            return utils.format(e).split("\n").map(str => new TextComponent("", str, cmd, raw))
        }

    }
}

