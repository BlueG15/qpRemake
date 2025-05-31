import { mod, moduleInputObject, parseOptions, numberComponent } from '../../types/abstract/parser';
// type nestedTree<T> = T[] | nestedTree<T>[]

const head_symbol = [
    "<=", ">=", "<", ">", "!=", "==",
    "||", "&&",
    ".", "+", "-", "*", "/",
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

function isValidSymbol(str : string | undefined){
    if(!str) return false;
    if(isLowerCaseCharacter(str)) return true;
    if(!isNaN(Number(str))) return true;
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

function evaluateNumericOperation(opCode : string, a : number, b : number) : number{
    switch(opCode){
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            return a / b;
        case ".":
            let precision = 10 ** b;
            return Math.round(a * precision) / precision;
        
        case "<":
            return a < b ? 1 : 0;
        case ">":
            return a > b ? 1 : 0;
        case "==":
            return a == b ? 1 : 0;
        case "!=":
            return a != b ? 1 : 0;
        case "<=":
            return a <= b ? 1 : 0;
        case ">=":
            return a >= b ? 1 : 0;

        case "&&":
            return (a != 0) && (b != 0) ? 1 : 0;
        case "||":
            return (a != 0) || (b != 0) ? 1 : 0;

        default:
            return NaN;
    }
}

function evaluate_node(node : tree, inputArr : number[]) : number{
    if(node.length == 3){
        if(node[1].length == 1 && node[2].length == 1){
            let num1 = isNaN(Number(node[1][0])) ? (inputArr[node[1][0].charCodeAt(0) - 'a'.charCodeAt(0)] ?? NaN): Number(node[1][0]);
            let num2 = isNaN(Number(node[2][0])) ? (inputArr[node[2][0].charCodeAt(0) - 'a'.charCodeAt(0)] ?? NaN): Number(node[2][0]);
            return evaluateNumericOperation(node[0], num1, num2);
        }

        if(node[1].length == 1){
            let num1 = isNaN(Number(node[1][0])) ? (inputArr[node[1][0].charCodeAt(0) - 'a'.charCodeAt(0)] ?? NaN): Number(node[1][0]);
            let num2 = evaluate_node(node[2], inputArr);
            return evaluateNumericOperation(node[0], num1, num2);
        }

        if(node[2].length == 1){
            let num1 = evaluate_node(node[1], inputArr);
            let num2 = isNaN(Number(node[2][0])) ? (inputArr[node[2][0].charCodeAt(0) - 'a'.charCodeAt(0)] ?? NaN) : Number(node[2][0]);
            return evaluateNumericOperation(node[0], num1, num2);
        }

        let num1 = evaluate_node(node[1], inputArr);
        let num2 = evaluate_node(node[2], inputArr);
        return evaluateNumericOperation(node[0], num1, num2);
    } else if (node.length == 4){
        let status = evaluate_node(node[1], inputArr);
        if(status == 0){
            return evaluate_node(node[3], inputArr);
        } else {
            return evaluate_node(node[2], inputArr);
        }
    } else return Number(node[0])
    
}

/* Usage:
let str = "a > b ? ( [ 500.7 + b ] * c ) . 2 : a + b * c"
let input = [10, 2, 3.145]
console.log(`expr = ${str}\nEvaluated at [a, b, c, ...] = ${JSON.stringify(input, null, 0)}`)
console.log(`expr evauated to: ${evaluate(str, input)}`) */


//numeric module takes in an expression an array of numbers
//returns a number, NaN if parse fails
export default class numericModule extends mod {

    override cmdName = ['numeric'];
    override requiredAttr = [["expr"]];
    override doCheckRequiredAttr = false;

    override evaluate(cmd : string, args: moduleInputObject, option: parseOptions, raw : string): [] | [numberComponent] {
        let expr = args.getAttr("expr");
        if(!expr) expr = this.try_grab_child_text(args);
        if(!expr) return []

        expr = expr.trim()

        let arr : tree
        try{
            arr = treeSplitRecurr(expr.split(" "))
        } catch(a : any) {
            return [new numberComponent(
                NaN, a.message, cmd, raw
            )]
        }

        let res : number
        try{
            res = evaluate_node(arr, option.inputNumber);
        } catch(a : any) {
            return [new numberComponent(
                NaN, (a as Error).message, cmd, raw
            )]
        }

        return [new numberComponent(
            res, undefined, cmd, raw
        )]
    }
}


