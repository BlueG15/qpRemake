//lib import
import { parseXml } from '@rgrove/parse-xml';
import { XmlProcessingInstruction, XmlElement } from '@rgrove/parse-xml'

import { DisplayComponent, TextComponent } from "./component";
import { ParserModule } from "./parser-module";
import type { LoadOptions, ParseOptions } from "./options";
import type { nestedTree } from "../../../core";

type XMLTree =  XmlProcessingInstruction | XmlElement

const lib_parse_option = {
    preserveComments : false,
    preserveXmlDeclaration : false,
    preserveDocumentType: false,
    ignoreUndefinedEntities: false,
    includeOffsets: true,
    sortAttributes: false,
    preserveCdata: false,
}

/**
 * TODO : I dont like this current parser
 * Its too cumbersome and maybe overkill for qp
 * Idk, I wanted an extendable option
 * but is extendable worth it?
 */

export class Parser {
    private loaded = false;
    private moduleArr : ParserModule[] = []
    private moduleMap : Map<string, [number, number]> = new Map()
    //[module index, command index]

    //
    async load(l : LoadOptions){
        let path = l.modulePath
        if(!path.endsWith("/")) path += "/";
        // console.log(`load triggered, ab to load ${l.modulesInUse.length} modules`)
        for(let x = 0; x < l.modulesInUse.length; x++){
            let i = l.modulesInUse[x]
            //start dynamic importing
            let moduleClass = await import(path + i);
            if(!moduleClass || !moduleClass.default){
                console.warn(`WARN: Cannot import module ${i} in path ${path + i}`);
            } else {
                let moduleInstance = new moduleClass.default() as ParserModule
                
                //test malformed module
                if(!(moduleInstance instanceof ParserModule)){
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
                        // console.log(`loaded cmd ${n} from module ${i}`)
                    })
                    
                }
            }
        }
        this.loaded = true;
    }

    private parse_internal_lib_level(str : string, inRecur = false, escapedCharLimit = str.length) : XMLTree{
        if(!inRecur){
            str = `<document>${str}</document>`; //if i dont do this, it doesnt work
        }

        try{
            //the lib wraps everything in a layer so we need to extract that layer
            return parseXml(str, lib_parse_option).children[0] as XMLTree
        } catch(err : any){
            
            if( 
                err.message.startsWith("Missing end tag")
            ){
                let temp = err.message.indexOf("(line");
                if(temp == -1) throw err;
                let cTag = err.message.slice(28, temp-1);

                let pre = str.slice(0, err.pos);
                let post = str.slice(err.pos + 1)

                const properClose = `</${cTag}>`
                const properOpen = `<${cTag}>`

                //situation patchfix 1: allowing </> as a universal end tag
                //by repllacing </> with the proper close tag 
                const flag1 = str.slice(err.pos, err.pos + 3) === "</>"
                
                if(flag1){
                    post = str.slice(err.pos + 3);
                    return this.parse_internal_lib_level(pre + properClose + post, true, escapedCharLimit); //reparse
                }
                
                const errorChar = str[err.pos]
                if(errorChar){
                    const escapedChar = `&#${errorChar.charCodeAt(0)};`
                    
                    //situation patchfix 2: escape the character that fails to parse
                    //try replacing the problematic character with its XML entity
                    if(escapedCharLimit <= 0) throw err
                    return this.parse_internal_lib_level(pre + escapedChar + post, true, escapedCharLimit - 1)
                }    
            }

            throw err
        }
    }


    private parse_internal_loader_level_node(originalXML : string, tree : XmlElement, o : ParseOptions, children: nestedTree<DisplayComponent>) : nestedTree<DisplayComponent>{
        const cmd = tree.name
        if(this.moduleMap.has(cmd)){
            const [moduleIndex, cmdIndex] = (this.moduleMap.get(cmd) as [number, number])
            const module = this.moduleArr[moduleIndex]
            const inputObj = module.generateInputObj(cmdIndex, tree.attributes, children)

            if(!inputObj){
                //incorrect input
                const errMes = `Failed to parse input for module ${cmd}, tried to parse attributes: ${JSON.stringify(tree.attributes, null, 0)}, required attributes = ${JSON.stringify(module.requiredAttr[cmdIndex], null, 0)}, reverting to text node`
                //console.warn(errMes)
                return [new TextComponent(tree.text, errMes, cmd, tree.text)]
            }

            return module.evaluate(cmd, inputObj, o, tree.text)

        } else {
            const errMes = `WARN: unknown module, tried to invoke ${cmd}, reverting to a text node`
            // console.warn(errMes)
            return [new TextComponent(tree.text, errMes, cmd, tree.text)]
        }
    }

    private parse_internal_loader_level(originalXML : string, tree : XMLTree, o : ParseOptions) : nestedTree<DisplayComponent>{
        if(tree instanceof XmlProcessingInstruction){
            //undefined behavior?
            //idk what this shit is???
            const errMes = `WARN: XML processing instruction not supported (trying to parse instuction name = ${tree.name}, content = ${tree.content}), reverting to text node`
            // console.warn(errMes)
            return [new TextComponent(originalXML.slice(tree.start, tree.end), errMes, undefined, originalXML.slice(tree.start, tree.end))]
        } else {
            if(!tree.children || !tree.children.length) {
                //base case
                if(tree.type == "text"){
                    return [new TextComponent(tree.text, undefined, undefined, tree.text)]
                }
                return this.parse_internal_loader_level_node(originalXML, tree, o, [])
            }
            const deeperParse = tree.children.map((i : any) => this.parse_internal_loader_level(originalXML, i as XMLTree, o)) as nestedTree<DisplayComponent>
            return this.parse_internal_loader_level_node(originalXML, tree, o, deeperParse)
        }
    }

    private recur_flat_tree(tree : nestedTree<DisplayComponent>) : DisplayComponent[]{
        let r = [] as DisplayComponent[];

        tree.forEach(i => {
            if(i instanceof DisplayComponent) r.push(i);
            else r.push(...this.recur_flat_tree(i));
        })

        return r;
    }
    private equationRegex(
        prefixOperator: string[],
        inFixOperator: string[],
        postFixOperator: string[],
        elementRegex: RegExp,
        prefix: string,
        postfix?: string
    ): RegExp {
        const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Operators
        const preOps = prefixOperator.length ? `(?:${prefixOperator.map(escape).join("|")})?` : "";
        const inOps = inFixOperator.length ? `(?:${inFixOperator.map(escape).join("|")})` : "";
        const postOps = postFixOperator.length ? `(?:${postFixOperator.map(escape).join("|")})?` : "";

        // Base element core
        const elemCore = elementRegex.source;

        // Bracketed sub-expressions
        const bracketed = [
            `\\(${elemCore}(?:\\s*${inOps}\\s*${elemCore})*\\)`,
            `\\[${elemCore}(?:\\s*${inOps}\\s*${elemCore})*\\]`,
            `\\{${elemCore}(?:\\s*${inOps}\\s*${elemCore})*\\}`
        ].join("|");

        // Base element (prefix/postfix supported)
        const elem = `${preOps}(?:${elemCore}|${bracketed})${postOps}`;

        // Ternary expression form
        const ternary = `${elem}\\s*\\?\\s*${elem}\\s*:\\s*${elem}`;

        // Combined atomic unit: an element or a ternary expression
        const atomic = `(?:${ternary}|${elem})`;

        // Equation body (chain of atomic units with infix ops)
        const body = `${atomic}(?:\\s*${inOps}\\s*${atomic})*`;

        // Boundaries
        const start = `(?:${escape(prefix)})`;
        const end = postfix ? `(?:${escape(postfix)})` : "";

        return new RegExp(`${start}\\s*(${body})\\s*${end}`, "g");
    }
    private elementRegex = /[A-Za-z0-9]|".*"/
    private operationList_infix = [
        "==", "===",
        "!=", "!==",

        ">", "<",
        ">=", "<=",

        "&&", "&",
        "||", "|", 

        ">>", "<<",

        "++", 
        "+", "-", "*", "/", 
        ".."
    ]
    private operationList_prefix = [
        "!", "+", "-"
    ]

    private preparse_regs = [
        /=\s*([A-Za-z0-9]+)\s*;?/g, //=ABC...
        this.equationRegex(this.operationList_prefix, this.operationList_infix, [], this.elementRegex, "=", ";")
    ]

    private preParseXML(XML: string, o : ParseOptions) {
        //shorthand for expr
        const [reg1, reg2] = this.preparse_regs;

        const segments: string[] = [];  // ordered pieces of the final output
        let lastIndex = 0;

        // Scan for all reg2 matches
        XML.replace(reg2, (match, group, offset) => {
            // Unprotected text before this reg2 match
            if (offset > lastIndex) {
                const chunk = XML.slice(lastIndex, offset);
                segments.push(this.applyReg1(chunk, reg1));
            }

            segments.push(`<expr> ${group} </>`);

            lastIndex = offset + match.length;
            return ""; // not used
        });

        // Remainder after last reg2 match
        if (lastIndex < XML.length) {
            const chunk = XML.slice(lastIndex);
            segments.push(this.applyReg1(chunk, reg1));
        }

        let res = segments.join("");

        //variable injection
        //{n} -> replaced with variable index n

        res = res.replace(/{(\d+)}/g, (s, n) => {
            const number = Number(n)
            if(isNaN(number)) return s;
            return String(o.input[number])
        })

        return res
    }

    // Apply reg1 only to normal text (NOT inside reg2 results)
    private applyReg1(text: string, reg1: RegExp): string {
        return text.replace(reg1, (_, str) =>
            str
                .split("")
                .map((c : string) => `<expr> ${c} </>`)
                .join("")
        );
    }

    parse(XML : string, o : ParseOptions) : DisplayComponent[] {
        if(!this.loaded){
            throw `Parser did not finish loading modules, call load() first`;
        }

        //replace shorthands with actual tags
        //=abc...
        //and do variable substitution
        XML = this.preParseXML(XML, o)

        let tree
        try{
            tree = this.parse_internal_lib_level(XML); 
        }catch(e) {
            return [new TextComponent(XML, "Failed to parse XML")]
        }

        if(!(tree as XmlElement).children || !(tree as XmlElement).children.length) return [] 
        const parsedTree = (tree as XmlElement).children.map(i => this.parse_internal_loader_level(XML, i as XMLTree, o));

        
        return this.recur_flat_tree(parsedTree)
    }
}

/**
 * Added shorthands:
 * =abcABC... : prints out the value of a, b, c, A, B, C...
 * = a + 1 + A : do the expression
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