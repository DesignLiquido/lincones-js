import { Coluna } from '../construtos';
import { Comando } from './comando';

export class Criar extends Comando {
    tipoEntidade: 'TABELA' | 'VISÃO';
    nomeEntidade: string;
    colunas: Coluna[];
    seNaoExistir: boolean;
    
    constructor(linha: number, nomeEntidade: string, colunas: Coluna[], seNaoExistir = false) {
        super(linha);
        this.nomeEntidade = nomeEntidade;
        this.colunas = colunas;
        this.seNaoExistir = seNaoExistir;
    }
}
