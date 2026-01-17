import type { inputData_card, inputData_zone, inputData_pos } from "../../index"
import type { dry_card, dry_system, dry_zone, dry_position } from "../../index"
import type {registryAPI, effectData, cardData} from "../../index"
import type { Action } from "../../index"
import { damageType, e_dmgcap } from "../../index"

import {ActionGenerator, Selector, Effect, zoneRegistry, GameModule, quickEffectData, quickCardData} from "../../index" 

class e_apple extends Effect<[inputData_card, inputData_zone]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return this.count !== 0
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: [dry_card, dry_zone]): Action[] {
        const [target, z] = input
        return [ActionGenerator.a_move(s, target)(z.top)(this.toCause(s, c))]
    }
    protected override getInputObj(ThisCard: dry_card, s: dry_system, a: Action){
        const i1 = Selector.deck(s, ThisCard).cards().ofSameName(ThisCard).once()
        const i2 = Selector.hand(s, ThisCard).once()
        return i1.then(i2)
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData() {
        return {
            base : quickEffectData.init.num("count", 1).localizationKey("e_natural_apple")(),
            upgrade : quickEffectData.init.num("count", 2).localizationKey("e_natural_apple_upgrade")(),
        }
    }
}

class e_banana extends Effect<[inputData_card, inputData_pos]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true //actual check in type
    }
    protected override getInputObj(ThisCard: dry_card, s: dry_system, a: Action){
        const temp = Selector.grave(s, ThisCard).cards().ofDifferentName(ThisCard)
        const i1 = this.doArchtypeCheck ? temp.ofArchtype("a_fruit").once() : temp.once()
        const i2 = Selector.field(s, ThisCard).pos().isEmpty().once()
        return i1.then(i2) 
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: [dry_card, dry_position]): Action[] {
        const [card, pos] = input
        return [ActionGenerator.a_move(s, card)(pos)(this.toCause(s, c))]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData(){
        return {
            base : quickEffectData.init.bool("doArchtypeCheck", 1).localizationKey("e_natural_banana")(),
            upgrade : quickEffectData.init.bool("doArchtypeCheck", 0).localizationKey("e_natural_banana_upgrade")(),
        }
    }
}

class e_cherry extends Effect<[inputData_zone, inputData_zone]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return this.count !== 0;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action){
        const i1 = Selector.deck(s, c).once()
        const i2 = Selector.hand(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: [dry_zone, dry_zone]): Action[] {
        const [deck, hand] = input
        const res : Action[] = []

        for(let i = 0; i < this.count; i++){
            res.push(
                deck.getAction_draw!(s, hand, this.toCause(s, c), false)
            )
        }  
        
        return res
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.count]
    }
    
    static override getEffData(){
        return {
            base : quickEffectData.init.count(1).localizationKey("e_natural_cherry")()
        }
    }
}

class e_lemon extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        const allTargets = Selector.field(s, c).cards().ofName(c.name).all()
        return allTargets.map(t => ActionGenerator.a_attack(s, t)(this.toCause(s, c), {
            dmg : t.atk,
            dmgType : damageType.physical
        }))
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }
    
    static override getEffData(){
        return {
            base : quickEffectData.init.localizationKey("e_natural_lemon")()
        }
    }
}

class e_pom extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return a.is("a_play", s, c, undefined, zoneRegistry.z_grave) && a.targets[0].is(c)
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        const allEnemies_exposed = Selector.enemy(s, c).isExposed().all()
        const allEnemies_covered = Selector.enemy(s, c).isCoverred().all()

        const d_exposed = this.attr.number("exposedDmg")
        const d_covered = this.attr.number("coveredDmg")

        const res : Action[] = []
        allEnemies_exposed.forEach(t => {
            res.push(ActionGenerator.a_deal_damage_card(s, t)(this.toCause(s, c), {
                dmg : d_exposed,
                dmgType : damageType.magic
            }))
        })
        allEnemies_covered.forEach(t => {
            res.push(ActionGenerator.a_deal_damage_card(s, t)(this.toCause(s, c), {
                dmg : d_covered,
                dmgType : damageType.magic
            }))
        })
        return res
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData(){
        return {
            base : quickEffectData.init.num("exposedDmg", 1).num("coveredDmg", 1).localizationKey("e_natural_pomegranate")(),
            upgrade : quickEffectData.init.num("exposedDmg", 2).num("coveredDmg", 1).localizationKey("e_natural_pomegranate_upgrade")(),
        }
    }
}

