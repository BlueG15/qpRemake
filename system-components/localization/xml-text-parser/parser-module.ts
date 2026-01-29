import { DisplayComponent, ComponentID, TextComponent } from "./component";
import type { nestedTree } from "../../../core/misc";
import type { ParseOptions } from "./options";

export class ModuleInputObject {
    private paramMap : Map<string, string> = new Map()
    private chilren : nestedTree<DisplayComponent>
    constructor(attrObj : {[attr : string] : string}, children : nestedTree<DisplayComponent>){
        Object.keys(attrObj).forEach(i => {
            this.paramMap.set(i, attrObj[i])
        })
        this.chilren = children
    }
    hasAttr(key : string){
        return this.paramMap.has(key) && this.paramMap.get(key) != undefined
    }
    getAttr(key : string){
        return this.paramMap.get(key)
    }
    getChilren(){
        return this.chilren
    }
}

//abstract class
export class ParserModule {
    cmdName : string[] = []
    requiredAttr : string[][] = []
    doCheckRequiredAttr = false

    //can override, but shouldn't tbh
    generateInputObj(
        cmdIndex : number, 
        attrObj : {[attr : string] : string}, 
        children : nestedTree<DisplayComponent>
    ) : ModuleInputObject | undefined{
        let res = new ModuleInputObject(attrObj, children)
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

    private try_grab_child_text(c : nestedTree<DisplayComponent>) : string | undefined{
        //console.log(`Children arr len: ${c.length}`)
        if(c.length != 1) return undefined;
        if(c[0] instanceof DisplayComponent){
            if(c[0].id == ComponentID.text){
                return (c[0] as TextComponent).str
            }
        } else {
            //console.log(`Children 0 arr len: ${c[0].length}`)
            if(c[0].length != 1) return undefined
            if(c[0][0] instanceof DisplayComponent){
                if(c[0][0].id == ComponentID.text){
                    return (c[0][0] as TextComponent).str
                }
            }
        }
        return undefined
    }

    childToStr(args : ModuleInputObject) : (string | nestedTree<DisplayComponent>[number])[] {
        const c = args.getChilren()

        const res : (string | nestedTree<DisplayComponent>[number])[] = []

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

    /**
     * 
     * @param cmd The tag of the xml
     * @param args Argument object
     * @param option Parse options
     * @param raw the raw string of the component
     * @returns DisplayComponent[] upto any nesting level
     */
    evaluate(cmd : string, args: ModuleInputObject, option : ParseOptions, raw : string) : nestedTree<DisplayComponent> {
        return []
    }
}

export class ParserModulePack extends ParserModule {

    private moduleMap = new Map<string, number>()
    protected moduleArr : ParserModule[] = []

    override cmdName : string[] = []
    override requiredAttr : string[][] = []
    override doCheckRequiredAttr = false //not used

    private doCheckRequiredAttrArr : boolean[] = []
    private cmdTrueIndex : number[] = []

    protected loadModules(){
        this.moduleArr.forEach((i, index) => {
            i.cmdName.forEach(j => {
                this.moduleMap.set(j, index)
            })
            for(let k = 0; k < i.cmdName.length; k++){
                this.cmdName.push(i.cmdName[k])
                this.requiredAttr.push(i.requiredAttr[k] ?? [])
                this.doCheckRequiredAttrArr.push(i.doCheckRequiredAttr)
                this.cmdTrueIndex.push(k)
            }
        })
    }

    override generateInputObj(cmdIndex: number, attrObj: { [attr: string]: string; }, children: nestedTree<DisplayComponent>): ModuleInputObject | undefined {
        const moduleIndex = this.moduleMap.get(this.cmdName[cmdIndex])
        if(moduleIndex === undefined) return undefined
        return this.moduleArr[moduleIndex].generateInputObj(this.cmdTrueIndex[cmdIndex], attrObj, children)
    }

    override isValidAttr(cmdIndex: number, attrName: string, attr: string): boolean {
        const moduleIndex = this.moduleMap.get(this.cmdName[cmdIndex])
        if(moduleIndex === undefined) return false
        return this.moduleArr[moduleIndex].isValidAttr(this.cmdTrueIndex[cmdIndex], attrName, attr)
    }

    override evaluate(cmd: string, args: ModuleInputObject, option: ParseOptions, raw: string): nestedTree<DisplayComponent> {
        const moduleIndex = this.moduleMap.get(cmd)
        if(moduleIndex === undefined) return []
        return this.moduleArr[moduleIndex].evaluate(cmd, args, option, raw)
    }

}