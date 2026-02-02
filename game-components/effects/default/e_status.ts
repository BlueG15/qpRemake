// import type Card from "./card";
import { Effect } from "../effect";
import { ActionGenerator, type Action } from "../../../core/registry/action";
import { damageType } from "../../../data/systemRegistry";
import type { CardDry } from "../../cards";
import type { SystemDry } from "../../../core";
import type { EffectData as effectData } from "../effectData";
import { EffectDataGenerator } from "../effectData";

export class StatusEffect_base extends Effect<[]> {
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action){
        return;
    }
    // the existence of id neccessitates a handler
    // this handler is special tho, it need to create the Status effect first, apply later
    // unlike card or s.th, which creates and provide in the same function
    
    //merge behavior is automatic upon end of turn

    get mergeSignature() : string | undefined {
        return this.constructor.name
    }

    //merge target is guaranteed to have the same signature of this
    merge(mergeTargets : StatusEffect_base[]) : StatusEffect_base[] {return mergeTargets}
    parseStat(statObj : {
        level : number,
        maxAtk : number,
        maxHp : number,
        extensionArr : string[]
    }) : void {}

    //new note (june 14 2025)
    //all the below is default implementations
    //status effects are literally just effects with 1 extra function: merging
    //thats it

    activateOnTurnStart?(c : CardDry, system : SystemDry, a : Action<"a_turn_start">) : Action[]  
    activateOnTurnEnd?(c : CardDry, system : SystemDry, a : Action<"a_turn_end">) : Action[] 
    activateOnApply?(c : CardDry, system : SystemDry, a : Action<"a_add_status_effect">) : Action[] 
    activateOnRemove?(c : CardDry, system : SystemDry, a : Action<"a_remove_status_effect">) : Action[] 
    activateOnReProc?(c : CardDry, system : SystemDry, a : Action<"a_activate_effect">) : Action[] 
    // ^ if this status effects allows for reproc using activateEffect action
    //normally that isnt fucking possible? 
    //its like forcefully activating a passive
    //makes no sense on paper
    //but in practice....yeh its for expandability

    override canRespondAndActivate(c: CardDry, system: SystemDry, a: Action): boolean {
        if(system.isInTriggerPhase && this.activateOnTurnStart && a.is("a_turn_start")){
            return true
        }

        if(system.isInChainPhase && this.activateOnTurnEnd && a.is("a_turn_end")){
            return true
        }

        if(system.isInTriggerPhase && this.activateOnApply && a.is("a_add_status_effect") && a.flatAttr().typeID === this.id){
            return true
        }

        if(system.isInChainPhase && this.activateOnRemove && a.is("a_remove_status_effect") && a.targets[0].is(c, this)){
            return true
        }

        return false
    }

    override activate(c: CardDry, system: SystemDry, a: Action) {
        let res : Action[] = []
        if(this.activateOnTurnStart && a.is("a_turn_start")){
            res = this.activateOnTurnStart(c, system, a as Action<"a_turn_start">);
        }

        if(this.activateOnTurnEnd && a.is("a_turn_end")){
            res = this.activateOnTurnEnd(c, system, a as Action<"a_turn_end">);
        }

        if(this.activateOnApply && a.is("a_add_status_effect")){
            res = this.activateOnApply(c, system, a as Action<"a_add_status_effect">);
        }

        if(this.activateOnRemove && a.is("a_remove_status_effect")){
            res = this.activateOnRemove(c, system, a as Action<"a_remove_status_effect">);
        }

        if(this.activateOnReProc && (a.is("a_activate_effect"))){
            res = this.activateOnReProc(c, system, a);
        }

        res.forEach(i => i.isChain = true)
        return res
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : EffectDataGenerator.status()
        }
    }

    //status effects generally have 2 main types:
    //apply once effect, will respond with 
    // a chained effect that trigger in the trigger step
    // --> to the action <apply StatusEffect> with same id as this one
    
    
    //apply each turn effect, will chain to the "turnStart" action during the trigger phase

    //every other status effects with different listening conditions will act like a normal effect
}

