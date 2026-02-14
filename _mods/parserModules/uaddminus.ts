import { DisplayComponent, ParserModule, ModuleInputObject, ParseOptions, ParseMode } from '../../system-components/localization/xml-text-parser';
import type { nestedTree } from '../../core/misc';

export default class uadduminusModule extends ParserModule {

    override cmdName = ['uadd', 'uminus'];
    override requiredAttr = [[], []];
    override doCheckRequiredAttr = false; 

    private recurModify(tree : nestedTree<DisplayComponent>, sectionID : string) : void{
        tree.forEach(i => {
            if(i instanceof DisplayComponent) {
                i.addSectionID(sectionID)
            } else {
                this.recurModify(i, sectionID)
            };
        })
    }

    /** SO this is weird, I want this to work for both new and old styles of writing
     * Yet, jkong use uadd and uminus for....the bracket
     * Not the content
     * This code below is supporting the "bracket" style of writing
     * fix later mayber
     */
    override evaluate(cmd: string, args: ModuleInputObject, option: ParseOptions, raw: string): nestedTree<DisplayComponent> {
        let k = args.getChilren()

        this.recurModify(k, cmd)

        if(option.mode == ParseMode.debug) 
            return k
            
        //remove bracket by default
        
        // let upgradeFlag = option.cardData && option.cardData.variants.join(" ").toLowerCase().includes("upgrade")
        // if((upgradeFlag && cmd == "uminus") || (!upgradeFlag && cmd == "uadd")){
        //     return []
        // }
        
        if(option.mode == ParseMode.catalog){
            // k = [
            //     [new TextComponent("[", undefined, cmd, raw)],
            //     k,
            //     [new TextComponent("]", undefined, cmd, raw)]
            // ]
            return k
        }

        return []
    }
}