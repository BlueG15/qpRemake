"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.add = add;
exports.rng = rng;
function add(a, b) {
    return a + b;
}
function rng(max, min, round) {
    return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min;
}
