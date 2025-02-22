import { Construto } from "./construto";

export class Condicao extends Construto {
    esquerda: Construto;
    direita: Construto;
    operador: 'IGUAL' | 'MAIOR' | 'MAIOR_IGUAL' | 'MENOR' | 'MENOR_IGUAL';

    constructor(
        esquerda: Construto, 
        operador: 'IGUAL' | 'MAIOR' | 'MAIOR_IGUAL' | 'MENOR' | 'MENOR_IGUAL', 
        direita: Construto
    ) {
        super();
        this.esquerda = esquerda;
        this.direita = direita;
        this.operador = operador;
    }

    toString(): string {
        let retorno = `<Condição`;

        retorno += ` operando esquerdo=${this.esquerda.toString()}`;
        retorno += ` operador=${this.operador}`;
        retorno += ` operando direito=${this.direita.toString()}`;
        retorno += `>`;

        return retorno;
    }
}