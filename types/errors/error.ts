import actionRegistry from "../../data/actionRegistry";
import { Action_class, actionConstructionObj_fixxed, actionFormRegistry, getDefaultObjContructionObj } from "../../_queenSystem/handler/actionGenrator";
//actions by default are NOT valid to listen to, they r just there

class debugInfo {
    file: string
    func: string
    line: number
    constructor(file: string, func: string = "", line: number = -1){
        this.file = file;
        this.line = line;
        this.func = func;
    }
    toString(){
        let str = 'file: ' + this.file;
        if(this.func.length) str += ", function: " + this.func;
        if(this.line >= 0) str += ", line: " + this.line;
        return str;
    }
}

class error extends Action_class<[], never, {}>  {
    messege : string = "";
    callStack : debugInfo[] = []; //larger index = higher hierachy

    cardID : string | undefined

    constructor(cardID? : string){
        let o = getDefaultObjContructionObj(actionRegistry.error);
        let o2 : actionConstructionObj_fixxed = {
            ...o,
            cause : actionFormRegistry.system(),
            targets : []
        }
        super(o2);
        this.cardID = cardID
    }
    add(file : string, func? : string, line? : number){
        this.callStack.push(new debugInfo(file, func, line));
        return this
    }
    override toString(){
        return 'Error: ' + this.messege + '\nAt\n' + this.callStack.map(i => i.toString()).join("\n")
    };
}
   
export default error