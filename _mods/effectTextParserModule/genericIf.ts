import { component, effectTextParserModule, moduleInputObject, parseOptions, textComponent, numberComponent, componentID } from '../../types/abstract/parser';
type nestedTree<T> = T[] | nestedTree<T>[]

// import numericModule from "./numeric";
// import stringParseModule from "./string";

export default class genericIfModule extends effectTextParserModule {

    override cmdName = ['if'];
    override requiredAttr = [['type']];
    override doCheckRequiredAttr = true;

    override isValidAttr(cmdIndex: number, attrName: string, attr: string): boolean {
        if(attr != 'string' && attr != 'numeric' && attr != "number" && attr != "auto") return false
        return true
    }

    override evaluate(cmd: string, args: moduleInputObject, option: parseOptions, raw: string): nestedTree<component> {
 
        const type = args.getAttr('type');
        if(!type) return []

        const children = args.getChilren()
        if(children.length != 3) return children

        //console.log(children)
        
        let condition = children[0]
        let isCondFalse = false
        if(condition instanceof component) {
            if(type == "string"){
                if(condition.id != componentID.text) return []
                if((condition as textComponent).str.length == 0) isCondFalse = true 
            } else if (type != "auto"){
                if(condition.id != componentID.number) return []
                if((condition as numberComponent).num == 0 || isNaN((condition as numberComponent).num)) isCondFalse = true 
            } else {
                if(condition.id == componentID.number){
                    if((condition as numberComponent).num == 0 || isNaN((condition as numberComponent).num)) isCondFalse = true 
                } else if (condition.id == componentID.text){
                    if((condition as textComponent).str.length == 0) isCondFalse = true 
                } else return []
            }
        } else if (condition.length == 1 && condition[0] instanceof component){
            if(type == "string"){
                if(condition[0].id != componentID.text) return []
                if((condition[0] as textComponent).str.length == 0) isCondFalse = true 
            } else if (type != "auto"){
                if(condition[0].id != componentID.number) return []
                if((condition[0] as numberComponent).num == 0 || isNaN((condition[0] as numberComponent).num)) isCondFalse = true 
            } else {
                if(condition[0].id == componentID.number){
                    if((condition[0] as numberComponent).num == 0 || isNaN((condition[0] as numberComponent).num)) isCondFalse = true 
                } else if (condition[0].id == componentID.text){
                    if((condition[0] as textComponent).str.length == 0) isCondFalse = true 
                } else return []
            }
        } else return []

        let pi = isCondFalse ? 2 : 1
        return ((children[pi] instanceof component) ? [children[pi]] : children[pi]) as nestedTree<component>
    }
}