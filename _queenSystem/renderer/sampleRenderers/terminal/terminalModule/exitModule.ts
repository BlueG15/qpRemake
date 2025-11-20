import { TerminalModule } from "../terminal/utils";

export class TerminalExitModule extends TerminalModule {
  override start(): void {
    process.exit(0)
  }
}