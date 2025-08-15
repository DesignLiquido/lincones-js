import { Construto } from "./construto";

export class ParametroNomeado extends Construto {
    nome: string;

    constructor(nome: string) {
        super();
        this.nome = nome;
    }
    
    toString(): string {
        return `<ParâmetroNomeado nome=${this.nome}>`;
    }
}
