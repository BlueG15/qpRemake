function evaluateNumberOperation(opCode : string, a : number, b : number) : number{
    switch(opCode){
        case "!=" :
            return a !== b ? 1 : 0
        case "==" :
            return a === b ? 1 : 0
        case "<" :
            return a < b ? 1 : 0
        case ">" :
            return a > b ? 1 : 0
        case ">=" :
            return a >= b ? 1 : 0
        case "<=" :
            return a <= b ? 1 : 0

        case "&&" :
            return (a !== 0) && (b !== 0) ? 1 : 0
        case "||" :
            return (a !== 0) || (b !== 0) ? 1 : 0

        case "+" :
            return a + b
        case "-" :
            return a - b
        case "*" :
            return a * b
        case "/":
            return a / b
        case ">>" :
            return a >> b
        case "<<" :
            return a << b
        case "..":
            let precision = 10 ** b;
            return Math.round(a * precision) / precision;
        
        default : return NaN
    }
}

const trueSring = "_"
const falseString = ""

function evaluateStringOperation(opCode : string, a : string, b : string) : string {
    switch(opCode){
        case "!=" :
            return a !== b ? trueSring : falseString
        case "==" :
            return a === b ? trueSring : falseString
        case "<" :
            return a < b ? trueSring : falseString
        case ">" :
            return a > b ? trueSring : falseString
        case ">=" :
            return a >= b ? trueSring : falseString
        case "<=" :
            return a <= b ? trueSring : falseString

        case "&&" :
            return (a.length !== 0) && (b.length !== 0) ? trueSring : falseString
        case "||" :
            return (a.length !== 0) || (b.length !== 0) ? trueSring : falseString

        case ">>" :
        case "<<" :
        case "*" :
        case "++":
        case "+" :
            return a + b
        case "/":
        case "-" :
            return a.split(b).join("");
        case "..":
            return a + " " + b
        
        default : return `<err invalid opcode = ${opCode}>, a = ${a}, b = ${b}`
    }
}

function isNumber(str : string | number){
    return !isNaN(Number(str))
}

class evaluate_element {

    private _isNum;
    private _isStr;
    private x : number | string;

    get isNum(){
        return this._isNum
    }

    get isStr(){
        return this._isStr
    }

    constructor(
        x : string | number,
        num_var : number[],
        string_var : string[],
    ){
        let isNum = isNumber(x)

        // variable substitution
        if(!isNum){
            const char = String(x)
            if(char.length === 1){
                const cc = char.charCodeAt(0)
                let a = "a".charCodeAt(0)
                let z = "z".charCodeAt(0)
                let charCode = cc - a

                if(
                    charCode <= z && charCode >= 0
                    && num_var[charCode] !== undefined
                ){
                    isNum = true
                    x = num_var[charCode]
                } else {
                    a = "A".charCodeAt(0)
                    z = "Z".charCodeAt(0)
                    charCode = cc - a

                    if(
                        charCode <= z && charCode >= 0
                        && string_var[charCode] !== undefined
                    ){
                        x = string_var[charCode]
                    }
                }
            }
        }

        this._isNum = isNum
        this._isStr = !isNum
        this.x = x

        // console.log("x:", this.x, "isNumber:", isNum)
    }

    get num(){
        if(this.isStr) this.x = (this.x as string).length
        return Number(this.x)
    }

    get str(){
        return String(this.x)
    }

    get bool(){
        return this.x == 0 //== is intentional to convert both 0 and "" to true
    }
}

