import type { 
    Action,

    TargetCard,
    TargetZone,
    TargetPos,

    CardDry,
    SystemDry,
    ZoneDry,
    PositionDry,
    CardDataWithVariantKeys,
} from "../../index"

import {
    ActionGenerator, 
    
    Effect,
    EffectData,
    CardData,

    DamageType,
    e_dmgcap,

    Request,
    ModdingAPI,
    ZoneRegistry,
    generic_stat_change_diff,
    generic_stat_change_override,
} from "../../index" 

const FRUIT_ARCHTYPEID = ModdingAPI.addArchtype("fruit", "fruit")

class apple extends Effect<[TargetCard, TargetZone]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return this.count !== 0
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: [CardDry, ZoneDry]): Action[] {
        const [target, z] = input
        return [ActionGenerator.a_move(target)(z.top)(this.identity)]
    }
    protected override getInputObj(ThisCard: CardDry, s: SystemDry, a: Action){
        const i1 = Request.deck(s, ThisCard).cards().ofSameName(ThisCard).once()
        const i2 = Request.hand(s, ThisCard).once()
        return i1.then(i2)
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData() {
        return EffectData.init.num("count", 1).localizationKey("e_natural_apple").upgrade(
            EffectData.init.num("count", 2).localizationKey("e_natural_apple_upgrade"),
        )
    }
}

class banana extends Effect<[TargetCard, TargetPos]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true //actual check in type
    }
    protected override getInputObj(ThisCard: CardDry, s: SystemDry, a: Action){
        const temp = Request.grave(s, ThisCard).cards().ofDifferentName(ThisCard)
        const i1 = this.doArchtypeCheck ? temp.ofArchtype(FRUIT_ARCHTYPEID).once() : temp.once()
        const i2 = Request.field(s, ThisCard).pos().isEmpty().once()
        return i1.then(i2) 
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: [CardDry, PositionDry]): Action[] {
        const [card, pos] = input
        return [ActionGenerator.a_move(card)(pos)(this.identity)]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(){
        return EffectData.init.bool("doArchtypeCheck", 1).localizationKey("e_natural_banana").upgrade(
            EffectData.partial.bool("doArchtypeCheck", 0).localizationKey("e_natural_banana_upgrade"),
        )
    }
}

class cherry extends Effect<[TargetZone, TargetZone]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return this.count !== 0;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action){
        const i1 = Request.deck(s, c).once()
        const i2 = Request.hand(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: [ZoneDry, ZoneDry]): Action[] {
        const [deck, hand] = input
        const res : Action[] = []

        for(let i = 0; i < this.count; i++){
            res.push(
                ActionGenerator.a_draw(deck)(hand)(this.identity, {
                    isTurnDraw : false
                })
            )
        }  
        
        return res
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return [this.count]
    }
    
    static override getEffData(){
        return EffectData.init.count(1).localizationKey("e_natural_cherry")
    }
}

class lemon extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        const allTargets = Request.field(s, c).cards().ofSameName(c).all()
        return allTargets.map(t => ActionGenerator.a_attack(t)(this.identity, {
            dmg : t.atk,
            dmgType : DamageType.physical
        }))
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }
    
    static override getEffData(){
        return EffectData.init.localizationKey("e_natural_lemon")
    }
}

class pom extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return a.is("a_play", s, c, undefined, ZoneRegistry.grave) && a.targets[0].is(c)
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        const allEnemies_exposed = Request.enemy(s, c).isExposed().all()
        const allEnemies_covered = Request.enemy(s, c).isCoverred().all()

        const d_exposed = this.attr.number("exposedDmg")
        const d_covered = this.attr.number("coveredDmg")

        const res : Action[] = []
        allEnemies_exposed.forEach(t => {
            res.push(ActionGenerator.a_deal_damage_card(t)(this.identity, {
                dmg : d_exposed,
                dmgType : DamageType.magic
            }))
        })
        allEnemies_covered.forEach(t => {
            res.push(ActionGenerator.a_deal_damage_card(t)(this.identity, {
                dmg : d_covered,
                dmgType : DamageType.magic
            }))
        })
        return res
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(){
        return EffectData.init.num("exposedDmg", 1).num("coveredDmg", 1).localizationKey("e_natural_pomegranate").upgrade(
            EffectData.partial.num("exposedDmg", 2).localizationKey("e_natural_pomegranate_upgrade"),
        )
    }
}

