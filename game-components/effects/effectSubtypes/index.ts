import type { Action, SystemDry, EffectDry, CardDry } from "../../../core";
import { EffectModifier, EffectControlCode, ActionGenerator, Target, ZoneRegistry } from "../../../core";

export class Unique extends EffectModifier {
    override canRespondAndActivate(e: EffectDry, c : CardDry, system: SystemDry, a: Action){
        //unique is once per turn per copy of the effect
        //essentially once per effect unique ID
        if (system.hasEffectActivated(e)) return EffectControlCode.ForceFalse;
        return EffectControlCode.DoNothingAndPass;
    }

    override overrideActivateResults(eff: EffectDry, c: CardDry, system: SystemDry, res: Action[]): Action[] {
        return res
    }
}

export class Once extends EffectModifier {
    private triggered : boolean = false
    override canRespondAndActivate(e: EffectDry, c: CardDry, system: SystemDry, a: Action){
        if (this.triggered) return EffectControlCode.ForceFalse;
        return EffectControlCode.DoNothingAndPass;
    }

    override overrideActivateResults(e: EffectDry, c: CardDry, system: SystemDry, a: Action[]){
        this.triggered = true
        return a;
    }

    resetOnce(){
        this.triggered = false
    }
}

export class Instant extends EffectModifier {
    override canRespondAndActivate(eff: EffectDry, c: CardDry, system: SystemDry, a: Action): EffectControlCode {
        return EffectControlCode.DoNothingAndPass
    }
    override overrideActivateResults(e: EffectDry, c: CardDry, system: SystemDry, a: Action[]){
        return [
            ActionGenerator.modify_action("a_turn_end")(system, system.getRootAction())(
                Target.effectSubType(this))({
                    doIncreaseTurnCount : false
            }),
            ...a
        ]
    }
}

export class Chained extends EffectModifier {
    override canRespondAndActivate(e: EffectDry, c: CardDry, system: SystemDry, a: Action){
        if (!system.isInChainPhase) return EffectControlCode.ForceFalse;
        return EffectControlCode.DoNothingAndIgnoreType;
    }

    override overrideActivateResults(e: EffectDry, c: CardDry, system: SystemDry, res: Action[]){
        res.forEach(i => i.isChain = true)
        return res;
    }
}

export class Delayed extends EffectModifier {
    override overrideActivateResults(eff: EffectDry, c: CardDry, system: SystemDry, res: Action[]): Action[] {
        return res
    }
    override canRespondAndActivate(e: EffectDry, c: CardDry, system: SystemDry, a: Action) {
        if (!system.isInTriggerPhase) return EffectControlCode.ForceFalse;
        return EffectControlCode.DoNothingAndIgnoreType;
    }
}

export class FieldLock extends EffectModifier {
    override canRespondAndActivate(e: EffectDry, c: CardDry, system: SystemDry, a: Action){
        //fieldLock effects can only be activated on field
        //jkong say this is by default how a trigger works
        //i dont like it, so i make it a new subtype
        let zone = system.getZoneWithID(c.pos.zoneID)
        if(!zone) return EffectControlCode.ForceFalse;
        if(zone.is(ZoneRegistry.field)) return EffectControlCode.DoNothingAndPass;
        return EffectControlCode.ForceFalse;
    }
    override overrideActivateResults(eff: EffectDry, c: CardDry, system: SystemDry, res: Action[]): Action[] {
        return res
    }
}

export class GraveLock extends EffectModifier {
    override canRespondAndActivate(e: EffectDry, c: CardDry, system: SystemDry, a: Action) {
        let zone = system.getZoneWithID(c.pos.zoneID)
        if(!zone) return EffectControlCode.ForceFalse;
        if(zone.is(ZoneRegistry.field)) return EffectControlCode.DoNothingAndPass;
        return EffectControlCode.ForceFalse;
    }
    override overrideActivateResults(eff: EffectDry, c: CardDry, system: SystemDry, res: Action[]): Action[] {
        return res
    }
}

export class HandOrFieldLock extends EffectModifier {
    override canRespondAndActivate(e: EffectDry, c: CardDry, system: SystemDry, a: Action){
        let zone = system.getZoneWithID(c.pos.zoneID)
        if(!zone) return EffectControlCode.ForceFalse;
        if(zone.is(ZoneRegistry.field)) return EffectControlCode.DoNothingAndPass;
        return EffectControlCode.ForceFalse;
    }
    override overrideActivateResults(eff: EffectDry, c: CardDry, system: SystemDry, res: Action[]): Action[] {
        return res
    }
}

export class HardUnique extends EffectModifier {
    override canRespondAndActivate(e: EffectDry, c: CardDry, system: SystemDry, a: Action){
        //hardUnique is once per turn per card
        if (
            system.hasCardActivated(c)
        ) return EffectControlCode.ForceFalse;
        return EffectControlCode.DoNothingAndPass;
    }
    override overrideActivateResults(eff: EffectDry, c: CardDry, system: SystemDry, res: Action[]): Action[] {
        return res
    }
}