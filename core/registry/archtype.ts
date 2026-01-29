import { BrandedNumber, BrandedString } from "../misc";
import { IDRegistry, Registry } from "./base";
import { ExtensionRegistry, type ExtensionID } from "./extension";

const DefaultArchtypes = {
    null : ExtensionRegistry.nknwn,
    enemy : ExtensionRegistry.enm,
} as const

type ArchtypeExtension = ExtensionID
type Archtype = typeof DefaultArchtypes
type ArchtypeID = BrandedNumber<Archtype>
type ArchtypeName = BrandedString<Archtype>
const ArchtypeRegistry = Registry.from<ArchtypeID, ArchtypeName, ArchtypeExtension, Archtype>(DefaultArchtypes)

export {
    ArchtypeID,
    ArchtypeName,
    ArchtypeRegistry
}

