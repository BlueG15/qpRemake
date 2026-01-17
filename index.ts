/**
 * Entry point for npm import
 * Role:
 * Import and export common symbols
 * List how to use if need be
 */
import globalLoader from "./global";
globalLoader.load()

import QueenSystem from "./_queenSystem/queenSystem";

// game component
import Card from "./types/gameComponents/card";
import Effect from "./types/gameComponents/effect";

// zones
import Zone from "./types/gameComponents/zone";
import Zone_grid from "./types/gameComponents/zone_gridBased";
import Zone_stack from "./types/gameComponents/zone_stackBased";
import Ability from "./defaultImplementation/zones/ability";
import Deck from "./defaultImplementation/zones/deck";
import Drop from "./defaultImplementation/zones/drop";
import Field from "./defaultImplementation/zones/field";
import Grave from "./defaultImplementation/zones/grave";
import Hand from "./defaultImplementation/zones/hand";
import Storage from "./defaultImplementation/zones/storage";
import System from "./defaultImplementation/zones/system";
import Void from "./defaultImplementation/zones/void";

// effect subtypes
import EffectSubtype from "./types/gameComponents/effectSubtype";
import Chained from "./defaultImplementation/effectSubtypes/subtype_chained";
import Delayed from "./defaultImplementation/effectSubtypes/subtype_delayed";
import FieldLock from "./defaultImplementation/effectSubtypes/subtype_fieldLock";
import GraveLock from "./defaultImplementation/effectSubtypes/subtype_graveLock";
import HandOrFieldLock from "./defaultImplementation/effectSubtypes/subtype_hand_or_fieldLock";
import HardUnique from "./defaultImplementation/effectSubtypes/subtype_hardUnique";
import Instant from "./defaultImplementation/effectSubtypes/subtype_instant";
import Once from "./defaultImplementation/effectSubtypes/subtype_once";
import Unique from "./defaultImplementation/effectSubtypes/subtype_unique";

// effect types
import EffectType from "./types/gameComponents/effectType";
import InitEffect from "./defaultImplementation/effectTypes/initEffect";
import LockEffect from "./defaultImplementation/effectTypes/lockEffect";
import ManualEffect from "./defaultImplementation/effectTypes/manualEffect";
import PassiveEffect from "./defaultImplementation/effectTypes/passiveEffect";
import TriggerEffect from "./defaultImplementation/effectTypes/triggerEffect";

// default settings
import {defaultSetting, Setting} from "./types/gameComponents/settings";

// serialized 
import { SerializedCard, Serialized_effect, SerializedPlayer, SerializedSystem, SerializedZone } from "./types/serializedGameComponents/Gamestate";

// localized
import { LocalizedAction, LocalizedCard, LocalizedEffect, LocalizedPlayer, LocalizedSystem, LocalizedZone } from "./types/serializedGameComponents/Localized";

// parser
import Parser from "./effectTextParser";

// actions
import { Action_class, actionConstructorRegistry } from "./_queenSystem/handler/actionGenrator";

// Localizer
import Localizer from "./_queenSystem/handler/localizationHandler";

// input request generator
import Request from "./_queenSystem/handler/actionInputRequesterGenerator";

// modules
import GameModule from "./types/mods/gameModule";
import { ParserModule } from "./types/mods/effectTextParserModule";
import { DisplayComponent, IconComponent, ImageComponent, ReferenceComponent, SymbolComponent, TextComponent } from "./types/parser";

// enums
import actionRegistry from "./data/actionRegistry";
import { cardDataRegistry, quickCardData } from "./data/cardRegistry";
import effectDataRegistry, { quickEffectData } from "./data/effectRegistry";
import effectTypeRegistry from "./data/effectTypeRegistry";
import operatorDataRegistry, { operatorRegistry } from "./data/operatorRegistry";
import rarityDataRegistry, { rarityRegistry } from "./data/rarityRegistry";
import zoneDataRegistry, { playerTypeID, zoneRegistry } from "./data/zoneRegistry";
import subtypeRegistry from "./data/subtypeRegistry";
import { qpRenderer, sampleRenderer } from "./_queenSystem/renderer/rendererInterface";
import type { cardData, effectData } from "./data/cardRegistry";
import registryHandler from "./_queenSystem/handler/registryHandler";

export {
    //gameComponent
    Card, 
    Effect, 

    Zone,
    Zone_grid, Zone_stack,

    //Default zones
    Ability, 
    Deck, 
    Drop,
    Field,
    Grave,
    Hand,
    Storage,
    System,
    Void,

    //Effect subtypes
    EffectSubtype,
    Chained, 
    Delayed, 
    FieldLock, 
    GraveLock, 
    HandOrFieldLock, 
    HardUnique, 
    Instant, 
    Once, 
    Unique,

    //Effect type
    EffectType,
    InitEffect, 
    LockEffect,
    ManualEffect,
    PassiveEffect,
    TriggerEffect,

    //Serialized stuff
    SerializedCard,
    Serialized_effect,
    SerializedZone,
    SerializedPlayer,
    SerializedSystem,


    //Localized stuff
    LocalizedAction,
    LocalizedCard,
    LocalizedEffect,
    LocalizedZone,
    LocalizedPlayer,
    LocalizedSystem,

    //System components
    Parser,
    Localizer,
    actionConstructorRegistry as ActionGenerator,
    Request as Selector,
    qpRenderer,
    sampleRenderer,

    //Display component
    DisplayComponent,
    TextComponent,
    IconComponent,
    ReferenceComponent,
    ImageComponent,
    SymbolComponent,
    
    //Registries
    actionRegistry,
    cardDataRegistry,
    effectDataRegistry,
    effectTypeRegistry,
    operatorRegistry,
    operatorDataRegistry,
    rarityRegistry,
    rarityDataRegistry,
    subtypeRegistry,
    zoneRegistry,
    zoneDataRegistry,

    defaultSetting,
    Setting,

    GameModule,
    ParserModule,
    quickEffectData,
    quickCardData,

    playerTypeID
};


export type {cardData, effectData, registryHandler as registryAPI}

export * from "./data/systemRegistry";

//default effects 
export * from "./defaultImplementation/effects/e_defense"
export * from "./defaultImplementation/effects/e_generic"
export * from "./defaultImplementation/effects/e_status"

import type { Action } from "./_queenSystem/handler/actionGenrator";
export type { Action }

export {QueenSystem, Utils as queenSystemUtils};
export default QueenSystem

