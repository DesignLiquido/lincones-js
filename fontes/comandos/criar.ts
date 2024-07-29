import { Coluna } from '../construtos';
import { Comando } from './comando';

export class Criar extends Comando {
    public tabela: string;
    public colunas: Coluna[];
    
    constructor(linha: number, tabela: string, colunas: Coluna[]) {
        super(linha);
        this.tabela = tabela;
        this.colunas = colunas;
    }
}
