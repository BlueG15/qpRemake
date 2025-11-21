# qpRemake

This is a card effect processing system for the game "Quantum Protocol" remade in native Typescript.

> Quantum Protocol and Jkong reserves all rights to the game and all related assets.

## Table of contents

- [qpRemake](#qpremake)
  - [Table of contents](#table-of-contents)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic usage](#basic-usage)
  - [What the imported objects do](#what-the-imported-objects-do)
    - [**queenSystem**](#queensystem)
    - [**queenSystemComponents**](#queensystemcomponents)
      - [**gameComponent**:](#gamecomponent)
      - [**systemComponent**](#systemcomponent)
    - [**queenSystemUtils**](#queensystemutils)
  - [Advanced usage:](#advanced-usage)
    - [Making your own renderer](#making-your-own-renderer)
    - [Saving and loading game state:](#saving-and-loading-game-state)
    - [Display texts](#display-texts)
    - [Handling inputs](#handling-inputs)
- [Modding](#modding)
  - [What is a mod?](#what-is-a-mod)
  - [How mods are run](#how-mods-are-run)
  - [How to make a mod](#how-to-make-a-mod)
  - [Adding a mod](#adding-a-mod)
  - [Example: Adding a custom effect](#example-adding-a-custom-effect)
- [Project contribution](#project-contribution)
  - [Current progress:](#current-progress)
  - [How to get and develop the project](#how-to-get-and-develop-the-project)
    - [Clone the project:](#clone-the-project)
    - [Run the project](#run-the-project)
  - [Game components](#game-components)
  - [Main gameplay loop](#main-gameplay-loop)
  - [Project structure](#project-structure)
  - [Contribution workflow guide](#contribution-workflow-guide)
    - [Make effects](#make-effects)
    - [Add more actions (if needed)](#add-more-actions-if-needed)
    - [Update effect registry](#update-effect-registry)
    - [Update card registry](#update-card-registry)
    - [Update defaultSetting](#update-defaultsetting)
    - [Running tests](#running-tests)
    - [Make renderers](#make-renderers)
    - [Improving the text parser](#improving-the-text-parser)



# Installation

The system is available via npm.

```bash
npm i qpremake
```

And then can be imported via 

```ts
// ts
import { 
   queenSystem as s, 
   queenSystemComponents, 
   queenSystemUtils 
} from "qpremake"
```

or 

```js
// js
const { 
   queenSystem, 
   queenSystemComponents, 
   queenSystemUtils 
} = require("qpremake")
```

There is also a default import for just the ```queenSystem```

```ts
// ts
import queenSystem from "qpRemake"
```

or

```js
// js
const queenSystem = require("qpRemake")
```

# Usage

This section is dedicated to thos who wish to use the system and render out a game, rather than modding stuff.

## Basic usage

This here is just a calculator for card effects. To have it renders out something visible, (like text or an HTML page), you have to hook it up to a ```Renderer```.

This code binds a renderer of your choice to the system for rendering. More info on how the rendering life cycle work in later sections.

```ts
import {queenSystem, queenSystemComponents} from "qpRemake"

const { operatorRegistry } = queenSystemComponents.registry
const sampleRenderer = queenSystemComponents.systemComponent.sampleRenderer
const defaultSetting = { queenSystemComponents } 

let setting = new defaultSetting()
let renderer = new YourRendererHere() 
// Your renderer shoudld be here
// What interface it follows is in the later sections.

let s = new queenSystem(setting, sampleRenderer)
renderer.bind(s)
s.addPlayers("player", operatorRegistry.o_esper)
s.addPlayers("enemy", operatorRegistry.o_null)
await s.load()

s.start();
```

## What the imported objects do

### **queenSystem**

The queenSystem is a class that handles card effect calculations. 

It must first be loaded (async sadly cause file import is async) via ```load()```.

You can then load players gradually by ```addPlayers```, this will only accept 2 type "player" and "enemy" at the moment. The appropriate zones will be added correctly to the internal zone list.

With a renderer bound, the ```start``` method begins the communication loops between the queenSystem and the renderer.

The procedure goes as follows:
1. The queenSystem calls ```turnStart``` of the renderer to begin a turn play.
2. Once the Renderer can continue with player's action for that turn, ```processTurn``` is called
3. Inside ```processTurn```, certain events will cause the system to halt and return control to the renderer. The renderer can decide when to continue by calling ```continue```;
4. This continues until the player loses or won the round.

from the renderer's perspective, these functions are passed in so they need not remember what to call.

Here is a cheatsheet of what this class does from the perspective of a renderer:

1. ```load``` : required to run before starting the game, async
2. ```addPlayers``` : for adding players
3. ```addDeck``` : for adding decks
4. ```start``` : start the game

### **queenSystemComponents**

Various classes used in the processing of card effects. 

Use from the perspective of a modder who wants to add more cards / effects.
Outside of this, one can read the data from the various registries (either enum or const key -> data pair).

For a cheat sheet, here are the properties of systemComponent:

1. ```gameComponent``` : holds various game component classes. 
2. ```systemComponent``` : holds various services to operate on data
3. ```displayComponent``` : holds display parsed segements
4. ```registry``` : holds data
5. ```defaultSetting``` : holds the default setting
6. ```mod``` : holds what format mods must follows

#### **gameComponent**:

Holds various game component classes like ```Card, Effect, ...```.

The complete list is:

*Class entries*
1. ```Card```
2. ```Effect```
3. ```Zone_grid``` and ```Zone_stack``` : Default zone implementation
4. ```Action```

*Objects with classes inside*

5. ```EffectType``` :Various effect types
6. ```EffectSubType``` : Various effect subtypes
7. ```Zone``` : Various default zones
8. ```Serialized``` : Serialized components, for saving and loading
9. ```Localized``` : Localized components, passed to the renderer

#### **systemComponent**

Hold various services outside of gameplay intepretations.

The complete list is:

1. ```EffectTextParser``` : parses effect text
2. ```Localizer``` : localzied game components
3. ```ActionGenerator``` : generates actions
4. ```InputRequester``` : generates input requests
5. ```Renderer``` : an abstract class to how a renderer linked to the system shoudll be formatted.
6. ```SampleRenderer``` : an example renderer

### **queenSystemUtils**

Holds various utilities functions like rng or ID generation.

This object is also available as a global object in ```Utils```.

## Advanced usage:

### Making your own renderer

A renderer's job is to ..well render stuff.

The work flow of a renderer in **qpRemake** is to receive API like requests during the turn, renders it, then return control to the system to process more stuff.

The base abstract class / interface can be found in 

```ts
import {queenSystemComponents} from "qpremake"
const {Renderer} = queenSystemComponents.systemComponent
```

This class is as follows:

```ts
abstract class Renderer {
    abstract gameStart(
            s: LocalizedSystem, 
            callback: () => any
        ) : void;

    abstract turnStart(
        s: LocalizedSystem, 
        callback: (a? : Action) => any
        ) : void;

    abstract update(
        phase: TurnPhase, 
        s: LocalizedSystem, 
        a: Action, 
        callback: () => any
        ) : void;

    abstract requestInput(
        inputSet: inputData[], 
        phase: TurnPhase, 
        s: LocalizedSystem, 
        a: Action, 
        callback: (
            input : inputData
            ) => any
        ) : void;
}
```

These methods are called appropriately. There shoudl be guide comments when one implement these.

Notably, the system is paused after calling one of these. Sort of *"handing control over"* to the renderer. The system only resumes after **the provided callback()** is called.

One can make a new renderer to whatever front end frame work one likes by implementing this class.

### Saving and loading game state:

Game state or more specifically is an instance of ```SerializedSystem```. 

At any time, this is obtained via:

```ts
s.toSerialized()
```

This file can then be JSON and saved to a text file.

Loading said file is possible via the normal ```load()``` functionn before start:

```ts
const data = fs.readFileSync(...) as SerializedSystem
s.load(data)
```

### Display texts

All texts provided via a ```Localized``` object is an array of ```Display components``` to guide the injection of icons and text formatting.

Those objects are available via:

```ts
import {queenSystemComponents} from "qpremake"
const {TextComponent, IconComponent, ImageComponent} = queenSystemComponents.displayComponent
```

### Handling inputs

Whenever an action wants an input (say, when a card says choose a card, choose a space on the board, etc). The method ```requestInput``` of the renderer is called.

All possible inputs is in the ```inputSet``` components, all these are in one specific type (a card, a spot on the field, a number, etc).

Inputs if required multiple are done sequentially. If a card wants the player to select 2 spots in the field, the request input function will be called twice for each.

At the start of the turn, there is also the need to select a **turn action**. Thus the ```turnStart``` method also have an option to continue with a player action.


# Modding

This section is dedicated to whomever wants to mod the system (add more cards, more localizations, etc).

## What is a mod?

Mods are ts files that changes the data od the system

There are 2 types:

1. gameplay mods, these can change what effects, cards, zones, characters, ... are possible
2. parsing mods, these changes the behavior of how card text are parse and localized. (If one specifically target changing localization, look in a localization file.)

## How mods are run

In the loading step of the system, mods are loaded and can change various registries via an API interface.

## How to make a mod

There are 2 ways. One either can clone / fork [the github rerpo](https://github.com/BlueG15/qpRemake).
Or add stuff after installing the system in the setting.

Both are essentially the same but you appear on the npm of the project under contribution :). 

## Adding a mod

In the settings of the system, there is the field ```mods```, which stores an array of strings to code files inside the mod folder ("One can change this too").

A mod file exports default an implementation to the class ```mod``` available via:

```ts
import {queenSystemComponents} from "qpremake"
const {GameModule, ParserModule} = queenSystemComponents.mod
```

This game module is just this:

```ts
class GameModule {
    //should override, call upon load
    load(API : registryAPI) : void {}
}
```

Very simple. That registryAPI looks like this:

```ts
interface registryAPI {
    //SAFE registry edit
    //There is also the registry for effectType and Action, but those doesnt need to be modified
    registry_edit_card(key : string, value : cardData) : void;
    registry_edit_effect_data(key : string, data : effectData) : void;
    registry_edit_effect_class(
        key : string, 
        constructors : typeof Effect | Record<string, typeof Effect>
    ) : void;
    registry_edit_effect(
        key : string,
        data : effectData,
        constructors : typeof Effect | Record<string, typeof Effect>
    ): void
    registry_edit_effect_subtype(
        key : string, 
        constructor : typeof EffectSubtype
    ) : void;
    
    registry_edit_zone_data(key : string, data : zoneData) : void;
    registry_edit_zone_class(
        key : string,
        constructor : typeof Zone 
    ) : void;
    registry_edit_zone(
        key : string, 
        data : zoneData,
        constructor : typeof Zone 
    ) : void;

    //UNSFAFE registry edit
    registry_edit_custom_action_handler(
        actionIDs : number[],
        handlerFunc : ((a : Action, system : queenSystem) => undefined | void | Action[])
    ) : void;
   
    //localization edit
    registry_edit_localization(language : string, key : string, val : string) : void;

    //... more coming
}
```

These methods are passed into the mod for editting. 

## Example: Adding a custom effect

Effect have 2 parts, like almost every other gameplay components.

Those 2 parts are **Class part** and **Data part**

Those 2 parts are available via ```registry_edit_effect_data``` and ```registry_edit_effect_class``` respectively.

or both at the same time via ```registry_edit_effect```.

For this simple example, we ignore the data for now and implements the class part (data can be hard coded via the specified **effectData**) type.

We import the ```Effect``` class:

```ts
import {queenSystemComponents} from "qpremake"
const {Effect} = queenSystemComponents.gameComponent
```

And add it in:

```ts
class CustomEffect extends Effect {
    // Your implementation here
}

export default class customMod extends GameModule {
    override load(API : registryAPI){
        API.registry_edit_effect_class(
            "customEffect1", 
            CustomEffect
        )
    }
}
```

What an effect does and how to implement its behavior is in the **make effect** section below.

Importantly, one **MUST NOT** override the contructor.

# Project contribution

## Current progress:

|                | Cards | Effects | Archtypes | Actions |
|:--------------:|:-----:|:-------:|:---------:|:-------:|
|<span style="color:green">Current</span> | <span style="color:green">49</span> | <span style="color:green">59</span> | <span style="color:green">1.5*</span> | <span style="color:green">50</span> |
| <span style="color:orange">Total</span> | <span style="color:orange">200</span> | <span style="color:orange">600?</span> | <span style="color:orange">12</span> |  |

( * ) : Fruit and Some of Generic

## How to get and develop the project

### Clone the project:

In an empty folder you want the project in, open a terminal and run:
```bash
git clone https://github.com/BlueG15/qpRemake
```
### Run the project

```bash
npm run dev
```

This runs ```tsc```, adn then run ```./build/main.js```

## Game components
system have zones, zones have cards, cards have effects, effects have types and subtypes
effects "activate" by sending API calls to system in the form of Actions

> TODO : explain this stuff better

## Main gameplay loop

A turn starts when a player performs an action, then proceeds in phases; to simplify its
chain -> resolution -> trigger
these steps go in a loop until every action is resolved

> TODO : add infinite loop detection somehow

## Project structure
```
/queenSystem (main folder)
|----> /handler
|----> /loader
|----> /renderer
       |----> rendererInterface.ts
|----> queenSystem
|----> testSuite

/data
|----> various registries (enums and const and whatnot)

/types
|----> classes and types and stuff

/specificEffects  <--- expand this folder
|----> effect files
```

> TODO : draw better diagrams for this

## Contribution workflow guide

### Make effects

This process involves making a class extending from either ```Effect``` or an existing class that does (something else in the ```SpecificEffects``` folder)

This child class has 5 jobs : 
1. Overriding ```canRespondAndActivate_final``` to check the activation condition of the card (ignoring any types or subtypes conditions). If the effect does not have an condition, just return true.
   
   > This function takes in a readonly version of the ```Card``` the effect is housed, the current ```system``` object and the current ```Action```. Returns a boolean.

2. Overriding ```activate_final``` to well...activate. This function only gets called if the above function returns true, so declare the type of the Action parameter differently if you want. 
   
   > This function takes in a readonly version of the ```Card``` the effect is housed, the current ```system``` object and the current ```Action```. Returns an ```Action[]```.

3. Overriding ```createInputObj``` to inform the system of what type of input to take in, return ```undefined``` means no input. One can invoke the ```Request``` object to create an input object quickly, or just create one manually.

   > This whole system is not...great imo, but hopefully its "servicable"

4. If the effect has a parameter (most do, since x and upgraded x may behave the exact same just with different number so its convenient to write it once), you can make a quick getter and setter to access a ```Map<string, number>``` within the effect named ```attr```, this map will be loaded with data upon effect creation. (This getter and setter is optional as no outside system uses this, only this effect and maybe others extending from it)
   
5. Return some parameters to inject into the effect text by overriding the ```getDisplayInput``` function.

Going over how to make an action, you need to invoke the const ```actionConstructorRegistry```, hopefully ts takes over the rest of the guiding process if i do my magic correctly


Update 1.2.9:
I added a custom eslint rule to prevent overriding @final methods and classes, it seems to...not work very well..idk why,
If anyone knows how to write a better version of this rule, pls help

### Add more actions (if needed)

If you need more actions, please uhhh, notify me and skip that effect

Actions also have inputs with weird handling, I have made a template class for any effect that specifically wants the inputs for an a_pos_change but anything else is albeit possible, not short enough to be put on here so skip any effects that wants it

For me in the future, this requires updating actionConstructorRegistry and changing the handling logic over in queenSystem

### Update effect registry

```effectRegistry``` is a file located in ```/data```, housing a const for effect..well...data. This is technically initial data as cards can override this. Do include type, subtypes and any additional variables, these will be loaded into the attr map

check the ```effectData``` type for more info

### Update card registry

```cardRegistry``` is a file located in ```/data```, housing a const for cards, plus some extra enums and stuff. you can probably figure out what to entry based on the ```cardData``` type

include the ```upgrade_1``` variant if the card is upgradable

### Update defaultSetting

default setting is a class located in ```types/abstract/gameComponents/setting``` (may subject to change), include the file name of the new effect class in the ```effectFiles``` array

Oh one more note, that effectFile has to have a default export, either of a Record from effectName to the class or of the class itself 

### Running tests

You can add tests if you want, there is a test suite file located in ```/_queenSystem/testSuite ```. Invoke the test back in main.

### Make renderers

The renderer interface can be found in ```./_queenSystem```, it goes like this:

```ts
interface qpRenderer {
    init(s : Localized_system, callback : () => any) : void;
    startTurn(s : Localized_system, callback : (a? : Action) => any) : void;
    update(phase : TurnPhase, s : Localized_system, a : Action, callback : () => any) : void;
    requestInput<T extends inputType>(inputSet : validSetFormat<T> , phase : TurnPhase, s : Localized_system, a : Action, callback : (input : inputDataSpecific<T>) => any) : void;
}
```

The renderer interface is built upon a pause-resume model. On each ```Action``` or each API calls to the main system. The system processes the data, pause, then call the renderer. 

> The renderer ***HAVE TO*** call callback manually
> The callback is also bound to the system, so it cannot be rebind

This callback based approach was prefered to other approaches to a generic renderer interface due to promises. A renderer can take as much time as it wants, the system only continues after the callback function is called.

### Improving the text parser

The text parser for qpRemake is a modular XML-based text parser, specialized for effect text.
The parser can be found [****in this github repo.****](https://github.com/BlueG15/qpEffectTextParser)

There are only a handful of modules right now, allowing stuff like
```XML
<string> a + "_" + b </>
```
```XML
<if type = "number"><numeric> a + b > c </><string> A + B </><string> C + D </></>
```

Effect text now allow these short hand

```
=abc prints a, b, c out
=<exprerssion>; inserts the expression
```
















