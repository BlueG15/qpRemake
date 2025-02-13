import _node from "./node";

class _tree<T> {
    protected length : number = 0
    root : _node<T>
    constructor(a : T){
        this.root = new _node(a, 0, this.length)
        this.length++;
    }
    toString() : string{
        return "\n" + this.root.toString()
    }
    // all operations below are operated on the lowest left most NORMAL node 
    // protected handleNode(func : (a : _node<T>) => void, node : _node<T> | undefined, ...data : any[]) : void{
    //     if(!node) return
    //     if(node.isLeaf) return func(node)
    //     return this.handleNode(func, node.firstChild, ...data)
    // }
    protected handleNode(func: (node: _node<T>) => void, node: _node<T> = this.root, ...data : any[]): boolean {
        if (!node) return false;
        for (let child of node.childArr) {
            if (this.handleNode(func, child, data)) return true;
        }
        if (node.isNormal) {
            func(node);
            return true;
        }
        return false;
    }
    attach(...data: T[]){
        this.handleNode((n : _node<T>) => {
            return n.attach(this.length, ...data)
        }, this.root, ...data)
        this.length += data.length
    }
    modify(func : (a : T) => T){
        return this.handleNode((n : _node<T>) => {
            return n.modifySelf(func)
        }, this.root, func)
    }
    // get(node = this.root, errorValue : T = this.root.data) : T{
    //     if(!node) return errorValue
    //     if(node.isLeaf) return node.data
    //     return this.get(node.firstChild, errorValue)
    // }
    flat(){
        return this.root.flat()
    }
    invalidate(){
        return this.handleNode((n : _node<T>) => {
            return n.invalidate()
        }, this.root)
    }
    // traversePostOrder(node: _node<T> = this.root, func : (n : _node<T>) => void): void {
    //     if (!node) return;
    //     node.childArr.forEach(child => this.traversePostOrder(child, func));
    //     console.log(node.data);
    // }

    getNormal(node: _node<T> = this.root): T | undefined {
        if (!node) return undefined;
        for (let child of node.childArr) {
            let result = this.getNormal(child);
            if (result !== undefined) return result;
        }
        if (node.isNormal) return node.data;
        return undefined;
    }
    
    //archaic methods
    protected handleNodeWithID(nodeID : number, func: (node: _node<T>) => void, node: _node<T> = this.root, ...data : any[]): boolean {
        if(!this.IDValid(nodeID)) return false
        if (!node) return false;
        for (let child of node.childArr) {
            if (this.handleNodeWithID(nodeID, func, child, data)) return true;
        }
        if (node.id == nodeID) {
            func(node);
            return true;
        }
        return false;
    }
    IDValid(nodeID : number){
        return nodeID >= 0 && nodeID < this.length
    }
    attachArbitrary(nodeID : number, ...data : T[]){
        if(!data.length) return false;
        let a = this.handleNodeWithID(nodeID, (n : _node<T>) => {
            return n.attach(this.length, ...data)
        }, this.root, ...data)
        if(a) this.length += data.length
        return a
    }
    modifyArbitrary(nodeID : number, func : (a : T) => T){
        return this.handleNodeWithID(nodeID, (n : _node<T>) => {
            return n.modifySelf(func)
        }, this.root, func)
    }
    invalidateArbitrary(nodeID : number){
        return this.handleNodeWithID(nodeID, (n : _node<T>) => {
            return n.invalidate()
        }, this.root)
    }

    recurAll(func : (a : _node<T>) => boolean, stopID? : number){
        let flag : boolean = false
        this.handleNode((n : _node<T>) => {
            if(n.id === stopID) {
                flag = true
                return
            }
            flag = func(n)
            //n.markComplete()
        }, this.root)
        if(this.root.isNormal && !flag) this.recurAll(func, stopID)
    }

    //added, kinda danerous since now outsider have access to node pointers 
    getNode(id : number){
        let n : _node<T> = this.root
        this.handleNodeWithID(id, (k : _node<T>) => {
            n = k;
        })
        return n;
    }

    getNext(){
        let n : _node<T> | undefined = undefined
        this.handleNode((k : _node<T>) => {
            n = k;
        })
        return n;
    }

    clear(){
        //keeps the root
        this.root.childArr = []
    }
}

export default _tree