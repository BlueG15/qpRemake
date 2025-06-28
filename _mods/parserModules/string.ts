import { component, parserModule, moduleInputObject, parseOptions, mode, textComponent } from '../../types/abstract/parser';

const head_symbol = [
    "<<", ">>", "<", ">", 
    "+", "-", "*",
    "||", "&&",
    "!=", "==",
    "?", "(", "[", "{"
]

const pairedSymbol_head = [
    "(", "[", "{"
]

const pairedSymbol_tail = [
    ")", "]", "}"
]

const triStateSymbol_head = [
    "?"
]

const triStateSymbol_tail = [
    ":"
]

function isLowerCaseCharacter(str : string){
    return (str.length == 1 && str <= 'z' && str >= 'a');
}

function isUpperCaseCharacter(str : string){
    return (str.length == 1 && str <= 'Z' && str >= 'A');
}

function isRawString(str : string){
    return str[0] == "\"" && str.charAt(-1) == "\"";
}

function isValidSymbol(str : string | undefined){
    if(!str) return false;
    if(isLowerCaseCharacter(str)) return true;
    if(isUpperCaseCharacter(str)) return true;
    if(str[0] == "\"" && str[str.length - 1] == "\"") return true;
    if(head_symbol.includes(str) || pairedSymbol_tail.includes(str) || triStateSymbol_tail.includes(str)) return true;
    return false;
}

type tree = [string] | [string, tree, tree] | [string, tree, tree, tree] //3.7 and above feature

/* Parses a symbol Arr to an array of form head left right, except for tristate where its head cond left right */
function treeSplitRecurr(symbolArr : string[]) : tree{
    //tristate section, only ? : for now, prioritizesd
    let splitIndex = symbolArr.findIndex((a) => triStateSymbol_head.includes(a));

    if(splitIndex >= 0){
        let s = symbolArr[splitIndex];
        let k = triStateSymbol_head.indexOf(symbolArr[splitIndex]);
        if(k >= 0){
            let right = symbolArr.slice(splitIndex + 1)
            let splitIndex2 = right.findIndex((a) => triStateSymbol_tail.indexOf(a) == k);
            if(splitIndex2 == -1) throw new Error(`Tail not found for head (tristate) = ${s}`); 
            //throw to immidiately stop recursion
            //someone will kill me for this
            
            
            //returns a tristate [s, condition, left, right]
            return [
                s,
                treeSplitRecurr(symbolArr.slice(0, splitIndex)),
                treeSplitRecurr(right.slice(0, splitIndex2)),
                treeSplitRecurr(right.slice(splitIndex2 + 1))
            ]
        }
    }

    splitIndex = symbolArr.findIndex((a) => head_symbol.includes(a));
    if(splitIndex == -1) {

        if(symbolArr.length != 1)
            throw new Error(`Consecutive symbols that are not head found : '${symbolArr.join(" ")}'`);
        if(triStateSymbol_tail.includes(symbolArr[0]) || pairedSymbol_tail.includes(symbolArr[0]))
            throw new Error("Tail with no head encountered");
        if(!isValidSymbol(symbolArr[0])) 
            throw new Error(`Invalid symbol found : '${symbolArr[0]}'`)
        if(symbolArr[0][0] == "\"" && symbolArr[0][symbolArr[0].length - 1] == "\""){
            symbolArr[0] = symbolArr[0].slice(1, -1).trimEnd()
        }
        return symbolArr as [string] //length check is literally right above
    };
    let s = symbolArr[splitIndex];


    //paired section, mostly brackets
    let k = pairedSymbol_head.indexOf(s);
    if(k >= 0){
        //a paired symbol must follows a head symbol
        //if we reached here and k is not 0, it means preceed the pair was NOT another head symbol
        if(splitIndex != 0) throw new Error(`Pair was not preceed by a head symbol at position ${splitIndex}`);

        //same procedure as the fourstate above, find the tail
        let right = symbolArr.slice(1)
        splitIndex = right.findIndex((a) => pairedSymbol_tail.indexOf(a) == k);
        if(splitIndex == -1) throw new Error(`Tail not found for head (paired) = ${s}`);
        
        //follows the pair end must be another head symbol or end of string
        let leftOver = right.slice(splitIndex + 1);
        let splitIndex2 = leftOver.findIndex((a) => head_symbol.includes(a));
        if(splitIndex2 < 0){
            //end of string
            //return the parses whatever is between the pair
            
            //special case for the "" pair, force the correct for whatever is in the middle
            return treeSplitRecurr(right.slice(0, -1));
        } else {
            if(splitIndex2 != 0) throw new Error(`Tail is not followed by a head symbol (paired) at position not end = ${splitIndex2}`)
            //the pair is followed by another head symbol
            return [
                leftOver[splitIndex2],
                treeSplitRecurr(right.slice(0, splitIndex)),
                treeSplitRecurr(leftOver.slice(1)),
            ]
        }
    }

    let left = symbolArr.slice(0, splitIndex);
    let right = symbolArr.slice(splitIndex + 1);
    let splitIndex2 = right.findIndex((a) => head_symbol.includes(a));
    //technically we dont need to recur left btw, but we do to check for errors
    //since the error code is the base case
    if(splitIndex2 < 0){
        //s is last head symbol, no need comparison
        return [
            s,
            treeSplitRecurr(left),
            treeSplitRecurr(right)
        ] //left right head
    } else {
        let s_priority = head_symbol.indexOf(s);
        let right_priority = head_symbol.indexOf(right[splitIndex2]);
        if(s_priority <= right_priority){
            //right subtree is leave alone
            return [
                s,
                treeSplitRecurr(left),
                treeSplitRecurr(right)
            ]
        } else {
            //do right subtree, then relink
            let right_parsed : any = treeSplitRecurr(right)
            right_parsed[1] = [
                s,
                treeSplitRecurr(left),
                right_parsed[1]
            ]
            return right_parsed
        }
    }
}

