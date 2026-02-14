import { 
    DisplayComponent, 
    ParserModule, 
    ModuleInputObject,
    ParseOptions,
    SymbolComponent
} from '../../system-components/localization/xml-text-parser';

export default class addSymbolModule extends ParserModule {

    override cmdName = ['symbol'];
    override requiredAttr = [["id"]];
    override doCheckRequiredAttr = true;

    override evaluate(cmd: string, args: ModuleInputObject, option: ParseOptions, raw: string): DisplayComponent[] {
        let x = args.getAttr("id");
        if(!x) return []

        return [new SymbolComponent(
            x, undefined, "symbol", raw
        ).addSectionID(x)]
    }
}