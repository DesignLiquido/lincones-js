import { Condicao } from "./condicao";
import { Construto } from "./construto";

export type TipoJuncao = "INTERNA" | "ESQUERDA" | "DIREITA" | "COMPLETA" | "CRUZADA";

export class Juncao extends Construto {
    tipo: TipoJuncao;
    tabela: string;
    alias?: string;
    condicoes: Condicao[];

    constructor(tipo: TipoJuncao, tabela: string, condicoes: Condicao[] = [], alias?: string) {
        super();
        this.tipo = tipo;
        this.tabela = tabela;
        this.condicoes = condicoes;
        this.alias = alias;
    }

    toString(): string {
        const condicoes = this.condicoes.map((c) => c.toString()).join(", ");
        const alias = this.alias ? ` alias=${this.alias}` : "";
        return `<Juncao tipo=${this.tipo} tabela=${this.tabela}${alias} condicoes=[${condicoes}]>`;
    }
}