function evaluateStringOperation(opCode : string, a : string, b : string) : string{
    switch(opCode){
        case "+":
            return a + b;
        case "-":
            return a.split(b).join("");
        case "*":
            if(isNaN(Number(b))) return a;
            return a.repeat(Number(b));
        
        case "<":
            //pad right
            if(isNaN(Number(b))) return a;
            return a + " ".repeat(Number(b));
        case ">":
            //pad left
            if(isNaN(Number(b))) return a;
            return " ".repeat(Number(b)) + a;
        case "<<":
            //shift left
            if(isNaN(Number(b))) return a;
            return a.slice(Number(b))
        case ">>":
            //shift right
            if(isNaN(Number(b))) return a;
            return a.slice(0, Number(b) * -1)

        case "==":
            return a == b ? a : "";
        case "!=":
            return a != b ? a : "";

        case "&&":
            return (a.length != 0) && (b.length != 0) ? a : "";
        case "||":
            return (a.length != 0) || (b.length != 0) ? a : "";

        default:
            return "";
    }
}

function evaluate_node(node : tree, inputNumber : number[], inputString : string[]) : string{
    if(node.length == 3){
        
        let s1 : string;
        let s2 : string;
        if(node[1].length == 1 || node[2].length == 1){
            if(node[1].length == 1){
                s1 = node[1][0]
                if(isRawString(s1)){
                    s1 = s1.slice(0, -1);
                } else if(isLowerCaseCharacter(s1)) {
                    s1 = (inputNumber[s1.charCodeAt(0) - "a".charCodeAt(0)] ?? "").toString()
                } else if(isUpperCaseCharacter(s1)){
                    s1 = (inputString[s1.charCodeAt(0) - "A".charCodeAt(0)] ?? "").toString()
                }
            } else {
                s1 = evaluate_node(node[1], inputNumber, inputString)
            }


            if(node[2].length == 1){
                s2 = node[2][0]
                if(isRawString(s2)){
                    s2 = s2.slice(0, -1);
                } else if(isLowerCaseCharacter(s2)) {
                    s2 = (inputNumber[s2.charCodeAt(0) - "a".charCodeAt(0)] ?? "").toString()
                } else if(isUpperCaseCharacter(s2)){
                    s2 = (inputString[s2.charCodeAt(0) - "A".charCodeAt(0)] ?? "").toString()
                }
            } else {
                s2 = evaluate_node(node[2], inputNumber, inputString)
            }
        } else {
            s1 = evaluate_node(node[1], inputNumber, inputString)
            s2 = evaluate_node(node[2], inputNumber, inputString)
        }

        return evaluateStringOperation(node[0], s1, s2);

    } else if (node.length == 4){
        let status = evaluate_node(node[1], inputNumber, inputString);
        if(!status.length){
            return evaluate_node(node[3], inputNumber, inputString);
        } else {
            return evaluate_node(node[2], inputNumber, inputString);
        }
    } else return isRawString(node[0]) ? node[0] : node[0].slice(0, -1);
    
}

function merge(symbolArr : string[]){
    let res : string[] = []
    let flag = false;
    symbolArr.forEach(i => {

        if(i.startsWith("\"") && i.endsWith("\"") && i.length != 1){
            res.push(i)
        } else {
            
            if(i.startsWith("\"")) {
                if(flag == false){
                    res.push(i)
                    flag = true;
                } else {
                    if(res.length) res[res.length - 1] += ' ' + i;
                    else res.push(i)
                    flag = false
                }
            } else if(i.endsWith("\"")) {
                if(res.length) res[res.length - 1] += ' ' + i;
                else res.push(i)
                flag = false;
            } else {
                if(flag) {
                    if(res.length) res[res.length - 1] += " " + i;
                    else res.push(i)
                } else {
                    res.push(i)
                }
            }
        }
    })
    return res
}

export default class stringParseModule extends parserModule {

    override cmdName = ['string'];
    override requiredAttr = [["expr"]];
    override doCheckRequiredAttr = false;

    override evaluate(cmd : string, args: moduleInputObject, option: parseOptions, raw : string): [] | [textComponent]{
        let expr = args.getAttr("expr");
        if(!expr) expr = this.try_grab_child_text(args);
        if(!expr) return []

        expr = expr.trim()

        let arr : tree
        try{
            // console.log(`premerge: `, expr.split(" "))
            // console.log(`postmerge: `, merge(expr.split(" ")))
            arr = treeSplitRecurr(merge(expr.split(" ")))
        } catch(a : any) {
            return [new textComponent(
                (option.mode == mode.debug) ? "Cannot parsed" : "", a.message, cmd, raw
            )]
        }

        let res : string
        try{
            res = evaluate_node(arr, option.inputNumber, option.inputString);
        } catch(a : any) {
            return [new textComponent(
                (option.mode == mode.debug) ? "Cannot parsed" : "", a.message, cmd, raw
            )]
        }

        return [new textComponent(
            res, undefined, cmd, raw
        )]
    }
}


