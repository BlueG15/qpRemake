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
  effectID_normal: string[];

  //stuff for display purposes
  //DO NOT CHECK THIS FOR FUNCTIONALITY
  name: string;
  rarityStr: string;
  rarityHex: string;

  //note : these exist because the displayed effects are not the actual activated effects of the card
  //weird i know
  effectStr_normal: effectData[];
}

export type cardData = cardData_general & ({isUpgradable : false} | {
  isUpgradable: true;

  //upgraded version
  extensionArr_upgrade: string[];
  atk_upgrade: number;
  hp_upgrade: number;
  effectID_upgrade: string[];
  effectStr_upgrade: effectData[];
});

export type effectData = {
  mainType : string
  subTypeArr : string[]
  XML : string
} 

import {default as cardData} from "./cardData"
export default cardData as Record<string, cardData>


