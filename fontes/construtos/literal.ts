import { Construto } from "./construto";

export class Literal extends Construto {
    valor: any;
    tipoPresumido: 'CARACTERES' | 'INTEIRO' | 'LOGICO' | 'NUMERO' | 'TEXTO';

    constructor(valor: any, tipoPresumido: 'CARACTERES' | 'INTEIRO' | 'LOGICO' | 'NUMERO' | 'TEXTO' = 'CARACTERES') {
        super();
        this.valor = valor;
        this.tipoPresumido = tipoPresumido;
    }

    toString(): string {
        return `<Literal valor=${String(this.valor)} tipo presumido=${this.tipoPresumido}>`;
    }
}
