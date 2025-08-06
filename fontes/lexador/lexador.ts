import { RetornoLexador } from '../interfaces/retornos';
import { LexadorBase } from './lexador-base';

export class Lexador extends LexadorBase {
    mapear(codigo: string[]): RetornoLexador {
        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;
        this.codigo = codigo || [''];
        this.simbolos = [];
        this.erros = [];

        while (!this.eFinalDoCodigo()) {
            this.inicioSimbolo = this.atual;
            this.analisarToken();
        }

        return {
            simbolos: this.simbolos,
            erros: this.erros
        } as RetornoLexador;
    }
}
