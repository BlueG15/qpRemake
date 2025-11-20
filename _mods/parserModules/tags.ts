import { DisplayComponent, ParserModule, moduleInputObject, parseOptions } from '../../types/abstract/parser';
import type { nestedTree } from '../../types/misc';

export default class tagsModule extends ParserModule {

    override cmdName = ["tags"];
    override requiredAttr = [["ID"]];
    override doCheckRequiredAttr = true;

    private recurModify(tree : nestedTree<DisplayComponent>, sectionIDs : string[]) : void{
        tree.forEach(i => {
            if(i instanceof DisplayComponent) {
                i.addSectionID(sectionIDs)
            } else {
                this.recurModify(i, sectionIDs)
            };
        })
    }

    override evaluate(cmd: string, args: moduleInputObject, option: parseOptions, raw: string): nestedTree<DisplayComponent> {
        let IDs = (args.getAttr("ID") as string).split(" ")
        let final = args.getChilren()

        this.recurModify(final, IDs);

        return final
    }
}