import { Construto } from "./construto";

export class ReferenciaColuna extends Construto {
    nomeColuna: string;

    constructor(nomeColuna: string) {
        super();
        this.nomeColuna = nomeColuna;
    }

    toString(): string {
        return `<ReferênciaColuna nome da coluna=${this.nomeColuna}>`;
    }
}
