import type { parseOptions } from "../abstract/parser/options";
import { component, componentID, textComponent } from "../abstract/parser/component";
import moduleInputObject from "../abstract/parser/moduleInputObject";
import type { nestedTree } from "../misc";

//abstract class
export class parserModule {
    cmdName : string[] = []
    requiredAttr : string[][] = []
    doCheckRequiredAttr = false

    //can override, but shouldn't tbh
    generateInputObj(
        cmdIndex : number, 
        attrObj : {[attr : string] : string}, 
        children : nestedTree<component>
    ) : moduleInputObject | undefined{
        let res = new moduleInputObject(attrObj, children)
        if(this.doCheckRequiredAttr){
            if(!this.requiredAttr[cmdIndex]) return undefined
            for(let i = 0; i < this.requiredAttr[cmdIndex].length; i++){
                const attrName = this.requiredAttr[cmdIndex][i]
                if(res.hasAttr(attrName)){
                    const attr = res.getAttr(attrName) as string
                    if(this.isValidAttr(cmdIndex, attrName, attr)) continue;
                    else return undefined;

                } else return undefined;
            }
        }
        return res
    }

    private try_grab_child_text(c : nestedTree<component>) : string | undefined{
        //console.log(`Children arr len: ${c.length}`)
        if(c.length != 1) return undefined;
        if(c[0] instanceof component){
            if(c[0].id == componentID.text){
                return (c[0] as textComponent).str
            }
        } else {
            //console.log(`Children 0 arr len: ${c[0].length}`)
            if(c[0].length != 1) return undefined
            if(c[0][0] instanceof component){
                if(c[0][0].id == componentID.text){
                    return (c[0][0] as textComponent).str
                }
            }
        }
        return undefined
    }

    try_collapse_child_to_text(args : moduleInputObject) : (string | nestedTree<component>[number])[] {
        const c = args.getChilren()

        const res : (string | nestedTree<component>[number])[] = []

        c.forEach(treeNode => {
            const str = this.try_grab_child_text([treeNode] as any)
            if(!str) return res.push(treeNode);
            if(
                typeof res[res.length - 1] === "string"
            ) res[res.length - 1] += str;
            else res.push(str)
        })

        return res
    }

    //may override, only triger if doCheckRequiredAttr is true
    isValidAttr(cmdIndex : number, attrName : string, attr : string){
        return true
    }

    //abstract, should override
    evaluate(cmd : string, args: moduleInputObject, option : parseOptions, raw : string) : nestedTree<component> {
        return []
    }
}