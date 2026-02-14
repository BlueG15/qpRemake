import {
  QueenSystem,
  OperatorRegistry,
  DefaultSetting,
  DefaultLayout,
  PlayerTypeID,
  DefaultRenderer,
  ActionGenerator,
  ZoneRegistry,
  Target,
  DeckDataRegistry,
  runAllTests,
} from "./index";

async function main() {
  let setting = new DefaultSetting();
  let renderer = new DefaultRenderer();
  let layout = new DefaultLayout();

  let s = new QueenSystem(setting, layout, renderer);

  const pid1 = s.addPlayers(PlayerTypeID.player, DeckDataRegistry.oops_all_blank);
  const pid2 = s.addPlayers(PlayerTypeID.enemy, DeckDataRegistry.null_deck);
  await s.load();

  const playerZones = s.getAllZonesOfPlayer(pid1);

  //process a simple action
  s.processTurn(
    ActionGenerator.a_draw(
        playerZones[ZoneRegistry.deck][0]
    )(
      playerZones[ZoneRegistry.hand][0],
    )(
        Target.player(pid1), { isTurnDraw: false }
    ),
  );

  //run tests
  runAllTests(s)
}

main();
