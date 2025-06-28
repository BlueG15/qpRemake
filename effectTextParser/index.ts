import { parseXml } from '@rgrove/parse-xml';
import {XmlProcessingInstruction, XmlElement} from '@rgrove/parse-xml'

import { component, textComponent, parserModule, parseOptions, loadOptions, lib_parse_option } from '../types/abstract/parser';
import type { nestedTree } from '../types/misc';

type XMLTree =  XmlProcessingInstruction | XmlElement

export default class parser {
    private loaded = false;
    private moduleArr : parserModule[] = []
    private moduleMap : Map<string, [number, number]> = new Map()
    //[module index, command index]

    constructor(){}

    //
    async load(l : loadOptions){
        let path = l.modulePath
        if(!path.endsWith("/")) path += "/";
        console.log(`load triggered, ab to load ${l.modulesInUse.length} modules`)
        for(let x = 0; x < l.modulesInUse.length; x++){
            let i = l.modulesInUse[x]
            //start dynamic importing
            let moduleClass = await import(path + i);
            if(!moduleClass || !moduleClass.default){
                console.warn(`WARN: Cannot import module ${i} in path ${path + i}`);
            } else {
                let moduleInstance = new moduleClass.default() as parserModule
                
                //test malformed module
                if(!(moduleInstance instanceof parserModule)){
                    console.warn(`WARN: file ${path + i} is not a module, skipped`)
                } else {
                    if(moduleInstance.requiredAttr.length != moduleInstance.cmdName.length){
                        console.warn(`WARN: module ${i} is malformed: paramName and cmdName length does not matched up, auto filled with empty arrays`)
                        while(moduleInstance.cmdName.length > moduleInstance.requiredAttr.length){
                            moduleInstance.requiredAttr.push([])
                        }
                    }

                    let k = this.moduleArr.length
                    this.moduleArr.push(moduleInstance)
                    moduleInstance.cmdName.forEach((n, index) => {
                        //if repeated keys appear, take the latter
                        if(this.moduleMap.has(n)){
                            let [oldModuleNumber, _] = (this.moduleMap.get(n) as [number, number])
                            let oldName = l.modulesInUse[oldModuleNumber]
                            if(oldModuleNumber == k){
                                console.warn(`WARN: Module ${oldName} has duplicate command : ${n}`)
                            } else console.warn(`WARN: Repeated commands in multiple modules found, cmd = ${n}, originally from ${oldName}, currently override to use from module ${i}`)
                        }
                        this.moduleMap.set(n, [k, index])
                        console.log(`loaded cmd ${n} from module ${i}`)
                    })
                    
                }
            }
        }
        this.loaded = true;
    }

    private parse_internal_lib_level(str : string, inRecur = false) : XMLTree{
        if(!inRecur){
            str = `<document>${str}</document>`;
        }

        try{
            //the lib wraps everything in a layer so we need to extract that layer
            return parseXml(str, lib_parse_option).children[0] as XMLTree
        } catch(err : any){
            if( 
                err.message.startsWith("Missing end tag") && 
                str.slice(err.pos, err.pos + 3) == "</>"
            ){
                //correct condition to replace the shorthand </> as the most recent opening tag
                let pre = str.slice(0, err.pos);
                let post = str.slice(err.pos + 3);

                let k = err.message.indexOf("(line");
                if(k == -1) throw err;
                let cTag = err.message.slice(28, k-1);
                return this.parse_internal_lib_level(pre + `</${cTag}>` + post, true);
            }
            else throw err
        }
    }

    private parse_internal_loader_level_node(originalXML : string, tree : XmlElement, o : parseOptions, children: nestedTree<component>) : nestedTree<component>{
        const cmd = tree.name
        if(this.moduleMap.has(cmd)){
            const [moduleIndex, cmdIndex] = (this.moduleMap.get(cmd) as [number, number])
            const module = this.moduleArr[moduleIndex]
            const inputObj = module.generateInputObj(cmdIndex, tree.attributes, children)

            if(!inputObj){
                //incorrect input
                const errMes = `Failed to parse input for module ${cmd}, tried to parse attributes: ${JSON.stringify(tree.attributes, null, 0)}, required attributes = ${JSON.stringify(module.requiredAttr[cmdIndex], null, 0)}, reverting to text node`
                console.warn(errMes)
                return [new textComponent(tree.text, errMes, cmd, tree.text)]
            }

            return module.evaluate(cmd, inputObj, o, tree.text)

        } else {
            const errMes = `WARN: unknown module, tried to invoke ${cmd}, reverting to a text node`
            console.warn(errMes)
            return [new textComponent(tree.text, errMes, cmd, tree.text)]
        }
    }

    private parse_internal_loader_level(originalXML : string, tree : XMLTree, o : parseOptions) : nestedTree<component>{
        if(tree instanceof XmlProcessingInstruction){
            //undefined behavior?
            //idk what this shit is???
            const errMes = `WARN: XML processing instruction not supported (trying to parse instuction name = ${tree.name}, content = ${tree.content}), reverting to text node`
            console.warn(errMes)
            return [new textComponent(originalXML.slice(tree.start, tree.end), errMes, undefined, originalXML.slice(tree.start, tree.end))]
        } else {
            if(!tree.children || !tree.children.length) {
                //base case
                if(tree.type == "text"){
                    return [new textComponent(tree.text, undefined, undefined, tree.text)]
                }
                return this.parse_internal_loader_level_node(originalXML, tree, o, [])
            }
            const deeperParse = tree.children.map((i : any) => this.parse_internal_loader_level(originalXML, i as XMLTree, o)) as nestedTree<component>
            return this.parse_internal_loader_level_node(originalXML, tree, o, deeperParse)
        }
    }

    private recur_flat_tree(tree : nestedTree<component>) : component[]{
        let r = [] as component[];

        tree.forEach(i => {
            if(i instanceof component) r.push(i);
            else r.push(...this.recur_flat_tree(i));
        })

        return r;
    }

    parse(XML : string, o : parseOptions) : nestedTree<component>{
        if(!this.loaded){
            throw `Parser did not finish loading modules, call load() first`;
        }

        const tree = this.parse_internal_lib_level(XML); 
        if(!(tree as XmlElement).children || !(tree as XmlElement).children.length) return [] 
        const parsedTree = (tree as XmlElement).children.map(i => this.parse_internal_loader_level(XML, i as XMLTree, o));

        if(o.flat_parse){
            return this.recur_flat_tree(parsedTree)
        } else return parsedTree
        
    }

    debug_parse(XML: string){
        return this.parse_internal_lib_level(XML)
    }
}

export {
    parser,
    parseOptions,
    loadOptions
}

/*
USAGE

async function main() {
    let p = new parser()
    await p.load(new loadOptions(undefined, ["qpOriginal"]))

    let str = `test numeric: <if type = "number"><numeric> a + b > c </><string> A + B </><string> C + D </></>`
    let str2 = `<string> A + B </><string> C + D </>`
    let str3 = `<string> A + " I am a cat "</>`
    let option = new parseOptions(mode.gameplay, "", [3.115926, -5, 50, "cat", "dog", "horse", "house"], false)
    console.log(`parsing test1: `, p.parse(str, option))
    console.log(`parsing test2: `,p.parse(str2, option))
    console.log(`parsing test3: `,p.parse(str3, option))
    //console.log("debugMode: ", JSON.stringify(p.debug_parse(str), null, 4))
}
*/