//TODO: rework this

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
    //TODO: offload the text attr to a localizer, here stores only the ids
    name: string;
    rarityStr: string;
    rarityHex: string;

    variantList: string[]
}
  
export type patchData = Partial<cardData>