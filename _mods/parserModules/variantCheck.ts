import { DisplayComponent, ParserModule, moduleInputObject, parseOptions, mode, TextComponent } from '../../system-components/localization/xml-text-parser';
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

    override evaluate(cmd: string, args: moduleInputObject, option: parseOptions, raw: string): nestedTree<DisplayComponent> {
        
        let k = args.getChilren()

        if(option.mode == mode.debug) 
            return k
            
        //remove bracket by default
        
        const checkVariant = (args.getAttr("expr") as string).split(' ')
        let correctVariantFlag = option.cardData && option.cardData.variants.some(i => checkVariant.includes(i))
        if((correctVariantFlag && cmd == "variantExclude") || (!correctVariantFlag && cmd == "variantInclude")){
            return []
        }
        
        if(option.mode == mode.info){
            k = [
                [new TextComponent("[", undefined, cmd, raw)],
                k,
                [new TextComponent("]", undefined, cmd, raw)]
            ]
        }

        this.recurModify(k, cmd)

        return k
    }
}