"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rarityRegistry = void 0;
var rarityRegistry;
(function (rarityRegistry) {
    rarityRegistry[rarityRegistry["r_white"] = 0] = "r_white";
    rarityRegistry[rarityRegistry["r_blue"] = 1] = "r_blue";
    rarityRegistry[rarityRegistry["r_green"] = 2] = "r_green";
    rarityRegistry[rarityRegistry["r_red"] = 3] = "r_red";
    rarityRegistry[rarityRegistry["r_ability"] = 4] = "r_ability";
    rarityRegistry[rarityRegistry["r_algo"] = 5] = "r_algo";
})(rarityRegistry || (exports.rarityRegistry = rarityRegistry = {}));
const rarityDataRegistry = {
    r_white: {
        hex: "#FFF",
        drop_weight: 10,
        backURL: {
            base: "https://qpproject.github.io/cardbg/0/white.png",
            upgrade_1: "https://qpproject.github.io/cardbg/1/white.png"
        }
    },
    r_blue: {
        hex: "#00F",
        drop_weight: 7,
        backURL: {
            base: "https://qpproject.github.io/cardbg/0/blue.png",
            upgrade_1: "https://qpproject.github.io/cardbg/1/blue.png"
        }
    },
    r_green: {
        hex: "#0F0",
        drop_weight: 4,
        backURL: {
            base: "https://qpproject.github.io/cardbg/0/green.png",
            upgrade_1: "https://qpproject.github.io/cardbg/1/green.png"
        }
    },
    r_red: {
        hex: "#F00",
        drop_weight: 1,
        backURL: {
            base: "https://qpproject.github.io/cardbg/0/red.png",
            upgrade_1: "https://qpproject.github.io/cardbg/1/red.png"
        }
    },
    r_ability: {
        hex: "#FF0",
        drop_weight: -1,
        backURL: {
            base: "https://qpproject.github.io/cardbg/0/yellow.png",
            upgrade_1: "https://qpproject.github.io/cardbg/1/yellow.png"
        }
    },
    r_algo: {
        hex: "#9F00A7",
        drop_weight: -1,
        backURL: {
            base: "https://qpproject.github.io/cardbg/0/purple.png",
            upgrade_1: "https://qpproject.github.io/cardbg/0/purple.png"
        }
    }
};
exports.default = rarityDataRegistry;
