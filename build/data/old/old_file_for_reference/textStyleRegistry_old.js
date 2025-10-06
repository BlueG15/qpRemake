"use strict";
//WARNING: this file should not be used
//should only let the front end decides this stuff
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardCodedColor = exports.styleData = void 0;
const hardCodedColor = {
    "white": "ffffff",
    "black": "000000",
    "green": "00ff00",
    "blue": "0089ff",
    "red": "b10000",
    "yellow": "ffff45",
    "purple": "9f00a7",
    "pink": "ff008a",
    "orange": "eb5d10",
    "light_green": "1dea79",
    "light_blue": "97dfff",
    "light_pink": "ce339f",
    "very_light_blue": "a3e0ff",
    "very_light_yellow": "fffaa3"
};
exports.hardCodedColor = hardCodedColor;
class styleData {
    constructor(k, b = false, i = false, invi = false) {
        this.rgb = hardCodedColor[k];
        this.isBold = b;
        this.isItalic = i;
        this.isInvisible = invi;
    }
}
exports.styleData = styleData;
const textStyle = {
    //general text styling
    "text": new styleData("white"),
    "notice": new styleData("orange", true),
    "warn": new styleData("red", true),
    "info": new styleData("light_blue", true),
    "highlight": new styleData("yellow", false, true),
    //specialized modifiers
    "upgrade_add": new styleData("light_green", true),
    "upgrade_remove": new styleData("red", true),
    "number_physical": new styleData("red", false, true),
    "number_magic": new styleData("blue", false, true),
    "number_misc": new styleData("yellow", false, true),
    "health_max": new styleData("red", true),
    "health_current": new styleData("orange", true),
    "void": new styleData("purple", true),
    "decompile": new styleData("purple", true),
    "execute": new styleData("very_light_blue", false, true),
    "archtype": new styleData("yellow", true),
    //rarity
    "rarity_white": new styleData("white"),
    "rarity_blue": new styleData("blue"),
    "rarity_green": new styleData("green"),
    "rarity_red": new styleData("red"),
    "rarity_broken": new styleData("pink"),
    "rarity_ability": new styleData("yellow"),
    "rarity_algo": new styleData("purple"),
    //force color
    "force_white": new styleData("white"),
    "force_black": new styleData("black"),
    "force_green": new styleData("green"),
    "force_blue": new styleData("blue"),
    "force_red": new styleData("red"),
    "force_yellow": new styleData("yellow"),
    "force_purple": new styleData("purple"),
    "force_pink": new styleData("pink"),
    "force_orange": new styleData("orange"),
    "force_light_green": new styleData("light_green"),
    "force_light_blue": new styleData("light_blue"),
    "force_light_pink": new styleData("light_pink"),
    "force_very_light_blue": new styleData("very_light_blue"),
    "force_very_light_yellow": new styleData("very_light_yellow"),
};
exports.default = textStyle;