class pumpkin_init extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        const allTargets = Request.field(s, c).cards().ofName(c.name).all()
        return allTargets.map(t => ActionGenerator.a_add_status_effect(generic_stat_change_diff)(t)(this.identity, {
            maxHp : this.attr.number("hpInc")
        }))
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return [this.attr.number("hpInc")]
    }

    static override getEffData(){
        return EffectData.init.num("hpInc", 1).localizationKey("e_natural_pumpkin").upgrade({
            hpInc : 2
        })
    }
}

class pumpkin_trigger extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return a.is("a_attack") && a.targets[0].data.is(c)
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        return [ActionGenerator.a_destroy(c)(this.identity)]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }
    
    static override getEffData(){
        return EffectData.trigger.localizationKey("e_natural_pumpkin_trigger")
    }
}

class demeter_condition extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        if(!a.is("a_play", s, c)) return false;
        const targets = Request.grave(s, c).cards().ofLevel(1).ofArchtype(FRUIT_ARCHTYPEID).all()
        return targets.length < this.count
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action): Action[] {
        return []
    }
    override getDisplayInput(c: CardDry, s: SystemDry): (string | number)[] {
        const targets = Request.grave(s, c).cards().ofLevel(1).ofArchtype(FRUIT_ARCHTYPEID).all()
        return [this.count, targets.length]
    }
    
    static override getEffData(){
        return EffectData.lock.count(1).localizationKey("e_natural_demeter_condition")
    }
}

class demeter_trigger extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return a.is("a_play", s, c, ZoneRegistry.hand);
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action): Action[] {
        return [ActionGenerator.a_deal_damage_ahead(c)(this.identity, {
            dmg : c.atk,
            dmgType : DamageType.magic
        })]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }
    
    static override getEffData(){
        return EffectData.trigger.fieldLock.unique.localizationKey("e_natural_demeter_trigger")
    }
}

class demeter_init extends Effect<[TargetCard, TargetZone]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action){
        const i1 = Request.grave(s, c).cards().ofLevel(1).once()
        const i2 = Request.hand(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: [CardDry, ZoneDry]): Action[] {
        const [targetCard, hand] = input
        const allTargets = Request.grave(s, c).cards().ofName(targetCard.name).all()
        return allTargets.map(t => ActionGenerator.a_move(t)(hand.top)(this.identity))
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(){
        return EffectData.init.localizationKey("e_natural_demeter")
    }   
}

class autumn extends Effect<[TargetZone, TargetZone]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action){
        const i1 = Request.deck(s, c).once()
        const i2 = Request.hand(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: [ZoneDry, ZoneDry]): Action[] {
        const [deck, hand] = input
        const targets = Request.field(s, c).cards().ofLevel(1).ofArchtype(FRUIT_ARCHTYPEID).all()
        let drawCount = targets.length
        const res : Action[] = targets.map(t => ActionGenerator.a_remove_all_effects(t)(this.identity))
        while(drawCount--)
            // res.push(deck.getAction_draw!(s, hand, this.identity, false));
            res.push(ActionGenerator.a_draw(deck)(hand)(this.identity, {
                isTurnDraw : false
            }))
        
        if(this.attr.number("atkInc") > 0){
            res.push(...targets.map(t => ActionGenerator.a_add_status_effect(generic_stat_change_diff)(t)(this.identity, {
                maxAtk : this.attr.number("atkInc")
            })))
        }
        return res
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(){
        return EffectData.init.num("atkInc", 0).localizationKey("e_natural_fall").upgrade(
            EffectData.partial.num("atkInc", 1).localizationKey("e_natural_fall_upgrade"),
        )
    }
}

class spring extends Effect<[TargetCard, TargetPos]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action){
        const i1 = Request.grave(s, c).cards().ofLevelOrBelow(this.attr.number("targetLevel")).ofDifferentName(c).once()
        const i2 = Request.field(s, c).pos().isEmpty().once()
        return i1.then(i2)
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: [CardDry, PositionDry]): Action[] {
        const [t, pos] = input
        const incAtk = Math.min(Request.grave(s, c).cards().ofName(t.name).all().length - 1, 3)
        const cause = this.identity
        return [
            ActionGenerator.a_duplicate_card(t)(pos)(cause, {
                callback(c) {
                    return incAtk ? [ActionGenerator.a_add_status_effect(generic_stat_change_diff)(c)(cause, {
                        maxAtk : incAtk
                    })] : []
                },
            })
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return [this.attr.number("targetLevel")]
    }

    static override getEffData(){
        return EffectData.init.num("targetLevel", 1).localizationKey("e_natural_spring").upgrade(
            EffectData.partial.num("targetLevel", 2).localizationKey("e_natural_spring"),
        )
    }
}

