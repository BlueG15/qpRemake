import {
  DefaultLayout,
  DefaultRenderer,
  DefaultSetting,
  DeckDataRegistry,
  GameRule_allow_draw,
  PlayerTypeID,
  QueenSystem,
} from "../index";

export async function addGameRuleExample() {
  const system = new QueenSystem(
    new DefaultSetting(),
    new DefaultLayout(),
    new DefaultRenderer(),
  );

  system.addPlayers(PlayerTypeID.player, DeckDataRegistry.oops_all_blank);
  system.addPlayers(PlayerTypeID.enemy, DeckDataRegistry.null_deck);

  // Adding an existing game rule class instance.
  system.addGameRule(new GameRule_allow_draw());

  await system.load();
  return system;
}
