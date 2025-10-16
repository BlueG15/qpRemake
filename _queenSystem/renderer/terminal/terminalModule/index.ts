import { TerminalDebugModule } from "./debugModule";
import { TerminalMenuModule } from "./menuModule";
import { TerminalExitModule } from "./exitModule";
import { TerminalAutoInput } from "./autoInputModule";
import { qpFieldModule } from "./fieldModule";
import { qpDeckChoser } from "./deckChoser";

export default {
  debug : TerminalDebugModule,
  menu : TerminalMenuModule,
  exit : TerminalExitModule,
  input : TerminalAutoInput,
  field : qpFieldModule,
  chooseDeck : qpDeckChoser
}