function evaluateOperation(
    opCode : string, 
    x : string | number, y : string | number,
    num_var : number[],
    string_var : string[],
) : string | number{
    const a = new evaluate_element(x, num_var, string_var)
    const b = new evaluate_element(y, num_var, string_var)

    //return `[${a.isNum ? "num" : "str"}, ${x}][${b.isNum ? "num" : "str"}, ${y}]`

    if(a.isNum && b.isNum) return evaluateNumberOperation(opCode, a.num, b.num);
    if(a.isStr && b.isStr) return evaluateStringOperation(opCode, a.str, b.str);

    //the switch below hadles string, num or num, string
    switch(opCode){
        case "!=" :
        case "==" :
        case "<" :
        case ">" :
        case ">=" :
        case "<=" : {
            x = a.num
            y = b.num
            return evaluateNumberOperation(opCode, x, y)
        }

        case "&&" :
            return a.bool && b.bool ? 1 : 0
        case "||" :
            return a.bool || b.bool ? 1 : 0

        case ">>" : {
            if(a.isStr) {
                return a.str.slice(b.num)
            }
        }
        case "<<" : {
            if(a.isStr){
                return a.str.slice(0, b.num * -1)
            }

            //num >> string
            return evaluateNumberOperation(opCode, a.num, b.num)
        }

        case "++" : return a.str + b.str

        case "+" :
        case "-" :
            return a.isNum //first param authoritativee
            ? evaluateNumberOperation(opCode, a.num, b.num)
            : evaluateStringOperation(opCode, a.str, b.str)

        case "*" :
            return a.isNum 
            ? evaluateNumberOperation(opCode, a.num, b.num)
            : a.str.repeat(b.num)

        case "/": {
            if(a.isStr){
                const len = a.str.length
                const finalLen = Math.floor(len / b.num)
                return a.str.slice(0, finalLen)
            }

            return evaluateNumberOperation(opCode, a.num, b.num)
        }

        case "..":
            return a.isNum
            ? evaluateStringOperation(opCode, a.str, b.str)
            : b.str.slice(0, a.num)

        default : return `<err, invalid opcode : ${opCode}>, x = ${x}, y = ${y}`
    }
}


interface I_evaluator {
    evaluate_unary(expr : UnaryExpression) : Expression;
    evaluate_binary(expr : BinaryExpression) : Expression;
    evaluate_ternary(expr : TernaryExpression) : Expression;
    evaluate_postfix(expr : PostfixExpression) : Expression;
    evaluate_value(expr : ValueExpression) : Expression;
}

class Expression {
    constructor(
        public operator : Token, 
        public operands : Expression[],
    ){}
    get numOperands() {return this.operands.length}

    toString() : string {
        if(this.operator.type === TokenType.EOF) return "[EOF]";

        let res : string;

        if(this.operator.type === TokenType.immutable){
            res = `immutable.[]`
        } else res = `op.[${this.operator.str}]`

        if(this.numOperands){
            res += "{\n"
            this.operands.flatMap(o => o.toString().split("\n")).forEach(str => {
                res += `    ` + str + "\n"
            })
            res += "}\n"
        }
        return res
    }

    protected get collapsible() : boolean {
        return this.operands.every(k => k instanceof ValueExpression)
    }

    evaluate(evaluator : I_evaluator) : [Expression, boolean] {
        // console.log(`Evaluating ${this.toString().slice(0, 50).replaceAll("\n", "")}`)
        if(!this.collapsible){
            let hasChanged = true
            while(hasChanged && !this.collapsible){
                this.operands = this.operands.map(op => {
                    if(!op) {
                        throw new Error(`Operand has undef operator for some reason???, evaluating operator: ${this.operator.str}`)
                    } 
                    const [newOperand, a] = op.evaluate(evaluator);
                    hasChanged = a
                    return newOperand
                })
            }
        }
        if(this instanceof UnaryExpression) return [evaluator.evaluate_unary(this), true];
        if(this instanceof BinaryExpression) return [evaluator.evaluate_binary(this), true];
        if(this instanceof TernaryExpression) return [evaluator.evaluate_ternary(this), true];
        if(this instanceof PostfixExpression) return [evaluator.evaluate_postfix(this), true];
        if(this instanceof ValueExpression) return [evaluator.evaluate_value(this), true];  

        return [this, false]
    }
}


class ValueExpression extends Expression {
    constructor(val : Token){
        super(val, [])
    }
}


class ValueWithImmutableAttachedExpression extends ValueExpression {
    constructor(expression : Expression, public immutable_token : Token, public attachedAtEnd = true){
        super(expression.operator)
    }
}

class ParsedValue extends ValueExpression {}
class ParsedValueWithImmutable extends ValueWithImmutableAttachedExpression {}

class UnaryExpression extends Expression {
    constructor(operator : Token, operand : Expression){
        super(operator, [operand])
    }
}

class BinaryExpression extends Expression {
    get left(){return this.operands[0]}
    get right(){return this.operands[1]}
    constructor(operator : Token, left : Expression, right : Expression){
        super(operator, [left, right])
    }
}

class TernaryExpression extends Expression {
    get cond(){return this.operands[0]}
    get left(){return this.operands[1]}
    get right(){return this.operands[2]}
    constructor(operator : Token, cond : Expression, left : Expression, right : Expression){
        super(operator, [cond, left, right])
    }
}

