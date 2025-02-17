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
}