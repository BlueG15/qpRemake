import { DisplayComponent } from "./component";
import { ParserModule } from "../../mods/effectTextParserModule";
import moduleInputObject from "./moduleInputObject";
import { parseOptions } from "./options";
import type { nestedTree } from "../../misc";

class modPack extends ParserModule {

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

    override generateInputObj(cmdIndex: number, attrObj: { [attr: string]: string; }, children: nestedTree<DisplayComponent>): moduleInputObject | undefined {
        const moduleIndex = this.moduleMap.get(this.cmdName[cmdIndex])
        if(moduleIndex === undefined) return undefined
        return this.moduleArr[moduleIndex].generateInputObj(this.cmdTrueIndex[cmdIndex], attrObj, children)
    }

    override isValidAttr(cmdIndex: number, attrName: string, attr: string): boolean {
        const moduleIndex = this.moduleMap.get(this.cmdName[cmdIndex])
        if(moduleIndex === undefined) return false
        return this.moduleArr[moduleIndex].isValidAttr(this.cmdTrueIndex[cmdIndex], attrName, attr)
    }

    override evaluate(cmd: string, args: moduleInputObject, option: parseOptions, raw: string): nestedTree<DisplayComponent> {
        const moduleIndex = this.moduleMap.get(cmd)
        if(moduleIndex === undefined) return []
        return this.moduleArr[moduleIndex].evaluate(cmd, args, option, raw)
    }

}

export default modPack