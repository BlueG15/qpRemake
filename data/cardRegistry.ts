type cardData_general = {
  //realID = key_<creation index>

  //TO DO : translate old cardData to this

  //stuff for code purposes
  id: string;
  //importURL = base code path + "/id.ts"
  //imgURL = base image path + "/cards/id.png"
  //backgroundURL = base image path + "/cardbg/{isUpgraded ? 1 : 0}/rarityStr.png"
  
  //base image path : https://raw.githubusercontent.com/qpProject/qpProject.github.io/bfbdde7174971022b7bf95b7b591b5b94ee66c9d/
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
  //for mapping from the 3 (or less) display effects to the actual effects
  //arr length = 3
  //ex : 
  //[1, 1, 1] is the default for a full 3 effect card, meaning a 1 to 1 mapping
  //[1, 2, 1] means the middle display effects takes 2 effects in the actualization
  //the sum must match the count of actual effects
  
  //why? for the copy effect functionality

  //stuff for display purposes
  //DO NOT CHECK THIS FOR FUNCTIONALITY
  name: string;
  rarityStr: string;
  rarityHex: string;

  //note : these exist because the displayed effects are not the actual activated effects of the card
  //weird i know
  effectDisplayData_normal: effectDisplayDataItem[];
}

export type cardData_single = cardData_general & ({isUpgradable : false} | {
  isUpgradable: true;

  //upgraded version
  extensionArr_upgrade: string[];
  atk_upgrade: number;
  hp_upgrade: number;
  effectIDs_upgrade: string[];
  effectDisplayData_upgrade: effectDisplayDataItem[];
  effectPartition_upgrade: number[] //len <= 3
});

export type effectDisplayDataItem = {
  mainType : string
  subTypeArr : string[]
  XML : string
} 

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
  effectDisplayData: effectDisplayDataItem[];
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

import {default as cardData} from "./cardData"
export default cardData as Record<string, cardData_single>

export type allValidCardKeys = keyof typeof cardData