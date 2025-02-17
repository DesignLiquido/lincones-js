import { Construto } from "./construto";

export class Condicao extends Construto {
    esquerda: any;
    direita: any;
    operador: 'IGUAL' | 'MAIOR' | 'MAIOR_IGUAL' | 'MENOR' | 'MENOR_IGUAL';

    constructor(esquerda: any, operador: 'IGUAL' | 'MAIOR' | 'MAIOR_IGUAL' | 'MENOR' | 'MENOR_IGUAL', direita: any) {
        super();
        this.esquerda = esquerda;
        this.direita = direita;
        this.operador = operador;
    }
}