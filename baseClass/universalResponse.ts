import type error from "../actionTypes/error"
import type action from "./action"

type res = [error, undefined] | [undefined, action[]]
export default res