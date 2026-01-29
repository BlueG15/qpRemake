export const enum PlayerTypeID {
    player = 1,
    enemy = 2,
}

export type PlayerTypeName = keyof typeof PlayerTypeID

export const enum PlayerOppositeMap {
    player = PlayerTypeID.enemy,
    enemy = PlayerTypeID.player,
}