class PostfixExpression extends Expression {
    constructor(operator : Token, left : Expression){
        super(operator, [left])
    }
}

enum TokenType {

    //immutable is specicial, 
    //for keeping refs in the expression tree

    immutable,

    //value

    value_number,
    value_string,

    //comparison and boolean logic

    equals,
    not_equals,
    lesser,
    greater,
    lesser_or_equal,
    greater_or_equal,

    negation,
    or,
    and,

    
    //binary operator

    shift_left,
    shift_right,

    plus,
    minus,
    mul,
    div,

    slice_or_round_to_precision, //..
    forced_concat,

    //all brackets are the same, we arent concern with accuracy too much here
    bracket_open, 
    bracket_end,

    question_mark,
    colon,

    EOF,
}

enum StringEncapsulation {
    double_quote = -100, 
    single_quote,
    tick_mark,
}

class Token {
    constructor(
        public readonly type : TokenType, 
        public readonly str : string,
        public immutable? : any
    ){}
}

interface I_Parser {
    pop() : Token | undefined
    peek() : Token | undefined

    assertNext(type : TokenType) : void; 

    nextPrecedence() : number

    next(precedence : number) : Expression
}

interface I_ParseRule_No_Pre {
    parse(parser : I_Parser, token : Token) : Expression
}

interface I_ParseRule_Has_Pre {
    parse(parser : I_Parser, left : Expression, token : Token) : Expression
    get precedence() : number;
}

class Parser implements I_Parser, I_evaluator {
    // --- Tokenizing section --- //
    private TokenDictionary = new Map<string, TokenType | StringEncapsulation>()
    private allTokens : string[]

    constructor(){
        this.addToken("+", TokenType.plus)
        this.addToken("-", TokenType.minus)
        this.addToken("*", TokenType.mul)
        this.addToken("/", TokenType.div)

        this.addToken("(", TokenType.bracket_open)
        this.addToken("[", TokenType.bracket_open)
        this.addToken("{", TokenType.bracket_open)

        this.addToken(")", TokenType.bracket_end)
        this.addToken("]", TokenType.bracket_end)
        this.addToken("}", TokenType.bracket_end)

        this.addToken("?", TokenType.question_mark)
        this.addToken(":", TokenType.colon)
        
        this.addToken(`"`, StringEncapsulation.double_quote)
        this.addToken("'", StringEncapsulation.single_quote)
        this.addToken("`", StringEncapsulation.tick_mark)
        
        this.addToken("!", TokenType.negation)
        this.addToken("==", TokenType.equals)
        this.addToken("===", TokenType.equals)
        this.addToken("!=", TokenType.not_equals)
        this.addToken("!==", TokenType.not_equals)

        this.addToken("<", TokenType.lesser)
        this.addToken(">", TokenType.greater)
        this.addToken("<=", TokenType.lesser_or_equal)
        this.addToken(">=", TokenType.greater_or_equal)

        this.addToken("&&", TokenType.and)
        this.addToken("&", TokenType.and)
        this.addToken("||", TokenType.or)
        this.addToken("|", TokenType.or)

        this.addToken("<<", TokenType.shift_left)
        this.addToken(">>", TokenType.shift_right)

        this.addToken("..", TokenType.slice_or_round_to_precision)

        this.addToken("++", TokenType.forced_concat)

        this.allTokens = Array.from(this.TokenDictionary.keys()).sort((a, b) => b.length - a.length)
    }

    addToken(str : string, type : TokenType | StringEncapsulation){
        this.TokenDictionary.set(str, type)
    }

    private splitAndInsert(str : string, splitPoint : string){
        const splitted = str.split(splitPoint)
        const res : [string, boolean][] = [[splitted[0], false]] //[str, locked], if locked, its not splittable further
        for(let i = 1; i < splitted.length; i++){
            res.push([splitPoint, true])
            res.push([splitted[i], false])
        }
        return res
    }

    private splitStringByTokens(expr : string){
        let stack : [string, boolean][] = [[expr, false]] //[str, locked], if locked, its not splittable further
        this.allTokens.forEach(token => {
            stack = stack.flatMap(
                str => str[1] ? [str] : this.splitAndInsert(str[0], token)
            )
        })
        return stack.map(k => k[0])
    }

