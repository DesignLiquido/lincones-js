import { Construto } from "../construtos";
import { Comando } from "./comando";

export class Inserir extends Comando {
    tabela: string;
    colunas: string[];
    valores: Construto[];

    constructor(linha: number, tabela: string, colunas: string[], valores: Construto[]) {
        super(linha);
        this.tabela = tabela;
        this.colunas = colunas;
        this.valores = valores;
    }
}