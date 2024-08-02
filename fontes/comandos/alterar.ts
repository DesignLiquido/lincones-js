import { OperacaoAlteracaoTabela } from "../construtos/operacao-alteracao-tabela";
import { Comando } from "./comando";

export class Alterar extends Comando {
    tipoEntidade: 'TABELA' | 'VISÃO';
    nomeEntidade: string;
    operacoes: OperacaoAlteracaoTabela[];

    constructor(
        linha: number, 
        nomeEntidade: string, 
        operacoes: OperacaoAlteracaoTabela[]
    ) {
        super(linha);
        this.nomeEntidade = nomeEntidade;
        this.operacoes = operacoes;
    }
}
