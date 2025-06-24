import type error from "../../errors/error"
import type { Action } from "../../../_queenSystem/handler/actionGenrator"

type res = [error, undefined] | [undefined, Action[]]
export default res