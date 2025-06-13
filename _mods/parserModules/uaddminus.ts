import { component, parserModule, moduleInputObject, parseOptions, mode, textComponent } from '../../types/abstract/parser';
type nestedTree<T> = T[] | nestedTree<T>[]

export default class uadduminusModule extends parserModule {

    override cmdName = ['uadd', 'uminus'];
    override requiredAttr = [[], []];
    override doCheckRequiredAttr = false; 

    private recurModify(tree : nestedTree<component>, sectionID : string) : void{
        tree.forEach(i => {
            if(i instanceof component) {
                i.addSectionID(sectionID)
            } else {
                this.recurModify(i, sectionID)
            };
        })
    }

    override evaluate(cmd: string, args: moduleInputObject, option: parseOptions, raw: string): nestedTree<component> {
        
        let k = args.getChilren()

        if(option.mode == mode.debug) 
            return k
            
        //remove bracket by default
        
        let upgradeFlag = option.cardData.variants.join(" ").toLowerCase().includes("upgrade")
        if((upgradeFlag && cmd == "uminus") || (!upgradeFlag && cmd == "uadd")){
            return []
        }
        
        if(option.mode == mode.info){
            k = [
                [new textComponent("[", undefined, cmd, raw)],
                k,
                [new textComponent("]", undefined, cmd, raw)]
            ]
        }

        this.recurModify(k, cmd)

        return k
    }
}