class summer extends Effect<[TargetCard, TargetZone]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action){
        const i1 = Request.deck(s, c).cards().ofLevelOrBelow(this.attr.number("targetLevel")).ofArchtype(FRUIT_ARCHTYPEID).ofDifferentName(c).once()
        const i2 = Request.hand(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: [CardDry, ZoneDry]): Action[] {
        const [t, hand] = input
        return [ActionGenerator.a_move(t)(hand.top)(this.identity)]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return [this.attr.number("targetLevel")]
    }
    
    static override getEffData(){
        return EffectData.init.num("targetLevel", 1).localizationKey("e_natural_summer").upgrade(
            EffectData.partial.num("targetLevel", 3).localizationKey("e_natural_summer"),
        )
    }
}

class winter_init extends Effect<[TargetCard, TargetZone]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action){
        const i1 = Request.deck(s, c).cards().ofArchtype(FRUIT_ARCHTYPEID).ofDifferentName(c).once()
        const i2 = Request.grave(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: [CardDry, ZoneDry]): Action[] {
        const [t, grave] = input
        const allCardsToSendToGrave = Request.deck(s, c).cards().ofName(t.name).all()
        const res : Action[] = allCardsToSendToGrave.map(t => ActionGenerator.a_move(t)(grave.top)(this.identity))
        let count = allCardsToSendToGrave.length * this.attr.number("hpInc");
        const allCardsOnField = Request.field(s, c).cards().all()
        allCardsOnField.forEach(t => {
            res.push(ActionGenerator.a_add_status_effect(generic_stat_change_diff)(t)(this.identity, {
                maxHp : count
            }))
        })
        return res
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return [this.attr.number("hpInc")]
    }

    static override getEffData(){
        return EffectData.init.num("hpInc", 1).localizationKey("e_natural_winter").upgrade(
            EffectData.partial.num("hpInc", 2).localizationKey("e_natural_winter")
        )
    }
}

class greenhouse extends Effect<[TargetCard, TargetZone]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        const thisField = s.getZoneOf(c)
        return (
            !!thisField && 
            thisField.is(ZoneRegistry.field) && 
            a.is("a_play", s, c) && 
            thisField.isC2Behind(c, a.targets[0]) &&
            a.targets[0].data.level <= this.attr.number("checkLevel")
        )
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action<"a_move">) {
        const i1 = Request.grave(s, c).cards().ofName(a.targets[0].data.name).once()
        const i2 = Request.hand(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: [CardDry, ZoneDry]): Action[] {
        const [t, hand] = input
        return [ActionGenerator.a_move(t)(hand.top)(this.identity)]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return [this.attr.number("checkLevel")]
    }
    
    static override getEffData(){
        return EffectData.trigger.fieldLock.unique.num("checkLevel", 1).localizationKey("e_natural_greenhouse").upgrade(
            EffectData.partial.num("checkLevel", 2).localizationKey("e_natural_greenhouse")
        )
    }
}

