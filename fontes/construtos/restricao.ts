/**
 * Uma restrição cria uma regra em uma tabela ou visão, que trabalha com uma ou mais colunas
 * da mesma tabela e/ou de outras tabelass relacionadas.
 */
export class Restricao {
    tipo: 'CHAVE_PRIMARIA' | 'CHAVE_ESTRANGEIRA' | 'ÚNICA';

    constructor() {

    }
}