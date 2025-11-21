/**
 * Entry point for npm import
 * Role:
 * Import and export common symbols
 * List how to use if need be
 */
import globalLoader from "./global";
globalLoader.load()

import queenSystem from "./_queenSystem/queenSystem";

// game component
import Card from "./types/abstract/gameComponents/card";
import Effect from "./types/abstract/gameComponents/effect";

// zones
import Zone from "./types/abstract/gameComponents/zone";
import Zone_grid from "./types/abstract/gameComponents/zone_gridBased";
import Zone_stack from "./types/abstract/gameComponents/zone_stackBased";
import Ability from "./types/defaultZones/ability";
import Deck from "./types/defaultZones/deck";
import Drop from "./types/defaultZones/drop";
import Field from "./types/defaultZones/field";
import Grave from "./types/defaultZones/grave";
import Hand from "./types/defaultZones/hand";
import Storage from "./types/defaultZones/storage";
import System from "./types/defaultZones/system";
import Void from "./types/defaultZones/void";

// effect subtypes
import EffectSubtype from "./types/abstract/gameComponents/effectSubtype";
import Chained from "./types/effects/effectSubtypes/subtype_chained";
import Delayed from "./types/effects/effectSubtypes/subtype_delayed";
import FieldLock from "./types/effects/effectSubtypes/subtype_fieldLock";
import GraveLock from "./types/effects/effectSubtypes/subtype_graveLock";
import HandOrFieldLock from "./types/effects/effectSubtypes/subtype_hand_or_fieldLock";
import HardUnique from "./types/effects/effectSubtypes/subtype_hardUnique";
import Instant from "./types/effects/effectSubtypes/subtype_instant";
import Once from "./types/effects/effectSubtypes/subtype_once";
import Unique from "./types/effects/effectSubtypes/subtype_unique";

// effect types
import EffectType from "./types/abstract/gameComponents/effectType";
import InitEffect from "./types/effects/effectTypes/initEffect";
import LockEffect from "./types/effects/effectTypes/lockEffect";
import ManualEffect from "./types/effects/effectTypes/manualEffect";
import PassiveEffect from "./types/effects/effectTypes/passiveEffect";
import TriggerEffect from "./types/effects/effectTypes/triggerEffect";

// default settings
import {defaultSetting, Setting} from "./types/abstract/gameComponents/settings";

// serialized 
import { SerializedCard, Serialized_effect, SerializedPlayer, SerializedSystem, SerializedZone } from "./types/abstract/serializedGameComponents/Gamestate";

// localized
import { LocalizedAction, LocalizedCard, LocalizedEffect, LocalizedPlayer, LocalizedSystem, LocalizedZone } from "./types/abstract/serializedGameComponents/Localized";

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
import { DisplayComponent, IconComponent, ImageComponent, ReferenceComponent, SymbolComponent, TextComponent } from "./types/abstract/parser";

// enums
import actionRegistry from "./data/actionRegistry";
import { cardDataRegistry } from "./data/cardRegistry";
import effectDataRegistry from "./data/effectRegistry";
import effectTypeRegistry from "./data/effectTypeRegistry";
import operatorDataRegistry, { operatorRegistry } from "./data/operatorRegistry";
import rarityDataRegistry, { rarityRegistry } from "./data/rarityRegistry";
import zoneDataRegistry, { zoneRegistry } from "./data/zoneRegistry";
import subtypeRegistry from "./data/subtypeRegistry";
import { qpRenderer, sampleRenderer } from "./_queenSystem/renderer/rendererInterface";

const queenSystemComponents = {
    "gameComponent" : {
        "Action" : Action_class, 
        Card, 
        Effect, 
        Zone_grid, Zone_stack,
        "Zone" : {
            "ParentClass" : Zone,
            Ability, 
            Deck, 
            Drop,
            Field,
            Grave,
            Hand,
            Storage,
            System,
            Void
        },
        "EffectSubType" : {
            "ParentClass" : EffectSubtype,
            Chained, 
            Delayed, 
            FieldLock, 
            GraveLock, 
            HandOrFieldLock, 
            HardUnique, 
            Instant, 
            Once, 
            Unique
        },
        "EffectType" : {
            "ParentClass" : EffectType,
            InitEffect, 
            LockEffect,
            ManualEffect,
            PassiveEffect,
            TriggerEffect
        },
        "Serialized" : {
            SerializedCard,
            Serialized_effect,
            SerializedZone,
            SerializedPlayer,
            SerializedSystem,
        },
        "Localized" : {
            LocalizedAction,
            LocalizedCard,
            LocalizedEffect,
            LocalizedZone,
            LocalizedPlayer,
            LocalizedSystem,
        }
    },
    "systemComponent" : {
        "EffectTextParser" : Parser,
        "Localizer" : Localizer,
        "ActionGenerator" : actionConstructorRegistry,
        "InputRequester" : Request,
        "Renderer" : qpRenderer,
        "SampleRenderer" : sampleRenderer,
    },
    "displayComponent" : {
        "ParentClass" : DisplayComponent,
        TextComponent,
        IconComponent,
        ReferenceComponent,
        ImageComponent,
        SymbolComponent,
    },
    "registry" : {
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
    },
    "setting" : {
        defaultSetting,
        "settingClass" : Setting,
    },
    "mod" : {
        GameModule,
        ParserModule,
    },
};

export {queenSystem, queenSystemComponents, Utils as queenSystemUtils};
export default queenSystem