    tokenize(expr : string | (string | any)[], coerseUnknownToString = true){
        if(typeof expr === "string") expr = [expr]
        const tokens = expr.flatMap(e => typeof e === "string" ? this.splitStringByTokens(e) : e)
        const res : Token[] = []

        let currentStringBracket : StringEncapsulation | undefined = undefined
        let currString = ""

        tokens.forEach(token => {

            if(typeof token !== "string") {
                res.push(new Token(TokenType.immutable, "", token))
                return;
            }

            const token_trimed = token.trim()

            const mapped = this.TokenDictionary.get(token_trimed)

            if(mapped !== undefined && mapped < 0){
                if(currentStringBracket === mapped) { 
                    //close string encapsulation
                    if(currString) res.push(new Token(TokenType.value_string, currString));
                    currString = ""
                    currentStringBracket = undefined
                } else {
                    //open string encapsulation
                    currentStringBracket = mapped as StringEncapsulation
                }
                return
            } else if(currentStringBracket !== undefined){
                //push to string
                currString += token
                return
            }

            token = token_trimed
            if(!token) return;
            
            if(mapped === undefined){
                //counts as string or number
                if(isNaN(Number(token))){
                    if(coerseUnknownToString) res.push(new Token(TokenType.value_string, token));
                    else throw Error(`Unknown token : ${token}`)
                } else {
                    res.push(new Token(TokenType.value_number, token))
                }
            } else {
                //registered token
                res.push(new Token(mapped as TokenType, token))
            }
        })

        res.push(new Token(TokenType.EOF, "EOF"))

        return res
    }

    // --- Parsing section --- //
    // Parsing is done using pratt //

    private preparse_rule = new Map<TokenType, I_ParseRule_No_Pre>()
    private normal_rule = new Map<TokenType, I_ParseRule_Has_Pre>()

    registerUnaryRule(token : TokenType){
        return this.registerRule(true, token, new Parse_rule_unary())
    }

    registerBinaryRule(token : TokenType, precedence : Precedence){
        return this.registerRule(false, token, new Parse_rule_binary(precedence))
    }

    registerValueRule(token : TokenType){
        return this.registerRule(true, token, new Parse_rule_value())
    }

    registerRule(noPre : true,  token : TokenType, rule : I_ParseRule_No_Pre) : void;
    registerRule(noPre : false, token : TokenType, rule : I_ParseRule_Has_Pre) : void;
    registerRule(noPre : boolean, token : TokenType, rule : any){
        if(noPre) this.preparse_rule.set(token, rule);
        else this.normal_rule.set(token, rule)
    }

    private tokens : Token[] = [new Token(TokenType.EOF, "")]

    //return next token
    pop(expect? : TokenType) : Token | undefined {
        const res = this.tokens.splice(0, 1)[0]
        if(expect !== undefined && (!res || res.type !== expect)){
            //unmatched
            throw new Error(`Expected token failed, expect ${expect}, got ${res ? res.type : "<undef>"}`)
        }
        return res
    }

    assertNext(type: TokenType): void {
        this.pop(type)
    }

    peek() : Token| undefined {
        return this.tokens.at(0)
    }

    nextPrecedence() {
        const nextToken = this.peek()
        if(!nextToken) return Precedence.min

        const nextInfix = this.normal_rule.get(nextToken.type)
        if(!nextInfix) return Precedence.min

        return nextInfix.precedence
    }

    private errorStr(token : Token){
        return `token ${token.str} of type ${token.type}`
    }

    parse(expr : Parameters<typeof this["tokenize"]>[0]){
        this.tokens = this.tokenize(expr)

        //parse - single
        // const res = this.next()
        // if(this.peek()){
        //     console.warn(`Tree not exhausted`)
        // }
        // return res

        //parse until exhausted
        const res : Expression[] = []
        while(this.peek()){
            const n = this.next()
            if(n) res.push(n)
        }
        return res
    }

    //when precence of an infix notation dros below base, we stop
    next(basePrecedence = Precedence.min) : Expression {
        let currToken = this.pop()
        if(!currToken || currToken.type === TokenType.EOF) return new ValueExpression(new Token(TokenType.EOF, ""));

        const currPreParseRule = this.preparse_rule.get(currToken.type)
        if(!currPreParseRule) throw new Error(`Failed to parse, no parse rule for ${this.errorStr(currToken)}`)

        let left = currPreParseRule.parse(this, currToken);

        while(basePrecedence < this.nextPrecedence()){
            currToken = this.pop()
            if(!currToken || currToken.type === TokenType.EOF) return new ValueExpression(new Token(TokenType.EOF, ""));

            let currNormalRule = this.normal_rule.get(currToken.type)
            if(!currNormalRule) break;

            left = currNormalRule.parse(this, left, currToken)
        }
        return left
    }


