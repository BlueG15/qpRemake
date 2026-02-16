import {
  DefaultLayout,
  DefaultRenderer,
  DefaultSetting,
  DeckDataRegistry,
  ModdingAPI,
  OperatorRegistry,
  PlayerTypeID,
  QueenSystem,
} from "../index";

export async function moddingApiExample() {
  const system = new QueenSystem(
    new DefaultSetting(),
    new DefaultLayout(),
    new DefaultRenderer(),
  );

  system.addPlayers(PlayerTypeID.player, DeckDataRegistry.oops_all_blank);
  system.addPlayers(PlayerTypeID.enemy, DeckDataRegistry.null_deck);

  await system.load();

  // ModdingAPI is bound to the active system during load().
  const customDeckId = ModdingAPI.addDeck("example_empty", {
    cards: [],
    operator: OperatorRegistry.esper,
  });

  return {
    customDeckId,
    deckData: DeckDataRegistry.get(customDeckId),
  };
}
