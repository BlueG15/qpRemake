import StatusEffect_base from "./_statusEffect_base";

export default class genericCounter extends StatusEffect_base {
    override get mergeSignature(): string | undefined {
        return "generic_counter";
    }

    override merge(mergeTargets: StatusEffect_base[]): StatusEffect_base[] {
        let c = this.count;
        mergeTargets.forEach(i => c += (i.attr.get("count") ?? 1));
        this.count = c;
        return [this];
    }

    get count() : number {return this.attr.get("count") ?? 1}
    set count(val : number){this.attr.set("count", val)}

    override getDisplayInput(): (string | number)[] {
        return [this.count]
    }
}