import Card from "../../types/gameComponents/card";
import zone_stack from "../../types/gameComponents/zone_stackBased";
import res from "../../types/generics/universalResponse";

class Ability extends zone_stack {
    //TODO : figure out wtf this does
    //currently doing nothing but storing the ability card

    get maxCoolDown() {return this.attr.get("maxCoolDown") ?? -1};
    set maxCoolDown(newVal : number) {this.attr.set("maxCoolDown", newVal)};

    currentCoolDown : number = this.maxCoolDown

    override remove(c: Card): res {
        return [undefined, []]
    }
    
}

export default Ability