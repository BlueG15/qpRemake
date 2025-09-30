// import { styleData, styleID } from "./textStyleRegistry";

//TO DO : add variant system
//change to a dynamic card system for variant to work
//cause variant may need to change more than just data if we dont want to make a quick version of every effect
type cardData_general = {
  //realID = key_<creation index>

  //stuff for code purposes
  id: string;
  //importURL = base code path + "/id.ts"
  //imgURL = base image path + "/cards/id.png"
  //backgroundURL = base image path + "/cardbg/{isUpgraded ? 1 : 0}/rarityStr.png"
  
  //base image path : https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/cards/
  level: number;
  rarityID: number;
  archtype: string;

  //normal version
  extensionArr_normal: string[];
  atk_normal: number; //starting stat, think of these 2 as starting_maxAtk and starting_maxHp instead
  hp_normal: number;
  effectIDs_normal: string[];
  effectPartition_normal: number[] //len <= 3

  //effect partition explanation
  //stores count of real effects per index
  //for groupings of actual effect for display purposes
  //ex : arr length = 3
  //[1, 1, 1] is the default for a full 3 effect card, meaning a 1 to 1 mapping
  //[1, 2, 1] means the middle display effects takes 2 effects in the actualization
  //the sum must match the count of actual effects
  
  //why? for the copy effect functionality

  //stuff for display purposes
  //DO NOT CHECK THIS FOR FUNCTIONALITY
  name: string;
  rarityStr: string;
  rarityHex: string;

  //obsolete, once done, delete
  //originally existed due to the decoupling between effect and effect text
  //now, i recoupled it, effects now provide their own text
  // effectDisplayData_normal?: any[];
}

export type cardData_single = cardData_general & ({isUpgradable : false} | {
  isUpgradable: true;

  //upgraded version
  extensionArr_upgrade: string[];
  atk_upgrade: number;
  hp_upgrade: number;
  effectIDs_upgrade: string[];
  effectPartition_upgrade: number[] 
});

export type cardData_merged = {
  id: string;
  level: number;
  rarityID: number;
  archtype: string;

  extensionArr: string[];
  atk: number; //starting stat, think of these 2 as starting_maxAtk and starting_maxHp instead
  hp: number;
  effectIDs: string[];

  //stuff for display purposes
  name: string;
  rarityStr: string;
  rarityHex: string;
  effectPartition: number[];
  
  isUpgraded: boolean,
  isUpgradable: boolean
}

export type cardData_statOnly = {
  id: string;
  level: number;
  rarityID: number;
  archtype: string;

  extensionArr: string[];
  atk: number; //starting stat, think of these 2 as starting_maxAtk and starting_maxHp instead
  hp: number;

  //stuff for display purposes
  name: string;
  rarityStr: string;
  rarityHex: string;

  isUpgraded: boolean,
  isUpgradable: boolean
}


export const rarityArr = ["white", "blue", "green", "purple", "yellow", "red"]
//also broken, but broken == not found = -1

import {default as cardData} from "./cardData_old"
export default cardData as Record<string, cardData_single>

export type allValidCardKeys = keyof typeof cardData