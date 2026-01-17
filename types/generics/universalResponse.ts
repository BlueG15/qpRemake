import type error from "../../defaultImplementation/errors/error"
import type { Action } from "../../_queenSystem/handler/actionGenrator"

type res = [error, undefined] | [undefined, Action[]]
export default res