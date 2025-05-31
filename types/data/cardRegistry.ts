export type cardData = {
    id: string;
    level: number;
    rarityID: number;
    archtype: string;

    extensionArr: string[];
    atk: number; //starting stat, think of these 2 as starting_maxAtk and starting_maxHp instead
    hp: number;
    effectIDs: string[];
    effectPartition: number[]

    //stuff for display purposes
    name: string;
    rarityStr: string;
    rarityHex: string;

    variantList: string[]
}
  
export type patchData = Partial<cardData>