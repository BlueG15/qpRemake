import {
  ActionGenerator,
  DefaultLayout,
  DefaultRenderer,
  DefaultSetting,
  DeckDataRegistry,
  PlayerTypeID,
  QueenSystem,
  Target,
  ZoneRegistry,
} from "../index";

export async function processSingleActionExample() {
  const system = new QueenSystem(
    new DefaultSetting(),
    new DefaultLayout(),
    new DefaultRenderer(),
  );

  const playerId = system.addPlayers(PlayerTypeID.player, DeckDataRegistry.oops_all_blank);
  system.addPlayers(PlayerTypeID.enemy, DeckDataRegistry.null_deck);

  await system.load();

  const playerZones = system.getAllZonesOfPlayer(playerId);
  const drawAction = ActionGenerator.a_draw(
    playerZones[ZoneRegistry.deck][0],
  )(
    playerZones[ZoneRegistry.hand][0],
  )(
    Target.player(playerId),
    { isTurnDraw: false },
  );

  system.processTurn(drawAction);
}
