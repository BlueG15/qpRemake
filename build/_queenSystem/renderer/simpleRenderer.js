"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleRenderer = void 0;
const systemRegistry_1 = require("../../data/systemRegistry");
class simpleRenderer {
    constructor() {
        this.scene0Index = 0;
    }
    startMenu(index = 0) {
        switch (index) {
            case 0: return this.scene0();
        }
        process.stdin.setRawMode(true);
        process.stdin.on("data", function (buffer) {
            console.log(buffer);
            this.scene0Index++;
            this.scene0();
        }.bind(this));
        process.on("SIGKILL", () => process.stdin.setRawMode(false));
        process.on("exit", () => process.stdin.setRawMode(false));
    }
    scene0() {
        this.scene0Index %= 3;
        console.log("Welcome to qpRemake, a passion project of Blu insipired by the hit game Quamtum Protocol");
        console.log("What do you like to run today?");
        const k = [
            "Run a test",
            "Progress check",
            "Quit"
        ];
        k[this.scene0Index] = "=> " + k[this.scene0Index];
        k.forEach(line => console.log(line));
    }
    formater_zone(z) {
        ///okii, render 
        //[ ][ ][ ] ...
        //for zone shape
        if (z.shape.length === 1)
            return `----${z.name}---- : ` + ((z.cards.length === 0) ? "<Empty>" : z.cards.map((c) => c === undefined ? "[ ]" : "[c]").join(""));
        if (z.shape.length >= 2) {
            const x = Number.isInteger(z.shape[0]) ? z.shape[0] : 3;
            const y = Number.isInteger(z.shape[1]) ? z.shape[1] : 3;
            const res = [];
            for (let i = 0; i < y; i++) {
                const arr = new Array(y);
                for (let j = 0; j < x; j++) {
                    const index = Utils.positionToIndex([j, i], z.shape);
                    arr[j] = z.cards[index] === undefined ? "[ ]" : '[c]';
                }
            }
            return `----${z.name[0]}:[${[x, y]}]----\n` + res.join("\n");
        }
        return "";
    }
    gameStart(s, callback) {
        //render only fields and hand, hide the rest
        const texts = s.zones.map(z => this.formater_zone(z)).reverse().join("\n");
        console.log(texts);
        callback();
    }
    turnStart(s, callback) {
        callback();
    }
    update(phase, s, a, callback) {
        if (phase === systemRegistry_1.TurnPhase.complete)
            console.log(`Action performed: ${a.type}`);
        callback();
    }
    requestInput(inputSet, phase, s, a, callback) {
        console.log("input requested: ", inputSet);
        console.log("Attempting to continue with the first input");
        callback(inputSet[0]);
    }
}
exports.simpleRenderer = simpleRenderer;
