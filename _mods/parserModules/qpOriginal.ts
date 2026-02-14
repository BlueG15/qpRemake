import expressionModule from "./expression";
import imgModule from "./img";
import sectionIDModule from "./sectionID";
import tagsModule from "./tags";
import uadduminusModule from "./uaddminus";
import variantCheckModule from "./variantCheck";
import { ParserModulePack } from "../../system-components/localization/xml-text-parser";

class qpOriginalPack extends ParserModulePack {
    constructor(){
        super()
        this.moduleArr = [
            new imgModule(),
            new sectionIDModule(),
            new uadduminusModule(),
            new variantCheckModule(),
            new tagsModule(),
            new expressionModule(),
        ]
        this.loadModules()
    }
}

export default qpOriginalPack