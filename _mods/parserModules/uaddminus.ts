import { DisplayComponent, ParserModule, moduleInputObject, parseOptions, mode, TextComponent } from '../../types/parser';
import type { nestedTree } from '../../types/misc';

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

    override evaluate(cmd: string, args: moduleInputObject, option: parseOptions, raw: string): nestedTree<DisplayComponent> {
        let k = args.getChilren()

        this.recurModify(k, cmd)

        if(option.mode == mode.debug) 
            return k
            
        //remove bracket by default
        
        // let upgradeFlag = option.cardData && option.cardData.variants.join(" ").toLowerCase().includes("upgrade")
        // if((upgradeFlag && cmd == "uminus") || (!upgradeFlag && cmd == "uadd")){
        //     return []
        // }
        
        if(option.mode == mode.catalog){
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