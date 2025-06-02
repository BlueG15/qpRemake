import { component, effectTextParserModule, moduleInputObject, parseOptions } from '../../types/abstract/parser';
type nestedTree<T> = T[] | nestedTree<T>[]

export default class tagsModule extends effectTextParserModule {

    override cmdName = ["tags"];
    override requiredAttr = [["ID"]];
    override doCheckRequiredAttr = true;

    private recurModify(tree : nestedTree<component>, sectionIDs : string[]) : void{
        tree.forEach(i => {
            if(i instanceof component) {
                i.addSectionID(sectionIDs)
            } else {
                this.recurModify(i, sectionIDs)
            };
        })
    }

    override evaluate(cmd: string, args: moduleInputObject, option: parseOptions, raw: string): nestedTree<component> {
        let IDs = (args.getAttr("ID") as string).split(" ")
        let final = args.getChilren()

        this.recurModify(final, IDs);

        return final
    }
}