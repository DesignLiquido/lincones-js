import { Comando } from "./comando";

export class RemoverEntidade extends Comando {
    tipoEntidade: 'TABELA' | 'VISÃO';
    nomeEntidade: string;

    constructor(
        linha: number, 
        nomeEntidade: string, 
        tipoEntidade: string
    ) {
        super(linha);
        this.nomeEntidade = nomeEntidade;
        this.tipoEntidade = tipoEntidade as 'TABELA' | 'VISÃO';
    }
}
