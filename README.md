# qpremake

TypeScript/JavaScript card-effect engine for **Quantum Protocol** (i.e **Yu-Gi-Oh**) style gameplay.

> Quantum Protocol and Jkong reserve all rights to the original game and assets.

This README documents the current API and project structure for `v1.6.x`.

## Install

```bash
npm i qpremake
```

`qpremake` is published as CommonJS with type definitions.

## Quick start

```ts
import {
  QueenSystem,
  DefaultSetting,
  DefaultLayout,
  DefaultRenderer,
  PlayerTypeID,
  DeckDataRegistry,
} from "qpremake";

async function main() {
  const setting = new DefaultSetting();
  const renderer = new DefaultRenderer();
  const layout = new DefaultLayout();

  const system = new QueenSystem(setting, layout, renderer);

  system.addPlayers(PlayerTypeID.player, DeckDataRegistry.oops_all_blank);
  system.addPlayers(PlayerTypeID.enemy, DeckDataRegistry.null_deck);

  await system.load();
  system.start();
}

main();
```

### Important notes for new users

- There is **no default export**. Use named imports from `qpremake`.
- `load()` must be awaited before `start()`.
- The engine is renderer-driven: gameplay pauses and waits for renderer callbacks.

## Core concepts

### `QueenSystem`

Main game engine. Typical lifecycle:

1. Create a `QueenSystem` with `setting`, `layout`, and `renderer`.
2. Add players with `addPlayers(playerType, deckId)`.
3. Call `await load()`.
4. Call `start()`.

Useful methods:

- `addPlayers(type, deck, heart?, maxHeart?)`
- `load(gamestate?)`
- `start()`
- `continue(...)` (used by renderer callbacks)
- `toSerialized()`

### Settings

Use `DefaultSetting` for a sane baseline. Important fields you can override:

- `mods`: game module file names to load.
- `modFolder_game`, `modFolder_parser`: module directories.
- `parser_modules`: parser module names to load.
- `auto_input`: behavior for automatic input resolution.

What anything specicially means, refer to the section below

### Built-in helpers

The package exports registries and constructors used frequently by consumers:

- Registries: `DeckDataRegistry`, `CardDataRegistry`, `ZoneRegistry`, `OperatorRegistry`, etc.
- Action creation: `ActionGenerator`.
- Target helpers: `Target`.
- Default runtime pieces: `DefaultRenderer`, `DefaultLayout`, `DefaultSetting`.

For specifically what anything is, refer to the section `Game Components` below

## Renderer

Your renderer must implement `qpRenderer`:

```ts
interface qpRenderer {
  gameStart(s, callback): void;
  turnStart(s, callback): void;
  update(phase, s, action, callback): void;
  requestInput(inputRequest, phase, s, action, callback): void;
}
```

How control flow works:

- `QueenSystem` calls a renderer method.
- Engine pauses.
- Renderer must call the provided callback to resume processing.
- If callback is never called, the game loop remains paused.

`DefaultRenderer` is a minimal implementation that logs events and immediately continues.

## Modding

Mods are loaded via settings (`mods`, `modFolder_game`, `modFolder_parser`) during `load()`.

For runtime extension and registry changes, use `ModdingAPI`:

- `ModdingAPI.addCard(...)`
- `ModdingAPI.addEffect(...)`
- `ModdingAPI.addEffectType(...)`
- `ModdingAPI.addEffectSubtype(...)`
- `ModdingAPI.addZone(...)`
- `ModdingAPI.addDeck(...)`
- `ModdingAPI.addOperator(...)`
- `ModdingAPI.addGameRule(...)`

`ModdingAPI` is bound to the active `QueenSystem` during `load()`.

Mods can import this object and apply changes directly, the system do not care about mod exports.

For specifically what anything is, refer to the section `Game Components` below

## Development

### Run checks

```bash
npx tsc --noEmit
npm test
```

### Repository layout (high level)

- `queen-system/`: game loop and processing engine.
- `core/`: registries, interfaces / abstract classes and types.
- `game-components/`: game objects like Card or Effect.
- `system-components/`: system services like Localizer, Renderer, etc.
- `_mods/`: the default mod folder, it has mods in it.
- `testFile.ts`: basic integration test entrypoint used by `npm test`.

## Game Component Specifics

### Overall structure

