import card from "../baseClass/card";

class blankCard extends card {
  constructor(num: number) {
    super("blank", num);
    // this.id = `blank_${num}`
  }
}

export default blankCard;
