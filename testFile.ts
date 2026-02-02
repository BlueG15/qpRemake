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
} from "./index";

async function main() {
  let setting = new DefaultSetting();
  let renderer = new DefaultRenderer();
  let layout = new DefaultLayout();

  let s = new QueenSystem(setting, layout, renderer);

  const pid1 = s.addPlayers(PlayerTypeID.player, OperatorRegistry.esper);
  const pid2 = s.addPlayers(PlayerTypeID.enemy, OperatorRegistry.null);
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
}

main();
