import { 
    DisplayComponent, 
    ParserModule, 
    ModuleInputObject, 
    ParseOptions, 
    IconID, 
    IconComponent, 
    ImageComponent 
} from '../../system-components/localization/xml-text-parser';

export default class imgModule extends ParserModule {

    override cmdName = ['img', 'icon'];
    override requiredAttr = [[], []];
    override doCheckRequiredAttr = false;

    private getIconID(key : string) : [IconID, boolean] {
        let k = key as keyof typeof IconID;
        let x = IconID[k];
        if(!x) return [IconID.crash, false];
        return [x, true];
    }

    override evaluate(cmd: string, args: ModuleInputObject, option: ParseOptions, raw: string): DisplayComponent[] {
        let isInIconMode = false
        
        let str = args.getAttr('id');
        if(str) isInIconMode = true;
        else str = args.getAttr('url');
        if(str) isInIconMode = false;
        else return []

        if(isInIconMode){
            let [iconID, isCorrect] = this.getIconID(str);
            return [
                new IconComponent(iconID, isCorrect ? undefined : `Wrong iconID, received = ${str}`, cmd, raw)
            ]
        } else {
            return [
                new ImageComponent(str, undefined, cmd, raw)
            ]
        }
        
    }
}