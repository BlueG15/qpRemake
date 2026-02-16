import {
  AutoInputOption,
  DefaultLayout,
  DefaultRenderer,
  DefaultSetting,
  DeckDataRegistry,
  PlayerTypeID,
  QueenSystem,
} from "../index";

export async function autoInputExample() {
  const setting = new DefaultSetting();
  setting.auto_input = AutoInputOption.random;

  const system = new QueenSystem(setting, new DefaultLayout(), new DefaultRenderer());
  system.addPlayers(PlayerTypeID.player, DeckDataRegistry.oops_all_blank);
  system.addPlayers(PlayerTypeID.enemy, DeckDataRegistry.null_deck);

  await system.load();
  return system;
}