class e_pumpkin_init extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        const allTargets = Selector.field(s, c).cards().ofName(c.name).all()
        return allTargets.map(t => ActionGenerator.a_add_status_effect("e_generic_stat_change_diff", true)(s, t)(this.toCause(s, c), {
            maxHp : this.attr.number("hpInc")
        }))
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.attr.number("hpInc")]
    }

    static override getEffData(){
        return {
            base : quickEffectData.init.num("hpInc", 1).localizationKey("e_natural_pumpkin")(),
            upgrade : quickEffectData.init.num("hpInc", 2).localizationKey("e_natural_pumpkin")(),
        } as const
    }
}

class e_pumpkin_trigger extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return a.is("a_attack") && a.targets[0].is(c)
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        return [ActionGenerator.a_destroy(s, c)(this.toCause(s, c))]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }
    
    static override getEffData(){
        return {
            base : quickEffectData.trigger.localizationKey("e_natural_pumpkin_trigger")()
        }
    }
}

class e_demeter_condition extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        if(!a.is("a_play", s, c)) return false;
        const targets = Selector.grave(s, c).cards().ofLevel(1).ofArchtype("a_fruit").all()
        return targets.length < this.count
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action): Action[] {
        return []
    }
    override getDisplayInput(c: dry_card, s: dry_system): (string | number)[] {
        const targets = Selector.grave(s, c).cards().ofLevel(1).ofArchtype("a_fruit").all()
        return [this.count, targets.length]
    }
    
    static override getEffData(){
        return {
            base : quickEffectData.lock.count(1).localizationKey("e_natural_demeter_condition")()
        } as const
    }
}

class e_demeter_trigger extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return a.is("a_play", s, c, zoneRegistry.z_hand);
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action): Action[] {
        return [ActionGenerator.a_deal_damage_ahead(s, c)(this.toCause(s, c), {
            dmg : c.atk,
            dmgType : damageType.magic
        })]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }
    
    static override getEffData(){
        return {
            base : quickEffectData.trigger.fieldLock.unique.localizationKey("e_natural_demeter_trigger")()
        } as const
    }
}

