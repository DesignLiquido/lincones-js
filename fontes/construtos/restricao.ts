import { Construto } from "./construto";

/**
 * Uma restrição cria uma regra em uma tabela ou visão, que trabalha com uma ou mais colunas
 * da mesma tabela e/ou de outras tabelass relacionadas.
 */
export class Restricao extends Construto {
    nome: string;
    tipo: 'CHAVE_PRIMARIA' | 'CHAVE_ESTRANGEIRA' | 'ÚNICA';
    tabela: string;
    colunas: string[];
    tabelaReferenciada?: string;
    colunasReferenciadas?: string[];

    constructor(
        nome: string,
        tipo: 'CHAVE_PRIMARIA' | 'CHAVE_ESTRANGEIRA' | 'ÚNICA', 
        tabela: string, 
        colunas: string[], 
        tabelaReferenciada?: string, 
        colunasReferenciadas?: string[]
    ) {
        super();
        this.nome = nome;
        this.tipo = tipo;
        this.tabela = tabela;
        this.colunas = colunas;
        this.tabelaReferenciada = tabelaReferenciada;
        this.colunasReferenciadas = colunasReferenciadas;
    }

    toString(): string {
        let retorno = `<Restrição nome=${this.nome} tabela=${this.tabela} colunas=[`;

        for (const coluna of this.colunas) {
            retorno += coluna + `, `;
        }

        retorno = retorno.slice(0, -2);
        retorno += `]`;

        if (this.tabelaReferenciada) {
            retorno += ` tabela referenciada=${this.tabelaReferenciada}`;
        }

        if (this.colunasReferenciadas) {
            retorno += ` colunas referenciadas=[`;
            for (const coluna of this.colunasReferenciadas) {
                retorno += coluna + `, `;
            }

            retorno = retorno.slice(0, -2);
            retorno += `]`;
        }

        retorno += `>`;
        return retorno;
    }
}