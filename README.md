# qpRemake 
Alpha branch is finally ended!!, only task rn is the loop


1. make effects
2. add more actions (if needed)
3. update the effect registry
4. update the card registry
5. update defaultSetting to include new files (if needed)


## Game components
system have zones, zones have cards, cards have effects, effects have types and subtypes
effetcs "activates" by sending API calls to system in the form of Actions

> TODO : explain this stuff better

## Main gameplay loop

A turn starts with a player made action, then proceed in phases, to simplify its
chain -> resolution -> trigger
these steps go in a loop until ever action is resolved

> TODO : add infinite loop detection somehow

## Project structure
```
/queenSystem (main folder)
|----> /handler
|----> /loader
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

This child class has 3 jobs : 
1. Overriding ```canRespondAndActivate_final``` to check the activation condition of the card (ignoring any types or subtypes conditions). If the effect does not have an condition, just return true.
   
   > This function takes in a readonly version of the ```Card``` the effect is housed, the current ```system``` object and the current ```Action```. Returns a boolean.

2. Overriding ```activate_final``` to well...activate. This function only gets called if the above function returns true, so declare the type of the Action parameter differently if you want. 
   
   > This function takes in a readonly version of the ```Card``` the effect is housed, the current ```system``` object and the current ```Action```. Returns an ```Action[]```.

3. If the effect has a parameter (most do, since x and upgraded x may behave the exact same just with different number so its convenient to write it once), you can make a quick getter and setter to access a ```Map<string, number>``` within the effect named ```attr```, this map will be loaded with data upon effect creation. (This getter and setter is optional as no outside system uses this, only this effect and maybe others extending from it)

Going over how to make an action, you need to invoke the const ```actionConstructorRegistry```, hopefully ts takes over the rest of the guiding process if i do my magic correctly

### Add more actions (if needed)

If you need more actions, please uhhh, notify me and skip that effect

Actions also have inputs with weird handling, I have made a template class for any effect that specifically wants the inputs for an a_pos_change but anything else is albeit possible, not short enough to be put on here so skip any effects that wants it

For me in the future, this requires updating actionConstructorRegistry and changingt the handling logic over in queenSystem

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













