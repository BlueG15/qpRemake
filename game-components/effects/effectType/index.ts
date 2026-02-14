import type { Action, SystemDry, EffectDry, CardDry } from "../../../core";
import { EffectControlCode, ActionGenerator, ZoneRegistry, Target } from "../../../core";
import { EffectModifier } from "../../../core/interface";

export class BlankEffectModifier extends EffectModifier {
    override canRespondAndActivate(eff: EffectDry, c: CardDry, system: SystemDry, a: Action): EffectControlCode {
        return EffectControlCode.DoNothingAndPass
    }
    override overrideActivateResults(eff: EffectDry, c: CardDry, system: SystemDry, res: Action[]): Action[] {
        return res
    }
}

export class Trigger extends EffectModifier {
    canRespondAndActivate(e : EffectDry, c: CardDry, system: SystemDry, a: Action){
        //enforces only respond in the trigger phase
        //if and only if no subtype overrides the result
        //this function only runs if no override happens 
        if(!system.isInTriggerPhase) return EffectControlCode.ForceFalse;
        return EffectControlCode.DoNothingAndPass;
    }

    overrideActivateResults(e : EffectDry, c: CardDry, system: SystemDry, res: Action[]) {
        res.forEach(i => i.isChain = false);
        return res
    }
}

export class Passive extends EffectModifier {
    //behaviors:
    //1. every action returns have isChain = true
    //2. activates only in the chain phase
    //3. when condition met -> returns the Action[] itself
    canRespondAndActivate(e : EffectDry, c: CardDry, system: SystemDry, a: Action) {
        //enforces only respond in the chain phase
        if(!system.isInChainPhase) return EffectControlCode.ForceFalse;
        return EffectControlCode.DoNothingAndPass;
    }

    overrideActivateResults(e : EffectDry, c: CardDry, system: SystemDry, res: Action[]) {
        res.forEach(i => i.isChain = true);
        return res;
    }
}  

export class Manual extends EffectModifier {
    //behaviors:
    //manual effect uhh just sits there, until the action "activate effect" forcefull activate it

    canRespondAndActivate(e : EffectDry, c: CardDry, system: SystemDry, a: Action){
        return EffectControlCode.ForceFalse;
    }

    overrideActivateResults(e : EffectDry, c: CardDry, system: SystemDry, res: Action[]) {
        return [
            ...res,
            ActionGenerator.a_disable_card(c)(c.identity)
        ]
    }
}

export class Lock extends Passive {
    override canRespondAndActivate(e : EffectDry, c: CardDry, s: SystemDry, a: Action) {
        //enforces only respond in the chain phase
        if(!a.is("a_play", s, c, ZoneRegistry.hand, ZoneRegistry.field)) return EffectControlCode.ForceFalse;
        if(!a.targets[0].data.is(c)) return EffectControlCode.ForceFalse;
        if(s.turnAction && s.turnAction.id !== a.id) return EffectControlCode.ForceFalse;
        return super.canRespondAndActivate(e, c, s, a);
    }

    override overrideActivateResults(e : EffectDry, c: CardDry, system: SystemDry, res: Action[]) {
        return [
            ActionGenerator.a_negate_action(e.identity, {}),
            ...res
        ]
    }
}  

export class Init extends Trigger {
    override canRespondAndActivate(e : EffectDry, c: CardDry, s: SystemDry, a: Action){
        if(!a.is("a_play", s, c)) return EffectControlCode.ForceFalse
        return super.canRespondAndActivate(e, c, s, a);
    }
}