class e_demeter_init extends Effect<[inputData_card, inputData_zone]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action){
        const i1 = Selector.grave(s, c).cards().ofLevel(1).once()
        const i2 = Selector.hand(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: [dry_card, dry_zone]): Action[] {
        const [targetCard, hand] = input
        const allTargets = Selector.grave(s, c).cards().ofName(targetCard.name).all()
        return allTargets.map(t => ActionGenerator.a_move(s, t)(hand.top)(this.toCause(s, c)))
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData(){
        return {
            base : quickEffectData.init.localizationKey("e_natural_demeter")()
        } as const
    }   
}

class e_autumn extends Effect<[inputData_zone, inputData_zone]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action){
        const i1 = Selector.deck(s, c).once()
        const i2 = Selector.hand(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: [dry_zone, dry_zone]): Action[] {
        const [deck, hand] = input
        const targets = Selector.field(s, c).cards().ofLevel(1).ofArchtype("a_fruit").all()
        let drawCount = targets.length
        const res : Action[] = targets.map(t => ActionGenerator.a_remove_all_effects(s, t)(this.toCause(s, c)))
        while(drawCount--)
            res.push(deck.getAction_draw!(s, hand, this.toCause(s, c), false));
        
        if(this.attr.number("atkInc") > 0){
            res.push(...targets.map(t => ActionGenerator.a_add_status_effect("e_generic_stat_change_diff", true)(s, t)(this.toCause(s, c), {
                maxAtk : this.attr.number("atkInc")
            })))
        }
        return res
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData(){
        return {
            base : quickEffectData.init.num("atkInc", 0).localizationKey("e_natural_fall")(),
            upgrade : quickEffectData.init.num("atkInc", 1).localizationKey("e_natural_fall_upgrade")(),
        } as const
    }
}

class e_spring extends Effect<[inputData_card, inputData_pos]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action){
        const i1 = Selector.grave(s, c).cards().ofLevelOrBelow(this.attr.number("targetLevel")).ofDifferentName(c).once()
        const i2 = Selector.field(s, c).pos().isEmpty().once()
        return i1.then(i2)
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: [dry_card, dry_position]): Action[] {
        const [t, pos] = input
        const incAtk = Math.min(Selector.grave(s, c).cards().ofName(t.name).all().length - 1, 3)
        const cause = this.toCause(s, c)
        return [
            ActionGenerator.a_duplicate_card(s, t)(pos)(cause, {
                callback(c) {
                    return incAtk ? [ActionGenerator.a_add_status_effect("e_generic_stat_change_diff", true)(s, c)(cause, {
                        maxAtk : incAtk
                    })] : []
                },
            })
        ]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.attr.number("targetLevel")]
    }

    static override getEffData(){
        return {
            base : quickEffectData.init.num("targetLevel", 1).localizationKey("e_natural_spring")(),
            upgrade : quickEffectData.init.num("targetLevel", 2).localizationKey("e_natural_spring")(),
        } as const
    }
}

class e_summer extends Effect<[inputData_card, inputData_zone]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action){
        const i1 = Selector.deck(s, c).cards().ofLevelOrBelow(this.attr.number("targetLevel")).ofArchtype("a_fruit").ofDifferentName(c).once()
        const i2 = Selector.hand(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: [dry_card, dry_zone]): Action[] {
        const [t, hand] = input
        return [ActionGenerator.a_move(s, t)(hand.top)(this.toCause(s, c))]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.attr.number("targetLevel")]
    }
    
    static override getEffData(){
        return {
            base : quickEffectData.init.num("targetLevel", 1).localizationKey("e_natural_summer")(),
            upgrade : quickEffectData.init.num("targetLevel", 3).localizationKey("e_natural_summer")(),
        } as const
    }
}

class e_winter_init extends Effect<[inputData_card, inputData_zone]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action){
        const i1 = Selector.deck(s, c).cards().ofArchtype("a_fruit").ofDifferentName(c).once()
        const i2 = Selector.grave(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: [dry_card, dry_zone]): Action[] {
        const [t, grave] = input
        const allCardsToSendToGrave = Selector.deck(s, c).cards().ofName(t.name).all()
        const res : Action[] = allCardsToSendToGrave.map(t => ActionGenerator.a_move(s, t)(grave.top)(this.toCause(s, c)))
        let count = allCardsToSendToGrave.length * this.attr.number("hpInc");
        const allCardsOnField = Selector.field(s, c).cards().all()
        allCardsOnField.forEach(t => {
            res.push(ActionGenerator.a_add_status_effect("e_generic_stat_change_diff", true)(s, t)(this.toCause(s, c), {
                maxHp : count
            }))
        })
        return res
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.attr.number("hpInc")]
    }

    static override getEffData(){
        return {
            base : quickEffectData.init.num("hpInc", 1).localizationKey("e_natural_winter")(),
            upgrade : quickEffectData.init.num("hpInc", 2).localizationKey("e_natural_winter")()
        } as const
    }
}

