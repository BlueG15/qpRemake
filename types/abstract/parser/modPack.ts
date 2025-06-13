import { component } from "./component";
import { parserModule } from "../../mods/effectTextParserModule";
import moduleInputObject from "./moduleInputObject";
import { parseOptions } from "./options";
type nestedTree<T> = T[] | nestedTree<T>[]

class modPack extends parserModule {

    private moduleMap = new Map<string, number>()
    protected moduleArr : parserModule[] = []

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

    override generateInputObj(cmdIndex: number, attrObj: { [attr: string]: string; }, children: nestedTree<component>): moduleInputObject | undefined {
        const moduleIndex = this.moduleMap.get(this.cmdName[cmdIndex])
        if(moduleIndex === undefined) return undefined
        return this.moduleArr[moduleIndex].generateInputObj(this.cmdTrueIndex[cmdIndex], attrObj, children)
    }

    override isValidAttr(cmdIndex: number, attrName: string, attr: string): boolean {
        const moduleIndex = this.moduleMap.get(this.cmdName[cmdIndex])
        if(moduleIndex === undefined) return false
        return this.moduleArr[moduleIndex].isValidAttr(this.cmdTrueIndex[cmdIndex], attrName, attr)
    }

    override evaluate(cmd: string, args: moduleInputObject, option: parseOptions, raw: string): nestedTree<component> {
        const moduleIndex = this.moduleMap.get(cmd)
        if(moduleIndex === undefined) return []
        return this.moduleArr[moduleIndex].evaluate(cmd, args, option, raw)
    }

}

export default modPack