QueenSystem employs a tier permission system where every layer manages everything belows

The system manages Action and Zone, Zone manages Card, Card manages Effect

If a layer below needs access to the ones above, it needs to be passed in as a parameter.

### Actions and Action Resolution methods

**Actions** are staic data only objects to tell system what to do next. Effects "activates" by returning a list of Actions the system can then process. Sort of like API calls.

#### How to create an action

One can create a default Action Object via the ```ActionGenerator```. This one uses Functional currying to generically typed each and every default Actions.

An example ActionGenerator call is

```ts
ActionGenerator.a_move(card)(pos)(cause)
```

Notice the cause parameter, this is requried for every Action and can be fulfilled by any Target Object. This is to indicate which things caused that Action to be created.

> Also notice there is a prefix a_ before everything, I tried removing this but it broke the delicate type system so am not touching that again.

#### How to make a custom Action

If one were to make their own Actions, the base Action class is available via ```ActionBase```. 

There is also the method ```ActionAssembler```, Which takes in a list of ```(...p : any) => Target``` and optionally a last Object and returns a curry function that eventually fulfills every every of those function and returns an Action. This is the internal way to mass create Actions. 

An example of an ```ActionAssembler``` call is:

```ts
a_shuffle: ActionAssembler("a_shuffle", Target.zone, {
    shuffleMap : {} as Map<number, number>
}),
```

This returns (z : DryZone) => (extraObj : {shuffleMap : Map<number, number>}) => ActionBase 

> This is poorly documented at the moment since there is no need to add custom Actions. Contact me if this is specifcally challenging.

> Why use currying? idk tbh, it works tho, no?

#### Action Resolutions - Selection

Actions in qp is resolved or responded to by into more Actions, this is internally a forrest of trees.

> Chained Actions are attached to the node, wheras non-chained starts new trees.

The system select which action to execute next by traversing the forest, then traverses the tree in-order (even when the tree is modified, the 1st in-order node is executed, then repeat.)

#### Action Resolutions - Game phases

Action handling in qp is broken into 7 phases for each Action:

1. Declare
2. Input handling
3. Chain
4. Resolve
5. Trigger
6. Complete

Where if nothing happens, an action moves to the next phase.

Input handling is not documented rn, right now we talk about **Chain**, **Resolve** and **Trigger**.

+ **Chain** allows an opportunity for any other game components (mostly Effects) to respond to the current Action with more Actions. These new Actions may be attached to the currest Action, which gets resolved **before** the current action since they are more "bottom" than this one.

+ **Resolve** is where the actual steps (data modification) asociates with the actions are run.

+ **Trigger** is the same as **Chain**, provides an opportunity for everything to respond. But notice Trigger happens after resolve, which means everything here respond **after** the action has resolved. 

#### Action Resolutions - GameRules

GameRules govern how an Action is actually resolved. This also emcompasses Field Effects and whatnot.

For anyone wanting to make their own GameRules, The Base class is available through 
```ts
GameRule<T_expect_action extends ActionName | undefined | "a_all" = ActionName | undefined | "a_all">
```

T_expect_action tells the system what the GameRule can respond to, optimize a bit on the GameRule selection algorithm. Setting this to undefined means that GameRule responds to everything. Setting this to "a_all" means the GameRule performs global Actions on the whole current Action[] (before this Action[] gets added to the forest).

The methods / properties of a GameRule is:

+ group (optional) : string, used to classify GameRule
+ classification : T_expect_action
+ resolves(s : QueenSystem, a : currentAction | Action[] is T_expect_action is a_all);

One simple GameRule is sending the Loss signal on heart = 0

```ts
class GameRule_force_loss_on_heart_at_0 extends DefaultGameRule {
    override group = "dead"
    override classification: undefined;
    override resolves(s: QueenSystem, a: ActionBase<Target[], any, any>): Action[] | undefined | void {
        const playerTargets = a.targets.filter(val => val.type === TargetTypeID.player)
        playerTargets.forEach(i => {
            const p = s.getPlayerWithID(i.data)
            if(p && p.heart <= 0) return [
                ActionGenerator.a_force_end_game(this.identity)
            ]
        })
    }
}
```

### Zones and Zone Layout

#### Zones - Class

Zones hold cards[], can dictate the positioning between cards in them (pos -> index, control what it means to be "behind", or "in front"), and handling what move or shuffle means.

