import {
  Action,
  DefaultLayout,
  DefaultSetting,
  DeckDataRegistry,
  PlayerTypeID,
  QueenSystem,
  qpRenderer,
  TurnPhase,
} from "../index";
import type { LocalizedSystem } from "../core/localized";
import type { InputRequestData } from "../system-components/inputs";
import type { Target } from "../core";

class ConsoleRenderer implements qpRenderer {
  gameStart(_s: LocalizedSystem, callback: () => any): void {
    console.log("Game started");
    callback();
  }

  turnStart(_s: LocalizedSystem, callback: (a?: Action) => any): void {
    console.log("Turn started");
    callback();
  }

  update(phase: TurnPhase, _s: LocalizedSystem, action: Action, callback: () => any): void {
    console.log(`Phase ${phase} handled action ${action.name}`);
    callback();
  }

  requestInput(
    inputRequest: InputRequestData<Target>,
    _phase: TurnPhase,
    _s: LocalizedSystem,
    _a: Action,
    callback: (input: Target[]) => any,
  ): void {
    const firstChoice = inputRequest.choices[0];
    callback(firstChoice ? [firstChoice] : []);
  }
}

export async function customRendererExample() {
  const system = new QueenSystem(
    new DefaultSetting(),
    new DefaultLayout(),
    new ConsoleRenderer(),
  );

  system.addPlayers(PlayerTypeID.player, DeckDataRegistry.oops_all_blank);
  system.addPlayers(PlayerTypeID.enemy, DeckDataRegistry.null_deck);

  await system.load();
  system.start();
}
