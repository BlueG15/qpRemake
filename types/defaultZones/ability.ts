import Card from "../abstract/gameComponents/card";
import zone_stack from "../abstract/gameComponents/zone_stackBased";
import res from "../abstract/generics/universalResponse";

class abiltyZone extends zone_stack {
    //TODO : figure out wtf this does
    //currently doing nothing but storing the ability card

    get maxCoolDown() {return this.attr.get("maxCoolDown") ?? -1};
    set maxCoolDown(newVal : number) {this.attr.set("maxCoolDown", newVal)};

    currentCoolDown : number = this.maxCoolDown

    override remove(c: Card): res {
        return [undefined, []]
    }
    
}

export default abiltyZone