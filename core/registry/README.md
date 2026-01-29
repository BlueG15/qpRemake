# Registries

Registries are basically data containers, each mapping ID of a specific type to data and keys.


This mapping cannnot be change (the data object however, can be edited)


This was developed to have these requirements:
+ Can act as an **enum** for contants/default values
+ Allows **consistent** and **unchanging** mapping from ID to the key and data object (key is used for localization)
+ Allows **adding** more ID -> key, data map without affecting any existing link

> **Usage note:** For confusion on what the type **Branded** does, see the README over on ```/types```
 
> **Development note:** The term "Registry" is a borrow for literal Registers. I think this was used for older games/systems.

> **Development note:** The number of Registries in the system is a constant, the base registry class is not exposed beyonnd this folder for this reason.

Here is a list of available registries
+ rarity
+ color
+ operator
+ player type
+ card
+ effect
+ effect type
+ effect subtype
+ deck
+ zone
+ zone attribute
+ action

> Some registries are currently const enum for now, will change later if I want them to be dynamic