class growth extends Effect<[TargetCard, TargetZone, TargetZone]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action){
        const temp = Request.grave(s, c).cards()
        const i1 = this.doArchtypeCheck ? temp.ofArchtype(FRUIT_ARCHTYPEID).once() : temp.once()
        const i2 = Request.deck(s, c).once()
        const i3 = Request.hand(s, c).once()
        return i1.then(i2).then(i3)
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: [CardDry, ZoneDry, ZoneDry]): Action[] {
        const [t, deck, hand] = input
        const allTargets = Request.grave(s, c).cards().ofName(t.name).all();
        const res : Action[] = allTargets.map(t => ActionGenerator.a_move(t)(deck.top)(this.identity))
        let count = allTargets.length;
        while(count--){
            res.push(ActionGenerator.a_draw(deck)(hand)(this.identity, {
                isTurnDraw : false
            }))
        }
        return res
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return [];
    }

    static override getEffData(){
        return EffectData.init.bool("doArchtypeCheck", 1).localizationKey("e_natural_growth").upgrade(
            EffectData.partial.bool("doArchtypeCheck", 0).localizationKey("e_natural_growth_upgrade"),
        )
    }
}

class polination extends Effect<[TargetCard, TargetZone]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action){
        const i1 = Request.deck(s, c).cards().ofLevel(1).ofArchtype(FRUIT_ARCHTYPEID).hasEffects().once()
        const i2 = Request.grave(s, c).once()
        return i1.then(i2)
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: [CardDry, ZoneDry]): Action[] {
        const [t, grave] = input
        const targetEffect = t.effects[0]
        const temp = Request.hand(s, c).cards().ofLevel(1)
        const allCardsInHand = this.doArchtypeCheck ? temp.ofArchtype(FRUIT_ARCHTYPEID).all() : temp.all()
        return [
            ActionGenerator.a_move(t)(grave.top)(this.identity),
            ...allCardsInHand.map(t2 => ActionGenerator.a_duplicate_effect(targetEffect, t)(t2)(this.identity, {
                addedSubtype : ["e_st_once"]
            }))
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }
    
    static override getEffData(){
        return EffectData.init.bool("doArchtypeCheck", 1).localizationKey("e_natural_pollination").upgrade(
            EffectData.partial.bool("doArchtypeCheck", 0).localizationKey("e_natural_pollination_upgrade"),
        )
    }
}

class presephone_condition extends Effect<[]> {
    protected countDistinctName(c: CardDry, s: SystemDry){
        const x = Request.field(s, c).cards().ofArchtype(FRUIT_ARCHTYPEID).ofLevel(1).all()
        return new Set(x.map(x => x.name)).size
    }
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return this.countDistinctName(c, s) < 3
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        return []
    }
    override getDisplayInput(c: CardDry, s: SystemDry): (string | number)[] {
        return [this.countDistinctName(c, s)]
    }
    
    static override getEffData(){
        return EffectData.lock.localizationKey("e_natural_persephone_condition")
    }
}

class persephone_init extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        const allCardsOnField = Request.field(s, c).cards().ofDifferentName(c).all()
        const count = allCardsOnField.length * 2
        return [
            ...allCardsOnField.map(t => ActionGenerator.a_void(t)(this.identity)),
            ActionGenerator.a_add_status_effect(generic_stat_change_override)(c)(this.identity, {
                maxAtk : count
            })
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }
    
    static override getEffData(){
        return EffectData.init.fieldLock.localizationKey("e_natural_persephone_init")
    }
}

