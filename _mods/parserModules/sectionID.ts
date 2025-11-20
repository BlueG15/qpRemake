import { 
    DisplayComponent, 
    ParserModule, 
    componentID, iconID, 
    moduleInputObject, 
    parseOptions, 
    TextComponent, IconComponent, SymbolComponent 
} from '../../types/abstract/parser';
import type { nestedTree } from '../../types/misc';

export default class sectionIDModule extends ParserModule {

    private quickKeyword = ['void', 'decompile', 'pathed', 'exposed', 'exec', 'align','cover', 'suspend', 'automate']
    private normalKeyword = ['key', 'physical', 'magic', 'health', 'attack', 'specialbuff']
    private pastKeyword = ['decompiled', 'exec-ed', 'aligned']
    private colorKeyword = ['red', 'green', 'blue', 'white', 'black', 'yellow', 'orange', 'purple']
    
    override cmdName = [
        ...this.normalKeyword,
        ...this.pastKeyword,
        ...this.quickKeyword,     
        ...this.colorKeyword,
        'physical2', 'magic2', 
    ];
    override requiredAttr = new Array(this.cmdName.length).fill([]);
    override doCheckRequiredAttr = false;

    private recurModify(tree : nestedTree<DisplayComponent>, sectionID : string, upperCase : boolean) : void{
        tree.forEach(i => {
            if(i instanceof DisplayComponent) {
                i.addSectionID(sectionID)
                if(i.id == componentID.text && upperCase){
                    (i as TextComponent).str = (i as TextComponent).str.toUpperCase();
                }
            } else {
                this.recurModify(i, sectionID, upperCase)
            };
        })
    }

    override evaluate(cmd: string, args: moduleInputObject, option: parseOptions, raw: string): nestedTree<DisplayComponent> {
        let quickFlag = this.quickKeyword.includes(cmd)
        let addIconFlag = cmd.endsWith('2')

        let x = cmd

        if(addIconFlag) x = x.slice(0, -1);

        let final = args.getChilren()

        if(quickFlag && !final.length){
            //special behavior
            // x = x.toLowerCase()
            return [
                new SymbolComponent(
                    "key_" + x, undefined, cmd, raw
                )
            ]
        }

        this.recurModify(final, x, quickFlag);
        
        if(addIconFlag){
            final = [final, [new IconComponent(
                (x == "physical") ? iconID.dmg_phys : iconID.dmg_magic,
                undefined,
                cmd, 
                raw
            )]]
        }
        return final
        
    }
}