    // --- Evaluation section --- //
    // --- bound variable substituion --- //
    private num_var : number[] = []
    private string_var : string[] = []
    bindVariables(num_var : number[], string_var : string[]){
        this.num_var = num_var
        this.string_var = string_var
    }

    evaluate_value(expr : ValueExpression): Expression {
        if(expr.operator.type === TokenType.EOF) return expr;
        if(expr instanceof ParsedValue || expr instanceof ParsedValueWithImmutable) return expr;
        const r = (new evaluate_element(expr.operator.str, this.num_var, this.string_var))
        const str = r.str
        const v = new ParsedValue(
            new Token(
                r.isNum ? TokenType.value_number : TokenType.value_string,
                str,
            )
        )
        if(expr instanceof ValueWithImmutableAttachedExpression){
            return new ParsedValueWithImmutable(
                v, expr.immutable_token, expr.attachedAtEnd
            )
        }
        return v
    }

    evaluate_unary(expr: UnaryExpression): Expression {
        const op = expr.operator
        const operand = expr.operands[0]

        const type = operand.operator.type
        const str = operand.operator.str
        
        switch(op.type){
            case TokenType.immutable : {
                return new ValueWithImmutableAttachedExpression(operand, op, false)
            }
            case TokenType.plus : return operand;
            case TokenType.minus : {
                return new ValueExpression(
                    new Token(
                        type,
                        type === TokenType.value_string ? str : (str.startsWith("-") ? str.slice(1) : "-" + str),
                    )
                )
            }
            case TokenType.negation : {
                return new ValueExpression(
                    new Token(
                        TokenType.value_number,
                        (str === "0") ? "1" : "0"
                    )
                )
            }
        }

        throw new Error(`Unexpected unary token type, got ${op.type}`)
    }

    evaluate_binary(expr : BinaryExpression) : Expression {
        const op = expr.operator
        const left = expr.left.operator
        const right = expr.right.operator

        const l = left.type === TokenType.value_number ? Number(left.str) : left.str
        const r = right.type === TokenType.value_number ? Number(right.str) : right.str

        const val = evaluateOperation(op.str, l, r, this.num_var, this.string_var)
        // console.log(`Parsing ${l} ${op.str} ${r} = ${val}`)

        const res =  new ValueExpression(new Token(
            typeof val === "number" ? TokenType.value_number : TokenType.value_string,
            String(val)
        ))
        return res
    }
    
    evaluate_ternary(expr : TernaryExpression) : Expression {
        const cond = expr.cond
        if(cond.operator.str == "0"){
            //false
            return expr.right
        } else {
            //true
            return expr.left
        }
    }

    evaluate_postfix(expr : PostfixExpression) : Expression {
        //only pst fix rn is immutable post fix
        return new ValueWithImmutableAttachedExpression(expr.operands[0], expr.operator)

    }

    flattenExpressions<T>(exprs : Expression[]) : (string | T)[] {
        let res : any[] = []
        exprs.forEach(expr => {
            if(expr instanceof ValueWithImmutableAttachedExpression){
                if(expr.attachedAtEnd){
                    res.push(expr.operator.str)
                    res.push(expr.immutable_token)
                } else {
                    res.push(expr.immutable_token)
                    res.push(expr.operator.str)
                }
                return
            }

            if(expr instanceof ValueExpression && expr.operator.type !== TokenType.EOF){
                if(expr.operands.length){
                    res.push(...this.flattenExpressions(expr.operands))
                    return;
                }

                const str = expr.operator.str
                if(typeof res.at(-1) === "string"){
                    res[res.length - 1] += " " + str
                } else {
                    res.push(str)
                }
                
            }
        })
        return res
    }
}

class Parse_rule_value implements I_ParseRule_No_Pre {
    parse(_ : any, token: Token): Expression {
        return new ValueExpression(token)
    }
}

