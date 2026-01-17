const cardData = require("./cards.js").default
const fs = require("fs")

let text = []
let prevArchtype = ""

for(const [key, val] of Object.entries(cardData).sort((a, b) => a[1].belongTo > b[1].belongTo)){
    const bl = val.belongTo
    if(["enemy", "boss", "other", "potion", "sp"].includes(bl)) continue;

    if(bl !== prevArchtype){
        if(prevArchtype) text.push("");
        prevArchtype = bl
    }

    const name = String(val.name.displayName.split(".")[0]).toLowerCase()
    for(let i = 0; i < val.effectCount; i++){
        const e = val.effects[i]
        if(!e) continue;
        const e_name = "e_" + name + (val.effectCount === 0 ? "" : "_" + (i + 1) )
        const type = e.effectType
        const info = [e_name, ...type].join(",")
        text.push(info)

        const t = e.effectText
        let j = 50;
        for(; j >= 0; j--){
            if(t.includes(`{${j}}`)) break;
        }
        if(j === 0) continue;
        for(let x = 0; x <= j; x++){
            text.push(`var_${x}`)
        }
        text.push("")
    }
}

fs.writeFileSync("./.temp.csv", text.join("\n"))