import type { BrandedNumber, BrandedString, hexString2 } from "..";
import { Registry } from "./base";

const enum Color {
    white,
    red,
    green,
    blue,
    yellow,
    purple,
}

function getColorData(
    red   : hexString2 = "00", 
    green : hexString2 = "00",
    blue  : hexString2 = "00",
    alpha : hexString2 = "FF"
) : ColorData {
    return {red, green, blue, alpha}
}

export type ColorData = {red : hexString2, green : hexString2, blue : hexString2, alpha : hexString2}
export type ColorID = BrandedNumber<Color>
export type ColorName = BrandedString<Color>

const DefaultColorData = {
    white  : getColorData("FF", "FF", "FF"),
    red    : getColorData("FF", void 0, void 0),
    green  : getColorData(void 0, "FF", void 0),
    blue   : getColorData(void 0, void 0, "FF"),
    yellow : getColorData("FF", "FF", void 0),
    purple : getColorData("9F", void 0, "A7"),
    pink   : getColorData("FF", "00", "6F")
} as const

const ColorRegistry = Registry.from<ColorID, ColorName, ColorData, typeof DefaultColorData>(DefaultColorData)
export { ColorRegistry }
