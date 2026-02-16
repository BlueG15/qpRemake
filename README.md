# qpremake

TypeScript/JavaScript card-effect engine for **Quantum Protocol** style gameplay.

> Quantum Protocol and Jkong reserve all rights to the original game and assets.

This README documents the current API and project structure for `v1.6.x`.

## Table of contents

- [Install](#install)
- [Quick start](#quick-start)
- [Core concepts](#core-concepts)
- [Renderer contract](#renderer-contract)
- [Saving and loading game state](#saving-and-loading-game-state)
- [Modding](#modding)
- [Development](#development)

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

### Built-in helpers

The package exports registries and constructors used frequently by consumers:

- Registries: `DeckDataRegistry`, `CardDataRegistry`, `ZoneRegistry`, `OperatorRegistry`, etc.
- Action creation: `ActionGenerator`.
- Target helpers: `Target`.
- Default runtime pieces: `DefaultRenderer`, `DefaultLayout`, `DefaultSetting`.

## Renderer contract

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

## Saving and loading game state

Get a serializable snapshot:

```ts
const state = system.toSerialized();
```

Load from snapshot:

```ts
await system.load(state);
```

You can store/retrieve the object as JSON in your own persistence layer.

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

## Development

### Run checks

```bash
npx tsc --noEmit
npm test
```

### Repository layout (high level)

- `queen-system/`: game loop and processing engine.
- `core/`: registries, data models, settings, shared types.
- `game-components/`: cards, effects, zones, positions.
- `system-components/`: renderer/input/localization/modding/loader systems.
- `_mods/`: built-in game/parser modules.
- `testFile.ts`: basic integration test entrypoint used by `npm test`.
