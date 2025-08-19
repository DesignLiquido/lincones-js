import { RetornoLexador } from "../interfaces/retornos";
import { LexadorBase } from "./lexador-base";

import palavrasReservadas from './palavras-reservadas/sql';
import tiposDeSimbolos from '../tipos-de-simbolos';

/**
 * O Lexador SQL ANSI transforma código SQL ANSI em um
 * vetor de símbolos, a serem passados para o avaliador sintático
 * correspondente.
 */
export class LexadorSqlAnsi extends LexadorBase {
    override identificarPalavraChave(): void {
        while (this.eAlfabetoOuDigito(this.simboloAtual())) {
            this.avancar();
        }

        const codigo: string = this.codigo[this.linha].substring(
            this.inicioSimbolo,
            this.atual
        ).toLowerCase();
        
        const tipo: string =
            codigo in palavrasReservadas
                ? palavrasReservadas[codigo]
                : tiposDeSimbolos.IDENTIFICADOR;

        this.adicionarSimbolo(tipo);
    }

    mapear(codigo: string[]): RetornoLexador {
        this.inicioSimbolo = 0;
        this.atual = 0;
        this.linha = 0;
        this.codigo = codigo || [''];
        this.simbolos = [];
        this.erros = [];

        for (let iterador = 0; iterador < this.codigo.length; iterador++) {
            this.codigo[iterador] += '\0';
        }

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
