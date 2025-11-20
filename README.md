# qpRemake 

This is a card processing system for the game "Quantum Protocol" remade in native Typescript.
Quantum Protocol and Jkong reserves all rights to the game and all related assets.

## Installation

The system is available via npm.

```bash
npm i qpremake
```

And then can be imported via 

```ts
import { 
   queenSystem, 
   queenSystemComponents, 
   queenSystemUtils 
} from "qpremake"
```

or 

```js
const { 
   queenSystem, 
   queenSystemComponents, 
   queenSystemUtils 
} = require("qpremake")
```

There is also a default import for just the ```queenSystem```

```ts
import queenSystem from "qpRemake"
```

or

```js
const queenSystem = require("qpRemake")
```

## Basic usage

This here is just a calculator for card effects. To have it renders out something visible, (like text or an HTML page), you have to hook it up to a ```Renderer```.

This code binds a renderer of your choice to the system for rendering. More info on how the rendering life cycle work in later sections.

```ts
import {queenSystem, queenSystemComponents} from "qpRemake"

const { operatorRegistry } = queenSystemComponents.registry

let setting = new defaultSetting()
let renderer = new YourRendererHere() 
// Your renderer shoudld be here
// What interface it follows is in the later sections.

let s = new queenSystem(setting, renderer)
renderer.bind(s)
s.addPlayers("player", operatorRegistry.o_esper)
s.addPlayers("enemy", operatorRegistry.o_null)
await s.load()

s.start();
```

## What the imported objects do

### queenSystem

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

### queenSystemComponents

Various classes used in the processing of card effects. 

Use from the perspective of a modder who wants to add more cards / effects.
Outside of this, one can read the data from the various registries (either enum or const key -> data pair).

The structure of this object is as follows:

```ts
const queenSystemComponents = {
    "gameComponent" : {
         //Action class, stores what to do (move card, delete, execute, etc)
        Action, 

        //Card class, represents a card, all cards extends from this
        Card,   

        //Effect class, cards contain effects, all effects extends from this
        Effect, 

        //Two premade form of a zone class, mainly differ in how to store and interact with stored cards
        Zone_grid, Zone_stack, 
        "Zone" : {

            //Zone class, mainly just here for instanceof, use the above Zone_grid and Zone_stack instead
            "ParentClass" : Zone, 

            //Below this are various premade zones
            //To add your own, extend from one of Zone_grid or Zone_stack
            //and implement zone methods to move cards and interupt events

            //Zones initiates with a data structure
            //to define capacity, shape, etc
            //See zoneDataRegistry

            Ability, 
            Deck, 
            Drop,
            Field,
            Grave,
            Hand,
            Storage,
            System,
            Void
        },
        "EffectSubType" : {

            // Effects can have subtypes
            // subtypes of an effect modifies an Effect's attribute
            // and / or modifies the response
            "ParentClass" : EffectSubtype,

            //Below are various premade subtypes

            Chained, 
            Delayed, 
            FieldLock, 
            GraveLock, 
            HandOrFieldLock, 
            HardUnique, 
            Instant, 
            Once, 
            Unique
        },
        "EffectType" : {

            // Effects can also have a type
            "ParentClass" : EffectType,
            InitEffect, 
            LockEffect,
            ManualEffect,
            PassiveEffect,
            TriggerEffect
        },
        "Serialized" : {

            // The serialized version of game components
            // remove circular references and should be save to JSON stringify
            // and save
            SerializedCard,
            Serialized_effect,
            SerializedZone,
            SerializedPlayer,
            SerializedSystem,
        },
        "Localized" : {

            // Localized versions of game components
            // All texts of these objects is parsed through the localizer already
            // should also have no circular refs
            LocalizedAction,
            LocalizedCard,
            LocalizedEffect,
            LocalizedZone,
            LocalizedPlayer,
            LocalizedSystem,
        }
    },
    "systemComponent" : {

         // Various short hand services

         // This one parses effect text, see more in later sections
         "effectTextParser" : Parser,

         // This one localizes the objects
         "localizer" : Localizer,

         // This one generate actions from a quick hand format
         "actionGenerator" : actionConstructorRegistry,

         // This one generates quick input array
         "inputRequester" : Request,
    },
    "displayComponent" : {

         // The parsed text is in an array of DisplayComponents
         // For adaptability with various renderer

         "ParentClass" : DisplayComponent,
         TextComponent,
         IconComponent,
         ReferenceComponent,
         ImageComponent,
         SymbolComponent,
    },
    "registry" : {
         // Registries are hard coded data
         // some are enums, some are const key -> value

        actionRegistry,

        cardDataRegistry,

        effectDataRegistry,
        effectTypeRegistry,

        operatorRegistry,
        operatorDataRegistry,

        rarityRegistry,
        rarityDataRegistry,

        subtypeRegistry,

        zoneRegistry,
        zoneDataRegistry,
    },
    "defaultSetting" : settings,
    "mod" : {

         //These are the class a mod must follows
         // and extends from

        GameModule,
        ParserModule,
    },
};
```

For a cheat sheet, here are the properties of systemComponent:

1. gameComponent : holds various game component classes
2. systemComponent : holds various services to operate on data
3. displayComponent : holds display parsed segements
4. registry : holds data
5. defaultSetting : holds the default setting
6. mod : holds what format mods must follows

### Utils

Utils is a custom util object which hodl various utility methods. ts should suggest what it has already. 

## Pending Tasks

1. make effects
2. add more actions (if needed)
3. update the effect registry
4. update the card registry
5. add a deck registry
6. make level / wave control
7. make a good renderer



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
















