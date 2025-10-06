"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = __importDefault(require("./node"));
class _tree {
    constructor(a) {
        this.length = 0;
        this.root = new node_1.default(a, 0, this.length);
        this.length++;
    }
    toString() {
        return "\n" + this.root.toString();
    }
    // all operations below are operated on the lowest left most NORMAL node 
    // protected handleNode(func : (a : _node<T>) => void, node : _node<T> | undefined, ...data : any[]) : void{
    //     if(!node) return
    //     if(node.isLeaf) return func(node)
    //     return this.handleNode(func, node.firstChild, ...data)
    // }
    handleNode(func, node = this.root, ...data) {
        if (!node)
            return false;
        for (let i = 0; i < node.childArr.length; i++) {
            let child = node.childArr[i];
            if (this.handleNode(func, child, ...data))
                return true;
        }
        if (node.isNormal) {
            func(node);
            return true;
        }
        return false;
    }
    attach(...data) {
        this.handleNode((n) => {
            return n.attach(this.length, ...data);
        }, this.root, ...data);
        this.length += data.length;
    }
    attach_node(n, ...data) {
        n.attach(this.length, ...data);
        this.length += data.length;
    }
    modify(func) {
        return this.handleNode((n) => {
            return n.modifySelf(func);
        }, this.root, func);
    }
    // get(node = this.root, errorValue : T = this.root.data) : T{
    //     if(!node) return errorValue
    //     if(node.isLeaf) return node.data
    //     return this.get(node.firstChild, errorValue)
    // }
    flat() {
        return this.root.flat();
    }
    invalidate() {
        return this.handleNode((n) => {
            return n.invalidate();
        }, this.root);
    }
    // traversePostOrder(node: _node<T> = this.root, func : (n : _node<T>) => void): void {
    //     if (!node) return;
    //     node.childArr.forEach(child => this.traversePostOrder(child, func));
    //     console.log(node.data);
    // }
    getNormal(node = this.root) {
        if (!node)
            return undefined;
        for (let child of node.childArr) {
            let result = this.getNormal(child);
            if (result !== undefined)
                return result;
        }
        if (node.isNormal)
            return node.data;
        return undefined;
    }
    //archaic methods
    handleNodeWithID(nodeID, func, node = this.root, ...data) {
        if (!this.IDValid(nodeID))
            return false;
        if (!node)
            return false;
        for (let child of node.childArr) {
            if (this.handleNodeWithID(nodeID, func, child, ...data))
                return true;
        }
        if (node.id == nodeID) {
            func(node);
            return true;
        }
        return false;
    }
    IDValid(nodeID) {
        return nodeID >= 0 && nodeID < this.length;
    }
    attachArbitrary(nodeID, ...data) {
        if (!data.length)
            return false;
        let a = this.handleNodeWithID(nodeID, (n) => {
            return n.attach(this.length, ...data);
        }, this.root, ...data);
        if (a)
            this.length += data.length;
        return a;
    }
    modifyArbitrary(nodeID, func) {
        return this.handleNodeWithID(nodeID, (n) => {
            return n.modifySelf(func);
        }, this.root, func);
    }
    invalidateArbitrary(nodeID) {
        return this.handleNodeWithID(nodeID, (n) => {
            return n.invalidate();
        }, this.root);
    }
    recurAll(func, stopID) {
        let flag = false;
        this.handleNode((n) => {
            if (n.id === stopID) {
                flag = true;
                return;
            }
            flag = func(n);
            //n.markComplete()
        }, this.root);
        if (this.root.isNormal && !flag)
            this.recurAll(func, stopID);
    }
    //added, kinda danerous since now outsider have access to node pointers 
    getNode(id) {
        let n = this.root;
        this.handleNodeWithID(id, (k) => {
            n = k;
        });
        return n;
    }
    getNext() {
        let n = undefined;
        this.handleNode((k) => {
            n = k;
        });
        return n;
    }
    clear() {
        //keeps the root
        this.root.childArr = [];
    }
}
exports.default = _tree;
