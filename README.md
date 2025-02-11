# qpRemake
remake of the qp engine, with moddability in mind

# Current tasks:
- fix hard coded error line numbers (minor, dont remove them just yet, Ctrl F the number helps)
- change import structure to follows whats done for error

- port the old data over to the new format
- finish the "card" object

- add reprogram functionality
- add easier support for graphical events (may need to modify main loop to be async) (dangerous update)
- handle async user input
- program every single card in the game

# Files being worked on right now:
- data/cardRegistry.ts (port old data over to here, filters out only whats important)
- baseClass/card.ts (change the contructor to use the data from the registry, example implemented in baseClass/zone.ts) 
- handlers/cardHandler.ts (low priority) (the handler currently only handles dynamic import of cards on request, i am still debating whether to do this or front loads every single card into a map)
