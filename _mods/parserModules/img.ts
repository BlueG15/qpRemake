import { 
    DisplayComponent, 
    ParserModule, 
    moduleInputObject, 
    parseOptions, 
    iconID, 
    IconComponent, 
    ImageComponent 
} from '../../system-components/localization/xml-text-parser';

export default class imgModule extends ParserModule {

    override cmdName = ['img', 'icon'];
    override requiredAttr = [[], []];
    override doCheckRequiredAttr = false;

    private getIconID(key : string) : [iconID, boolean] {
        let k = key as keyof typeof iconID;
        let x = iconID[k];
        if(!x) return [iconID.crash, false];
        return [x, true];
    }

    override evaluate(cmd: string, args: moduleInputObject, option: parseOptions, raw: string): DisplayComponent[] {
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