class Parse_rule_unary implements I_ParseRule_No_Pre {
    parse(parser: I_Parser, token: Token): Expression {
        const right = parser.next(Precedence.prefix)
        return new UnaryExpression(token, right)
    } 
}

class Parse_rule_bracket implements I_ParseRule_No_Pre {
    constructor(public bracketEndToken = TokenType.bracket_end){}

    parse(parser: I_Parser, token: Token): Expression {
        const right = parser.next(parser.nextPrecedence())
        parser.assertNext(this.bracketEndToken)
        return right
    }
}

class Parse_rule_binary implements I_ParseRule_Has_Pre {
    parse(parser : I_Parser, left : Expression, token : Token){
        const right = parser.next(this._precedence)
        return new BinaryExpression(token, left, right)
    }
    constructor(private _precedence : number){}
    get precedence() {return this._precedence}
}

class Parse_rule_optional implements I_ParseRule_Has_Pre {
    parse(parser: I_Parser, cond: Expression, token: Token): Expression {
        const left = parser.next(Precedence.min)
        parser.assertNext(TokenType.colon)
        const right = parser.next(Precedence.cond_right_associative)
        return new TernaryExpression(token, cond, left, right)
    }
    get precedence(): number {
        return Precedence.cond
    }
}

//treat immutable as postfix
class Parse_rule_immutable_postfix implements I_ParseRule_Has_Pre {
    get precedence(){
        return Precedence.slightly_less_than_arithmetic
    }

    parse(parser: I_Parser, left: Expression, token: Token): Expression {
        return new PostfixExpression(token, left)
    }
}
class Parse_rule_immutable_prefix implements I_ParseRule_No_Pre {
    parse(parser: I_Parser, token: Token): Expression {
        const right = parser.next(Precedence.slightly_less_than_arithmetic)
        return new UnaryExpression(token, right)
    }
}

/**
 * Precedence is how far the rercursive call inside a rule is allowed to go 
 * the parser will keep consuming until the next precedence is lower than the starting value
 * so if we pass in
 * a) next(precedence of sum) -> everything lower than sum is consumed into the return result
 * b) next(parser.nextPrecedence()) -> everything lower than the next expression's precedence is consumed
 * */
enum Precedence {
    min = 0,
    immutable,

    cond_right_associative,
    cond,

    slightly_less_than_arithmetic,

    sum,
    product,
    exponent,
    bit_manip,

    prefix,
    postfix,

}

const DefParser = new Parser()

DefParser.registerValueRule(TokenType.value_number)
DefParser.registerValueRule(TokenType.value_string)

DefParser.registerRule(true, TokenType.bracket_open, new Parse_rule_bracket())

DefParser.registerRule(true, TokenType.immutable, new Parse_rule_immutable_prefix())
DefParser.registerRule(false, TokenType.immutable, new Parse_rule_immutable_postfix())

DefParser.registerBinaryRule(TokenType.plus, Precedence.sum)
DefParser.registerBinaryRule(TokenType.minus, Precedence.sum)
DefParser.registerBinaryRule(TokenType.forced_concat, Precedence.sum)

DefParser.registerBinaryRule(TokenType.shift_left, Precedence.bit_manip)
DefParser.registerBinaryRule(TokenType.shift_right, Precedence.bit_manip)
DefParser.registerBinaryRule(TokenType.slice_or_round_to_precision, Precedence.bit_manip)

DefParser.registerUnaryRule(TokenType.negation)
DefParser.registerUnaryRule(TokenType.plus)
DefParser.registerUnaryRule(TokenType.minus)

DefParser.registerBinaryRule(TokenType.mul, Precedence.product)
DefParser.registerBinaryRule(TokenType.div, Precedence.product)

DefParser.registerBinaryRule(TokenType.or, Precedence.cond)
DefParser.registerBinaryRule(TokenType.and, Precedence.cond)
DefParser.registerBinaryRule(TokenType.equals, Precedence.cond)
DefParser.registerBinaryRule(TokenType.not_equals, Precedence.cond)
DefParser.registerBinaryRule(TokenType.lesser, Precedence.cond)
DefParser.registerBinaryRule(TokenType.greater, Precedence.cond)
DefParser.registerBinaryRule(TokenType.lesser_or_equal, Precedence.cond)
DefParser.registerBinaryRule(TokenType.greater_or_equal, Precedence.cond)


DefParser.registerRule(false, TokenType.question_mark, new Parse_rule_optional())

export default DefParser