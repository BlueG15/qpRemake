import action from "../baseClass/action"
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

class error extends action {
    messege : string = "";
    callStack : debugInfo[] = []; //larger index = higher hierachy
    constructor(cardID? : string){
        super("error", true, cardID);
        this.canBeChainedTo = false;
        this.canBeTriggeredTo = false;
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