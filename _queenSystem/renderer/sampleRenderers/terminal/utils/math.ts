export function add(a: number, b: number) {
  return a + b;
}

export function rng(max : number, min : number, round : boolean){
    return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min
}
