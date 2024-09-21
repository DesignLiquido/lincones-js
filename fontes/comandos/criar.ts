import { Coluna } from '../construtos';
import { Comando } from './comando';

export class Criar extends Comando {
    tipoEntidade: 'TABELA' | 'VISÃO';
    nomeEntidade: string;
    colunas: Coluna[];
    
    constructor(linha: number, nomeEntidade: string, colunas: Coluna[]) {
        super(linha);
        this.nomeEntidade = nomeEntidade;
        this.colunas = colunas;
    }
}
