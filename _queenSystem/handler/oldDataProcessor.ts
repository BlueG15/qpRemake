import cardData from "../../data/old/oldData/cards";
import { oldImgURL } from "../../data/cardRegistry";

type CSVString = string
class dataProcessor {
    Cards() : CSVString {
        let res = "name,archtype,rarity,effLen,done"
        Object.keys(cardData).forEach(k => {
            const key = k as keyof typeof cardData
            const obj = cardData[key]
            const data : string[] = [key]
            data.push(obj.name.displayName, obj.belongTo, obj.rarity, String(obj.effectCount), "0");
            res += "\n" + data.join(",");
        })
        return res;
    }
    Effects() : CSVString {
        let res = "index,desc,done"
        let a = 0
        const set = new Set<string>()
        Object.keys(cardData).forEach(k => {
            const key = k as keyof typeof cardData
            const obj = cardData[key]
            obj.effects.forEach(x => {
                set.add(x.effectText)
            })
            if(obj.isUpgradable){
                obj.upgraded.effects.forEach(x => {
                    set.add(x.effectText)
                })
            }
        })

        const set_sorted = Array.from(set.values()).sort()

        set_sorted.forEach(val => {
            // Replace any newline characters in val with a safe encoding (e.g., \n => \\n)
            const encodedVal = val.replace(/\n/g, "\\n");
            const data = [String(a), "\"" + encodedVal + "\"", "0"];
            res += "\n" + data.join(",");
            a++;
        });
        return res;
    }

    get0EffectCardsInCurrentFormat(){
        const rarity = ["white", "blue", "green", "red", "yellow", "purple"]
        const res : any = {}
        Object.keys(cardData).forEach(k => {
            const key = k as keyof typeof cardData
            const obj = cardData[key]
            if(obj.effects.length === 0 && (!obj.upgraded || obj.upgraded.effects.length === 0)){
                const obj1 = {
                            level : obj.level,
                            rarityID : rarity.indexOf(obj.rarity),
                            extensionArr : !obj.extention ? [] : [obj.extention],
                            belongTo : [obj.belongTo],
                            atk : obj.atk,
                            hp : obj.hp,
                            effects : {},
                            imgURL : `oldImgURL(${obj.name.codeName})`,
                            partition : [],
                        }
                const datum : any = {
                    variantData : {
                        base : obj1,
                    }
                }
                if(obj.isUpgradable){
                    const obj2 : Partial<{
                        atk : number,
                        hp : number,
                    }> = {
                        atk : obj.upgraded.atk,
                        hp : obj.upgraded.hp,
                    }
                    if(obj2.atk === obj1.atk) delete obj2.atk;
                    if(obj2.hp === obj1.hp) delete obj2.hp;
                    datum.variantData["upgrade_1"] = obj2
                }

                const str = obj.name.displayName

                res["c_" + str.split(".")[0].toLowerCase()] = datum
            }
        })
        return JSON.stringify(res, null, 4)
    }

    getGeneric(){
        const rarity = ["white", "blue", "green", "red", "yellow", "purple"]
        const res : any = {}
        Object.keys(cardData).forEach(k => {
            const key = k as keyof typeof cardData
            const obj = cardData[key]
            if(obj.belongTo === "generic"){
                const ex = obj.extention
                const obj1 = {
                            level : obj.level,
                            rarityID : rarity.indexOf(obj.rarity),
                            extensionArr : !obj.extention ? [] : [ex],
                            belongTo : [obj.belongTo],
                            atk : obj.atk,
                            hp : obj.hp,
                            effects : {},
                            imgURL : `oldImgURL(${obj.name.codeName})`,
                            partition : [],
                        }
                const datum : any = {
                    variantData : {
                        base : obj1,
                    }
                }
                if(obj.isUpgradable){
                    const obj2 : Partial<{
                        atk : number,
                        hp : number,
                        effects : {}
                    }> = {
                        atk : obj.upgraded.atk,
                        hp : obj.upgraded.hp,
                        effects : {}
                    }
                    if(obj2.atk === obj1.atk) delete obj2.atk;
                    if(obj2.hp === obj1.hp) delete obj2.hp;
                    datum.variantData["upgrade_1"] = obj2
                }

                const str = obj.name.displayName

                res["c_" + str.split(".")[0].toLowerCase()] = datum
            }
        })
        return JSON.stringify(res, null, 4)
    }
}

const Processor = new dataProcessor()
export default Processor