import { Construto } from "./construto";

export class Literal extends Construto {
    valor: any;
    tipoPresumido: 'INTEIRO' | 'LOGICO' | 'NUMERO' | 'TEXTO';

    constructor(valor: any, tipoPresumido: 'INTEIRO' | 'LOGICO' | 'NUMERO' | 'TEXTO' = 'TEXTO') {
        super();
        this.valor = valor;
        this.tipoPresumido = tipoPresumido;
    }
}
