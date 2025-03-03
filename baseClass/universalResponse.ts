import type error from "../specialActionTypes/error"
import type action from "./action"

type res = [error, undefined] | [undefined, action[]]
export default res