class persephone_passive extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return c.atk > 0 && a.is("a_attack") && a.targets[0].is(c);
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        const allEnemies = Request.enemy(s, c).all()
        let ammt = (c.atk >= 2) ? 2 : 1;
        return [
            ActionGenerator.a_add_status_effect(generic_stat_change_diff)(c)(this.identity, {
                maxAtk : -ammt
            }),
            ...allEnemies.map(t => ActionGenerator.a_deal_damage_card(t)(this.identity, {
                dmg : ammt,
                dmgType : DamageType.magic
            }))
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }
    
    static override getEffData(){
        return EffectData.passive.fieldLock.localizationKey("e_natural_persephone_passive")
    }
}

const allEffects = [
    apple, banana, cherry, lemon, pom, pumpkin_init, pumpkin_trigger, 
    greenhouse, polination,
    spring, summer, autumn, winter_init, growth,
    demeter_condition, demeter_init, demeter_trigger,
    persephone_init, persephone_passive, presephone_condition
]

//add all effects
allEffects.forEach(e => ModdingAPI.addEffect(e))

const cards : Record<string, () => CardDataWithVariantKeys> = {
    // def used to be stat(0, 1) rarity white, level 1 
    //white
    apple   : CardData.white.level(1).stat(2, 2).ofArchtype(FRUIT_ARCHTYPEID).effects(apple).img("naturalApple").upgradeStat(3, 3),
    banana  : CardData.white.level(1).stat(0, 1).ofArchtype(FRUIT_ARCHTYPEID).effects(banana).img("naturalBanana"),
    cherry  : CardData.white.level(1).stat(0, 1).ofArchtype(FRUIT_ARCHTYPEID).effects(cherry).img("naturalCherry"),
    lemon   : CardData.white.level(1).stat(0, 1).ofArchtype(FRUIT_ARCHTYPEID).effects(lemon).img("naturalLemon").upgradeStat(2, 2),
    pom     : CardData.white.level(1).stat(0, 1).ofArchtype(FRUIT_ARCHTYPEID).effects(pom).img("naturalPomegranate"),
    pumpkin : CardData.white.level(1).stat(3, 2).ofArchtype(FRUIT_ARCHTYPEID).effects(pumpkin_init, pumpkin_trigger).img("naturalPumpkin"),

    //green
    greenhouse  : CardData.green.level(2).stat(0, 2).ofArchtype(FRUIT_ARCHTYPEID).effects(greenhouse).img("naturalGreenhouse"),
    pollination : CardData.green.level(1).stat(0, 1).ofArchtype(FRUIT_ARCHTYPEID).effects(polination).img("naturalPollination"),

    //blue
    growth : CardData.blue.stat(0, 1).ofArchtype(FRUIT_ARCHTYPEID).effects(growth).img("naturalGrowth"),
    spring : CardData.blue.stat(1, 2).ofArchtype(FRUIT_ARCHTYPEID).effects(spring).img("naturalSpring"),
    summer : CardData.blue.stat(1, 2).ofArchtype(FRUIT_ARCHTYPEID).effects(summer).img("naturalSummer"),
    autumn : CardData.blue.stat(1, 2).ofArchtype(FRUIT_ARCHTYPEID).effects(autumn).img("naturalFall"),
    winter : CardData.blue.stat(1, 2).ofArchtype(FRUIT_ARCHTYPEID).effects(winter_init, [e_dmgcap, {dmgCap : 1}]).img("naturalWinter").upgradeStat(1, 3),

    //red
    demeter    : CardData.red.stat(2, 8).ofArchtype(FRUIT_ARCHTYPEID).effects(demeter_init, demeter_trigger, demeter_condition).img("naturalDemeter"),
    persephone : CardData.red.stat(0, 5).ofArchtype(FRUIT_ARCHTYPEID).effects(persephone_init, persephone_passive, presephone_condition).img("naturalPersephone"),
}

Object.entries(cards).forEach(([name, data]) => {
    ModdingAPI.addCard(name, data)
})