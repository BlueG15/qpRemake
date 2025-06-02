enum supporttedLanguages {
    "English" = 0,
    "Japanese",
    "testLang"
}

interface Setting {
    //load settings
    languageID : supporttedLanguages,
    languageStr : keyof typeof supporttedLanguages,
    mods : string[],

}

export {
    Setting,
    supporttedLanguages
}