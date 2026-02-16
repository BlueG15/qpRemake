import {
  DefaultLayout,
  DefaultRenderer,
  DefaultSetting,
  DeckDataRegistry,
  PlayerTypeID,
  QueenSystem,
} from "../index";

export async function saveAndLoadExample() {
  const baseSetting = new DefaultSetting();
  const renderer = new DefaultRenderer();

  const original = new QueenSystem(baseSetting, new DefaultLayout(), renderer);
  original.addPlayers(PlayerTypeID.player, DeckDataRegistry.oops_all_blank);
  original.addPlayers(PlayerTypeID.enemy, DeckDataRegistry.null_deck);
  await original.load();

  const snapshot = original.toSerialized();

  const restored = new QueenSystem(new DefaultSetting(), new DefaultLayout(), renderer);
  await restored.load(snapshot);

  return { snapshot, restored };
}
