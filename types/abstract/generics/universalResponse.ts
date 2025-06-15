import type error from "../../errors/error"
import type Action from "../gameComponents/action"

type res = [error, undefined] | [undefined, Action[]]
export default res