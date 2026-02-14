import { Condicao, Juncao } from "../construtos";
import { Comando } from "./comando";

export class Selecionar extends Comando {
    tabela: string;
    colunas: string[];
    tudo: boolean;
    condicoes: Condicao[];
    juncoes: Juncao[];

    constructor(
        linha: number,
        tabela: string,
        colunas: string[],
        condicoes: Condicao[],
        tudo = false,
        juncoes: Juncao[] = []
    ) {
        super(linha);
        this.tabela = tabela;
        this.tudo = tudo;
        this.colunas = colunas;
        this.condicoes = condicoes;
        this.juncoes = juncoes;
    }
}