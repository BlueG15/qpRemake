import { 
    component, 
    parserModule, 
    moduleInputObject, 
    parseOptions, 
    symbolComponent
} from '../../types/abstract/parser';

export default class addSymbolModule extends parserModule {

    override cmdName = ['symbol'];
    override requiredAttr = [["id"]];
    override doCheckRequiredAttr = true;

    override evaluate(cmd: string, args: moduleInputObject, option: parseOptions, raw: string): component[] {
        let x = args.getAttr("id");
        if(!x) return []

        return [new symbolComponent(
            x, undefined, "symbol", raw
        ).addSectionID(x)]
    }
}