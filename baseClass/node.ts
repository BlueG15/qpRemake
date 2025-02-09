class _node<T> {
    id : number
    data : T

    protected invalid : boolean = false
    completed : boolean = false

    childArr : _node<T>[] = []
    depth : number
    constructor(a : T, depth : number, id : number){
        this.data = a
        this.depth = depth
        this.id = id
    }
    get isNormal() {return !this.invalid && !this.completed}
    get hasChild() {return this.childArr.length >= 0}
    get isLeaf() {return this.childArr.length == 0}
    get isRoot() {return this.depth == 0}
    get firstChild() : _node<T> | undefined{return this.childArr[0]}
    invalidate(){
        this.invalid = true;
        this.childArr.forEach(i => i.invalidate())
    }
    markComplete(){
        this.completed = true
    }
    attach(id : number, ...a : T[]){
        this.childArr.push(...a.map((i, index) => new _node(i, this.depth + 1, id + index)))
    }
    modifySelf(func : (a : T) => T){
        this.data = func(this.data)
    }
    toString() : string{
        let str = "-".repeat(this.depth * 2) + `-> (${this.depth}) ` + JSON.stringify(this.data, null, 0) + "\n"
        this.childArr.forEach(i => {
            str += i.toString()
        })
        return str
    }
    flat() : T[]{
        let a : T[] = []
        this.childArr.forEach(i => a.push(...i.flat()))
        a.push(this.data)
        return a;
    }
}

export default _node