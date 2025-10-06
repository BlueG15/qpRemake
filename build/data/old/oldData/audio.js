"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = playAudio;
function playAudio(name, volume = 1) {
    if (["cardreverse"].includes(name))
        return;
    // name = "cs_hover";
    try {
        const audio = new Audio(window.location.origin + `/audio/${name}.wav`);
        audio.volume = volume;
        audio.play().catch();
    }
    catch (err) { }
}
