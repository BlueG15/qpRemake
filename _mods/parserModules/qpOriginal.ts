import numericModule from "./numeric";
import stringParseModule from "./string";
import genericIfModule from "./genericIf";
import imgModule from "./img";
import sectionIDModule from "./sectionID";
import tagsModule from "./tags";
import uadduminusModule from "./uaddminus";
import variantCheckModule from "./variantCheck";
import { modPack } from "../../types/abstract/parser";

class qpOriginalPack extends modPack {
    constructor(){
        super()
        this.moduleArr = [
            new imgModule(),
            new sectionIDModule(),
            new uadduminusModule(),
            new variantCheckModule(),
            new tagsModule(),
            new numericModule(),
            new stringParseModule(),
            new genericIfModule(),
        ]
        this.loadModules()
    }
}

export default qpOriginalPack