export class e_any_extension extends StatusEffect_base {
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }
    
    override parseStat(statObj: { atk: number; hp: number; level: number; maxAtk: number; maxHp: number; extensionArr: string[]; }): void {
        statObj.extensionArr = ["*"]
    }

    override merge(mergeTargets: StatusEffect_base[]): StatusEffect_base[] {
        return [this]
    }
}

export class genericCounter extends StatusEffect_base {
    override merge(mergeTargets: genericCounter[]): genericCounter[] {
        let c = this.count;
        mergeTargets.forEach(i => c += i.count);
        this.count = c;
        return [this];
    }

    override get count() : number {return this.attr.get("count") ?? 1}
    override set count(val : number){this.attr.set("count", val)}

    override getDisplayInput(): (string | number)[] {
        return [this.count]
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : EffectDataGenerator.counter.count(1)()
        }
    }
}

export class serenityCounter extends genericCounter {}

export class generic_stat_change_diff extends StatusEffect_base {
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return [this.maxAtk, this.maxHp, this.level]
    }
    get maxAtk() {return this.attr.get("maxAtk") ?? 0}
    get maxHp() {return this.attr.get("maxHp") ?? 0}
    get level() {return this.attr.get("level") ?? 0}

    set maxAtk(val : number) {this.attr.set("maxAtk", val)}
    set maxHp(val : number) {this.attr.set("maxHp", val)}
    set level(val : number) {this.attr.set("level", val)}

    override parseStat(statObj: { level: number; maxAtk: number; maxHp: number; extensionArr: string[]; }): void {
        statObj.maxAtk += this.maxAtk;
        statObj.maxHp += this.maxHp;
        statObj.level += this.level;
    }

    override merge(mergeTargets: generic_stat_change_diff[]): generic_stat_change_diff[] {
        mergeTargets.forEach(i => {
            this.maxAtk += i.maxAtk
            this.maxHp += i.maxHp
            this.level += i.level
        })
        return [this];
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : EffectDataGenerator.status.num("maxAtk").num("maxHp").num("level")()
        }
    }
}

export class generic_stat_change_override extends StatusEffect_base {
    get maxAtk(): number | undefined {return this.attr.get("maxAtk")}
    get maxHp() : number | undefined {return this.attr.get("maxHp")}
    get level() : number | undefined {return this.attr.get("level")}

    set maxAtk(val : number) {this.attr.set("maxAtk", val)}
    set maxHp(val : number) {this.attr.set("maxHp", val)}
    set level(val : number) {this.attr.set("level", val)}

    override parseStat(statObj: { level: number; maxAtk: number; maxHp: number; extensionArr: string[]; }): void {
        if(this.maxAtk !== undefined) statObj.maxAtk = this.maxAtk;
        if(this.maxHp !== undefined) statObj.maxHp = this.maxHp;
        if(this.level !== undefined) statObj.level = this.level;
    }

    override merge(mergeTargets: generic_stat_change_override[]): generic_stat_change_override[] {
        if(mergeTargets.length === 0) return [this];
        return [mergeTargets.at(-1)! as generic_stat_change_override];
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : EffectDataGenerator.status.num("maxAtk").num("maxHp").num("level")()
        }
    }
}

export class e_automate_base extends StatusEffect_base {
    get countdown() : number {return this.attr.get("countdown") ?? 0};
    set countdown(a : number){this.attr.set("countdown", a)};

    protected act(c: CardDry, system: SystemDry, a: Action<"a_turn_end">): Action[] {return []}

    override activateOnTurnEnd(c: CardDry, system: SystemDry, a: Action<"a_turn_end">): Action[] {
        this.countdown--;
        if(this.countdown === 0) {
            //act
            return this.act(c, system, a)
        }
        return []
    }
}

export class e_automate_attack extends e_automate_base {
    protected override act(c: CardDry, s: SystemDry, a: Action<"a_turn_end">): Action[] {
        return [
            ActionGenerator.attack(s, c)(this.identity, {
                dmg : c.atk,
                dmgType : damageType.physical
            })
        ]
    }
}

export default {
    e_any_extension,
    e_generic_counter : genericCounter,
    e_generic_stat_change_diff : generic_stat_change_diff,
    e_generic_stat_change_override : generic_stat_change_override,
}