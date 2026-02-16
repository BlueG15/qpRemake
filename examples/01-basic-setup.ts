import {
  QueenSystem,
  DefaultLayout,
  DefaultRenderer,
  DefaultSetting,
  DeckDataRegistry,
  PlayerTypeID,
} from "../index";

export async function basicSetupExample() {
  const setting = new DefaultSetting();
  const renderer = new DefaultRenderer();
  const layout = new DefaultLayout();

  const system = new QueenSystem(setting, layout, renderer);
  system.addPlayers(PlayerTypeID.player, DeckDataRegistry.oops_all_blank);
  system.addPlayers(PlayerTypeID.enemy, DeckDataRegistry.null_deck);

  await system.load();
  system.start();

  return system;
}
