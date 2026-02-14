import { DisplayComponent, ParserModule, ModuleInputObject, ParseOptions, ParseMode, TextComponent } from '../../system-components/localization/xml-text-parser';
import type { nestedTree } from '../../core/misc';

export default class variantCheckModule extends ParserModule {

    override cmdName = [
        'variantInclude', 'variantExclude'
    ];
    override requiredAttr = new Array(2).fill(["variantID"]);
    override doCheckRequiredAttr = true; 

    override isValidAttr(cmdIndex: number, attrName: string, attr: string): boolean {
        const k = attr.split(" ");
        for(let i = 0; i < k.length; i++){
            if(!k[i].length) return false
        }
        return true
    }

    private recurModify(tree : nestedTree<DisplayComponent>, sectionID : string) : void{
        tree.forEach(i => {
            if(i instanceof DisplayComponent) {
                i.addSectionID(sectionID)
            } else {
                this.recurModify(i, sectionID)
            };
        })
    }

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