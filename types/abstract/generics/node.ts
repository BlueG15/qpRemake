import type { Action } from "../../../_queenSystem/handler/actionGenrator"

class _node<Type extends Action = Action> {
    data : Type

    completed : boolean = false

    childArr : _node[] = []
    depth : number
    constructor(a : Type, depth : number, id : number){
        this.data = a
        this.depth = depth
        this.id = id
    }
    get id() {return this.data.id}
    set id(n : number){this.data.assignID(n)}
    get isNormal() {return !this.invalid && !this.completed}
    get hasChild() {return this.childArr.length >= 0}
    get isLeaf() {return this.childArr.length == 0}
    get isRoot() {return this.depth == 0}
    get firstChild() : _node | undefined{return this.childArr[0]}
    get invalid() {return this.data.isDisabled}
    invalidate(){
        this.data.disable();
        this.childArr.forEach(i => i.invalidate())
    }
    markComplete(){
        this.completed = true
    }
    attach(id : number, ...a : Action[]){
        this.childArr.push(...a.map((i, index) => new _node(i, this.depth + 1, id + index)))
    }
    modifySelf(func : (a : Type) => Type){
        this.data = func(this.data)
    }
    toString() : string{
        let str = "-".repeat(this.depth * 2) + `-> (${this.depth}) ` + JSON.stringify(this.data, null, 0) + "\n"
        this.childArr.forEach(i => {
            str += i.toString()
        })
        return str
    }
    flat() : Action[]{
        let a : Action[] = []
        this.childArr.forEach(i => a.push(...i.flat()))
        a.push(this.data)
        return a;
    }
}

export default _node