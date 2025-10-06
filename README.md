# qpRemake 
Alpha branch is finally ended and will be merged into main!!, only a renderer pending!


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

## How to get and run the project

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
Check the GitHub repo for the parser for more info.
