class e_greenhouse extends Effect<[inputData_card, inputData_zone]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        const thisField = s.getZoneOf(c)
        return (
            !!thisField && 
            thisField.is(zoneRegistry.z_field) && 
            a.is("a_play", s, c) && 
            thisField.isC2Behind(c, a.targets[0].card) &&
            a.targets[0].card.level <= this.attr.number("checkLevel")
        )
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action<"a_move">) {
        const i1 = Selector.grave(s, c).cards().ofName(a.targets[0].card.name).once()
        const i2 = Selector.hand(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: [dry_card, dry_zone]): Action[] {
        const [t, hand] = input
        return [ActionGenerator.a_move(s, t)(hand.top)(this.toCause(s, c))]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.attr.number("checkLevel")]
    }
    
    static override getEffData(){
        return {
            base : quickEffectData.trigger.fieldLock.unique.num("checkLevel", 1).localizationKey("e_natural_greenhouse")(),
            upgrade : quickEffectData.trigger.fieldLock.unique.num("checkLevel", 2).localizationKey("e_natural_greenhouse")(),
        } as const
    }
}

class e_growth extends Effect<[inputData_card, inputData_zone, inputData_zone]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action){
        const temp = Selector.grave(s, c).cards()
        const i1 = this.doArchtypeCheck ? temp.ofArchtype("a_fruit").once() : temp.once()
        const i2 = Selector.deck(s, c).once()
        const i3 = Selector.hand(s, c).once()
        return i1.then(i2).then(i3)
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: [dry_card, dry_zone, dry_zone]): Action[] {
        const [t, deck, hand] = input
        const allTargets = Selector.grave(s, c).cards().ofName(t.name).all();
        const res : Action[] = allTargets.map(t => ActionGenerator.a_move(s, t)(deck.top)(this.toCause(s, c)))
        let count = allTargets.length;
        while(count--){
            res.push(deck.getAction_draw!(s, hand, this.toCause(s, c), false))
        }
        return res
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [];
    }

    static override getEffData(){
        return {
            base : quickEffectData.init.bool("doArchtypeCheck", 1).localizationKey("e_natural_growth")(),
            upgrade : quickEffectData.init.bool("doArchtypeCheck", 0).localizationKey("e_natural_growth_upgrade")(),
        } as const
    }
}

class e_polination extends Effect<[inputData_card, inputData_zone]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action){
        const i1 = Selector.deck(s, c).cards().ofLevel(1).ofArchtype("a_fruit").hasEffects().once()
        const i2 = Selector.grave(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: [dry_card, dry_zone]): Action[] {
        const [t, grave] = input
        const targetEffect = t.effects[0]
        const temp = Selector.hand(s, c).cards().ofLevel(1)
        const allCardsInHand = this.doArchtypeCheck ? temp.ofArchtype("a_fruit").all() : temp.all()
        return [
            ActionGenerator.a_move(s, t)(grave.top)(this.toCause(s, c)),
            ...allCardsInHand.map(t2 => ActionGenerator.a_duplicate_effect(s, t, targetEffect)(t2)(this.toCause(s, c), {
                addedSubtype : ["e_st_once"]
            }))
        ]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }
    
    static override getEffData(){
        return {
            base : quickEffectData.init.bool("doArchtypeCheck", 1).localizationKey("e_natural_pollination")(),
            upgrade : quickEffectData.init.bool("doArchtypeCheck", 0).localizationKey("e_natural_pollination_upgrade")(),
        } as const
    }
}

class e_presephone_condition extends Effect<[]> {
    protected countDistinctName(c: dry_card, s: dry_system){
        const x = Selector.field(s, c).cards().ofArchtype("a_fruit").ofLevel(1).all()
        return new Set(x.map(x => x.name)).size
    }
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return this.countDistinctName(c, s) < 3
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        return []
    }
    override getDisplayInput(c: dry_card, s: dry_system): (string | number)[] {
        return [this.countDistinctName(c, s)]
    }
    
    static override getEffData(){
        return {
            base : quickEffectData.lock.localizationKey("e_natural_persephone_condition")()
        } as const
    }
}

class e_persephone_init extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        const allCardsOnField = Selector.field(s, c).cards().ofDifferentName(c).all()
        const count = allCardsOnField.length * 2
        return [
            ...allCardsOnField.map(t => ActionGenerator.a_void(s, t)(this.toCause(s, c))),
            ActionGenerator.a_add_status_effect("e_generic_stat_change_override", true)(s, c)(this.toCause(s, c), {
                maxAtk : count
            })
        ]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }
    
    static override getEffData(){
        return {
            base : quickEffectData.init.fieldLock.localizationKey("e_natural_persephone_init")()
        } as const
    }
}

