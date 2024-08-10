/**
 * Uma restrição cria uma regra em uma tabela ou visão, que trabalha com uma ou mais colunas
 * da mesma tabela e/ou de outras tabelass relacionadas.
 */
export class Restricao {
    tipo: 'CHAVE_PRIMARIA' | 'CHAVE_ESTRANGEIRA' | 'ÚNICA';
    tabela: string;
    colunas: string[];
    tabelaReferenciada?: string;
    colunasReferenciadas?: string[];

    constructor(
        tipo: 'CHAVE_PRIMARIA' | 'CHAVE_ESTRANGEIRA' | 'ÚNICA', 
        tabela: string, 
        colunas: string[], 
        tabelaReferenciada?: string, 
        colunasReferenciadas?: string[]
    ) {
        this.tipo = tipo;
        this.tabela = tabela;
        this.colunas = colunas;
        this.tabelaReferenciada = tabelaReferenciada;
        this.colunasReferenciadas = colunasReferenciadas;
    }
}