There are 2 default implementation of zones:

+ ZoneStack : a stack based zone, used for graves, decks, and so on
+ ZoneGrid : a 2d grid based zone, used only for Fields

One can also extends the default Zone class for a custom implementation.

#### Zones - Data

Zone also have the data portion, asociated with a type. Register in ZoneRegistry and loaded into the class upon creation.

ZoneData has the form:

```ts
type ZoneDataFixxed = {
    priority: number, //priority high = act first
    boundX? : number,
    boundY? : number,
    minCapacity : number, //defaults to 0
    attriutesArr: ZoneAttrID[]
    instancedFor: PlayerTypeID[]
    types? : ZoneTypeID[]
}

type ZoneDataVariable = {
    [key : string] : safeSimpleTypes
}

type ZoneData = (ZoneDataFixxed) | (ZoneDataFixxed & ZoneDataVariable)
```

#### Zone Layout

Zone Layout is separate from Zones. They control what Zone to load and what positioning between zones means. (What opposite means between 2 zones)

The DefaultLayout loads the default zones and sets the 2 fields to be opposite to each other.

ZoneLayout is passed into system constructor

### Cards

Cards holds effects and data.

#### Cards - Data and Class

Cards also has a class part and a data part, similar to Zone and Effect. However, the system by default will just use Card as a data and effect container so there is no need for separate classes.

CardData is registered inside CardDataRegistry and looks like:

```ts
type CardStatInfo = {
    level: number;
    rarity: RarityID;
    extensionArr: ExtensionID[];
    archtype : ArchtypeID[];
    atk: number; //starting stat, think of these 2 as starting_maxAtk and starting_maxHp instead
    hp: number;
}

type CardDisplayInfo = {
    //display stuff
    imgURL? : string
}

type CardEffectInfo = {
    effects : (EffectDataID | [EffectDataID, Partial<EffectData>])[];
}

type CardDataFull = CardStatInfo & CardEffectInfo & CardDisplayInfo
type CardData = Partial<CardPatchDataFull>
```

Cards have a variant system, the "base" variant needs the CardDataFull, and every subsequent variant (i.e upgrade_1, upgrade_2, ...) only need CardData (The partial of CardDataFull). These are registered to CardDataRegistry using different methods.

### Cards - Quick Data Creation

There is a shorthand class used for CardData creation, importable via ```CardDataGenerator```. If I did my magic right, this should be easy to use.

### Effects

#### Effects - Data and class

Effects also have a data part and a class part, plus the sane variant system, similar to Cards. 

Variants passed into Effect creation is the card's variants.

EffectData looks like:

```ts
type EffectDataFixxed = {
    typeID : EffectTypeID,
    subTypeIDs : EffectSubtypeID[],
    localizationKey? : string //used for looking up texts in localizer, undef = use effect dataID
}

type EffectDataVariable = Record<string, number>

type EffectData = EffectDataFixxed | (EffectDataFixxed & EffectDataVariable)
```

Similar to Cards, EffectData and its Partial version can be added separately to ```EffectDataRegistry```.

#### Effects - Activation

Effect activation has 3 Parts:

+ Can respond check -> boolean
+ Make input request -> InputRequest
+ Activate -> Action[]

All 3 are asocates with a corresponding abstract method, which if I did this correctly, the editor will yell at you if you fail to implement

> Effect has a type Parameter, dictating is an array dictating what input it makes. This helps the auto complete.

The inputs to all 3 methods are the Dry or Readonly version of game objects.

#### Effects - Input Request

Input requests can be quickly made by calling the ```Request``` Object.

An example request is:

```ts
const i1 = Request.deck(s, ThisCard).cards().ofSameName(ThisCard).once()
```

This request ````one``` ```card of the same name``` as ```ThisCard```, in the ```deck```.

Input requests can be chained together via the method ```then()```:

```ts
protected override getInputObj(ThisCard: CardDry, s: SystemDry, a: Action){
    const i1 = Request.deck(s, ThisCard).cards().ofSameName(ThisCard).once()
    const i2 = Request.hand(s, ThisCard).once()
    return i1.then(i2)
}
```

This is the getInputObj of the card "apple.fruit", which selects a card in the deck of the same name as its, then add that card to hand.

> Notices hand is also an input, this is by design as there could be many hands by many players.