class e_persephone_passive extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return c.atk > 0 && a.is("a_attack") && a.targets[0].is(c);
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        const allEnemies = Selector.enemy(s, c).all()
        let ammt = (c.atk >= 2) ? 2 : 1;
        return [
            ActionGenerator.a_add_status_effect("e_generic_stat_change_diff", true)(s, c)(this.toCause(s, c), {
                maxAtk : -ammt
            }),
            ...allEnemies.map(t => ActionGenerator.a_deal_damage_card(s, t)(this.toCause(s, c), {
                dmg : ammt,
                dmgType : damageType.magic
            }))
        ]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }
    
    static override getEffData(){
        return {
            base : quickEffectData.passive.fieldLock.localizationKey("e_natural_persephone_passive")()
        }
    }
}

const cards : Record<string, Omit<cardData, "id">> = {
    //white
    c_apple   : quickCardData.def.stat(2, 2).archtype("a_fruit").upgradeStat(3, 3).effect(e_apple).img("naturalApple")(),
    c_banana  : quickCardData.def.archtype("a_fruit").effect(e_banana).img("naturalBanana")(),
    c_cherry  : quickCardData.def.archtype("a_fruit").effect(e_cherry).img("naturalCherry")(),
    c_lemon   : quickCardData.def.stat(1, 2).archtype("a_fruit").upgradeStat(2, 2).effect(e_lemon).img("naturalLemon")(),
    c_pom     : quickCardData.def.archtype("a_fruit").effect(e_pom).img("naturalPomegranate")(),
    c_pumpkin : quickCardData.def.stat(3, 2).archtype("a_fruit").effect(e_pumpkin_init, e_pumpkin_trigger).img("naturalPumpkin")(),

    //green
    c_greenhouse : quickCardData.green.stat(0, 2).level(2).archtype("a_fruit").effect(e_greenhouse).img("naturalGreenhouse")(),
    c_pollination : quickCardData.green.archtype("a_fruit").effect(e_polination).img("naturalPollination")(),

    //blue
    c_growth : quickCardData.blue.archtype("a_fruit").effect(e_growth).img("naturalGrowth")(),
    c_spring : quickCardData.blue.stat(1, 2).archtype("a_fruit").effect(e_spring).img("naturalSpring")(),
    c_summer : quickCardData.blue.stat(1, 2).archtype("a_fruit").effect(e_summer).img("naturalSummer")(),
    c_autumn : quickCardData.blue.stat(1, 2).archtype("a_fruit").effect(e_autumn).img("naturalFall")(),
    c_winter : quickCardData.blue.stat(1, 2).archtype("a_fruit").upgradeStat(1, 3).effect(e_winter_init, [e_dmgcap, {dmgCap : 1}, {}]).img("naturalWinter")(),

    //red
    c_demeter : quickCardData.red.stat(2, 8).archtype("a_fruit").effect(e_demeter_init, e_demeter_trigger, e_demeter_condition).img("naturalDemeter")(),
    c_persephone : quickCardData.red.stat(0, 5).archtype("a_fruit").effect(e_persephone_init, e_persephone_passive, e_presephone_condition).img("naturalPersephone")(),
}

const allEffects = [
    e_apple, e_banana, e_cherry, e_lemon, e_pom, e_pumpkin_init, e_pumpkin_trigger, 
    e_greenhouse, e_polination,
    e_spring, e_summer, e_autumn, e_winter_init, e_growth,
    e_demeter_condition, e_demeter_init, e_demeter_trigger,
    e_persephone_init, e_persephone_passive, e_presephone_condition
]

export default class FruitModule extends GameModule {
    override load(API: registryAPI): void {
        allEffects.forEach(e => API.add_effect(e))
        Object.entries(cards).forEach(([key, data]) => {
            API.add_card(key, {id : key, ...data})
        })
    }
}
