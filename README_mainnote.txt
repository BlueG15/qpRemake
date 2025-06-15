registry goals are used for dynamic imports to be possible
handler receives the registry upon init, import everything
thus, modding is mayyyybe easier since we can change the registry upon creation

oh one more thing, the importURL is from the point of view of the handler, obviously


update:
registrys are just big enums and a bunch of class def


THERE IS A BIG FUKING PROBLEM WITH DATA
i seriously need to rewrite the whole data access bullshit, data is seriously confusing
everything eventually links back to oh just chcnage the fucking data
ahhh

make a data controller, so in the future, if i ever decided to change data, i can at least dont have to rewrite accessing such data

I think ima make the data collection path a little like this

load card -> cardID -> card data -> effectIDs -> effectPath -> load the effect 
                                              -> effectText -> load the text
                    -> card Path -> card Object                            | -> card instance

basically dynamic load twice, 1 for the effect, 1 for the card itself

final effect is the same
this disallows dynamic text editting during game play
do i want that?
ehhhhh, I already allow variable in effect
maybe not yeah

oh note that mu cardID is not the origianal game's cardID since i split that original's id into 2 parts
cardID and variantID, may need to add legacy support

orrrrr

just go with the legacy version, split later
we already have the split code, whatever the split is left with is the variant input for the cardData


we still need a way to dynamically load enemy ai
enemy ai is basically a status effect applied on load

option 1: enemy card defaults loads an ai -> rigid af, cant have self card be enemies for the funsies
option 2: apply the automation effect on any card spawn on enemy side -> also rigid, but better
option 3: have the load card function have an another param specifying which ai to load


am going with option3, not because its better but i can have a loadOption Object that can do more than just load AI
i can ya know, specify the deletion of effect 3 on load

ok, let get to it

ok, now the handling of old ID to new ID

we gonna have 4 files for card:

1) --> cardData file, key by newID (no variant version)
content:
export type cardData = {
    id: string;
    level: number;
    rarityID: number;
    archtype: string;

    extensionArr: string[];
    atk: number; //starting stat, think of these 2 as starting_maxAtk and starting_maxHp instead
    hp: number;
    effectIDs: string[];
    effectPartition: number[];

    //stuff for dynamic load
    objectPath? : str; //new
    //we have defaults for object paths
}

2) --> variantPatchData file, key by variantID (upgrade_1 is a variant ID)
content is a partial<cardData>, cardID is required
patchData will be loaded into the cardData handler at start
mods will be able to use their own patch file

note that patch files can contain all the required fields
if cardID in the patch isnt in the original dataset, it is implied as add new entry operation

3) --> ID to name map file
just a direct map from ID to name, used for translation

searches first by <cardID>_<variantID>
if not exist then searches by <cardID>

4) --> oldID to [newID, variantID] map file
for direct support of old ID

there is 1 file for effect, key by effectID 
since effectID doesnt need to be backwards compatible, we can go nuts

type of the file is {
    effectID : string,
    objectPath? : string,
    displayText : string,
}

I have completed the parser for effect text for live variable injection yayy


------------------------------------------------
New note: 31 May 2025

I have come to terms with rewriting the entire data

This has com eto breaking down the structure of a card itself:

Card --> Data -> 1) Display Data , 2) Stats
     --> Code -> Card Object

Cards are identified by cardID, 

( 
    there are fuzzies here on whether its new or old ID, or what is variant ID, but ima brainstorm that tmr
    Probably a map
)

The ideal thing to do here is to dynamicall load both

Now, to get a load procedure, we have to define a mod

a mod CANNOT modify how queen system behaves

it can do 
    1) Modify card
    2) Add card
    3) Define a module for effectText parsing

for now


For 3), i think best option is to move the folder module in the parser outside, making 2 mods folders and making it unrelated to Cards
Why? Its a separate system anyway


a mod then only concerns the Cards database

For this database, I intend to use dynamic load to maximize the file system itself as storage
And no Collection or Database class

We sadly need 1 map to satisfy 2)
Map<cardID, modIndex>

We also need to preload every mods into an array
mod[]

The load procedure for loading a card instance from cardID is thus:
(unoptimized)

cardID -> 
check in the new cardID Map to see if exist 
    | yes -> load that
    | no -> check default import in specificCard/cardID/cardData.ts to exist?
        | yes -> load that
        | no -> Error, incorrect cardID

loop through the mod[], call patchCardData( cardID, initialData )

check in the new cardID Map to see if exist 
    | yes -> call getCardClass( cardID )
    | no -> check default import in specificCard/cardID/cardClass.ts to exist?
        | yes -> load that
        | no -> Error, card class not exist

cardClass( cardID, cardData, loadOption )

effects do not need to be dynamically loaded, the card file have the effect defined inside of them
yes this can lead to overlaps
yes i dont care
The OS itself dont need to spawn effects instances anyway, why dynamic for no reason

to reduce repetitiveness tho, ima make a template effect folder for stuff to import in

for variants, i think we can just wing it for Now

i can make backwards compatibility to be a mod?



now onto actual implementation, the above makes the OS DO NOT KNOW what cards is in its database

this is kinda..stupid?

----------
may 31 2025

I am conflicted between 
A. loads every cards class into memory into a big map
B. dynamically loads 
orrrrr
C. cached loading, fixxed size map plus dynamic load for things that aint in the cached map

Ima go with A for now, will change later?

variants is a different Card object but with the same cardID
every card must have a cardID and a variantID


How to implement this?

the folder cardID have this structure:

cardID
    |--> baseClass
    |--> baseData
    |--> variants (optional)

baseClass exports default a class extending from Card
baseData exports default a class extending from CardData (currently a type in cardRegistry, change later)
variants exports a class extending from Patcher 

Patcher has these methods:
    | --> patch(cardID, variantID, baseData) : CardData | undefined
    | --> getValidVariantID() : string[]
 
DO NOT DELETE THE DATA FOLDER
registrys are still needed

-----
June 1 2025

to remind myself to no longer think ab dynamic effect loading
mods rn only defines the cards, including the effects in it

if we decouple again, mods have to define both 

I mean this is possible?

-------
June 2 2025

Maybe we do both way dynamic loading, reverting to Card() when needed

theoretically, cardData has 5 more properties

effectID[]
statusEffectIDs[]
statusEffectSubtypeID[][]
statusEffectIDs
effectSubtypeID[][] //used to load subtypes into effects


This is 
honestly very long?

Maybe a custom instruction set to deal with this

or a different structure, like

cardData
    | ... Stats
    | ... Display data
    | effects : {
        effectID : subTypeID[]
    }
    | statusEffects : {
        effectID : subtypeID[]
    }
    | variantData : {

    }


on account of every cards can be enemies, everycard's base variant is default to player's, then have an extra variant called enemy

There are 2 ids

runtime id

And

data id

---------
June 3rd

effect partition gets an upgrade

since am decoupling effectID and displayID, effect how have effectDisplayID

one problem tho, partition old style doesnt allow for "gaps"
aka, ghost effects

solution 1: [number, number][] //marks beinning and ends of blocks
solution 2: number[][] //marks indexes
solution 3: number[] //length = length of actual effects Array, marks partitionIndex of the effects, -1 for ghost

ima go with 3, merged with effectData

also variant is an array now, stacking variant yayyy, fun
---------------
June 10th
note to self : make a registry for operators, add a loader for operators, finalizing the game state Object
optional: mayyyybe make a save state system (later)










