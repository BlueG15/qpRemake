type cardData_general = {
    importURL: string;
    //realID = key_<creation index>

    //TO DO : translate old cardData to this

    //stuff for code purposes
    id: string;
    level: number;
    rarityNumber: number;
    archtype: string;

    //normal version
    extensionArr_normal: string[];
    atk_normal: number; //starting stat, think of these 2 as starting_maxAtk and starting_maxHp instead
    hp_normal: number;
    effectID_normal: string[]; //note to self: make an effect registry yayyyy

    //stuff for display purposes
    //DO NOT CHECK THIS FOR FUNCTIONALITY
    name: string;
    imgURL: string;
    rarityStr: string;
    rarityHex: string;
    rarityBGURL: string;

    //note : these exist because the displayed effects are not the actual activated effects of the card
    //weird i know
    effectStr_normal: string[];
}

type cardData = cardData_general & ({isUpgradable : false} | {
    isUpgradable: true;

    //upgraded version
    extensionArr_upgrade: string[];
    atk_upgrade: number;
    hp_upgrade: number;
    effectID_upgrade: string[];
    effectStr_upgrade: string[];
});

let cardRegistry: Record<string, any> = {
  blank: {
    importURL: "../specificCard/blank.ts",
  },
};

export default cardRegistry;
