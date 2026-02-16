import {
  DefaultLayout,
  DefaultRenderer,
  DefaultSetting,
  DeckDataRegistry,
  PlayerTypeID,
  QueenSystem,
  runAllTests,
} from "../index";

export async function runTestSuiteExample() {
  const system = new QueenSystem(
    new DefaultSetting(),
    new DefaultLayout(),
    new DefaultRenderer(),
  );

  system.addPlayers(PlayerTypeID.player, DeckDataRegistry.oops_all_blank);
  system.addPlayers(PlayerTypeID.enemy, DeckDataRegistry.null_deck);

  await system.load();
  runAllTests(system);
}
