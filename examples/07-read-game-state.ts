import {
  DefaultLayout,
  DefaultRenderer,
  DefaultSetting,
  DeckDataRegistry,
  PlayerTypeID,
  QueenSystem,
} from "../index";

export async function readGameStateExample() {
  const system = new QueenSystem(
    new DefaultSetting(),
    new DefaultLayout(),
    new DefaultRenderer(),
  );

  const playerId = system.addPlayers(PlayerTypeID.player, DeckDataRegistry.oops_all_blank);
  const enemyId = system.addPlayers(PlayerTypeID.enemy, DeckDataRegistry.null_deck);

  await system.load();

  const playerZones = system.getAllZonesOfPlayer(playerId);
  const enemyZones = system.getAllZonesOfPlayer(enemyId);

  return {
    turnCount: system.turnCount,
    playerZones,
    enemyZones,
    localized: system.toLocalized(),
  };
}
