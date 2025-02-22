import { ColunaEValor, Condicao, Construto } from "../construtos";
import { Comando } from "./comando";

export class Atualizar extends Comando {
    tabela: string;
    colunasEValores: ColunaEValor[];
    condicoes: Condicao[];

    constructor(
        linha: number, 
        tabela: string, 
        colunasEValores: ColunaEValor[], 
        condicoes: Condicao[]
    ) {
        super(linha);
        this.tabela = tabela;
        this.colunasEValores = colunasEValores;
        this.condicoes = condicoes;
    }
}