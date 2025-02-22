import { Construto } from "./construto";
import { ReferenciaColuna } from "./referencia-coluna";

export class ColunaEValor extends Construto {
    coluna: ReferenciaColuna;
    valor: Construto;

    constructor(coluna: ReferenciaColuna, valor: Construto) {
        super();
        this.coluna = coluna;
        this.valor = valor;
    }

    toString(): string {
        return `<ColunaEValor coluna=${this.coluna.nomeColuna} valor=${this.valor.toString()}>`;
    }   
}
