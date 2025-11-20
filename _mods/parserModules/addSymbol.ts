import { 
    DisplayComponent, 
    ParserModule, 
    moduleInputObject, 
    parseOptions, 
    SymbolComponent
} from '../../types/abstract/parser';

export default class addSymbolModule extends ParserModule {

    override cmdName = ['symbol'];
    override requiredAttr = [["id"]];
    override doCheckRequiredAttr = true;

    override evaluate(cmd: string, args: moduleInputObject, option: parseOptions, raw: string): DisplayComponent[] {
        let x = args.getAttr("id");
        if(!x) return []

        return [new SymbolComponent(
            x, undefined, "symbol", raw
        ).addSectionID(x)]
    }
}