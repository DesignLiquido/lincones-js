import { Simbolo } from "../lexador/simbolo";
import { Comando } from "./comando";

export class Alterar extends Comando {
    public tabela: string;
    public nomeColuna: string;
    public tipo: 'INTEIRO' | 'LOGICO' | 'NUMERO' | 'TEXTO';
    public tamanho: number | Simbolo;
    public nulo: boolean;
    public chavePrimaria: boolean;
    public chaveEstrangeira: boolean;
    public autoIncremento: boolean;

    constructor(
            linha: number, 
            tabela: string, 
            nomeColuna: string,
            tipo: 'INTEIRO' | 'LOGICO' | 'NUMERO' | 'TEXTO',
            tamanho?: number | Simbolo,
            nulo?: boolean,
            chavePrimaria?: boolean,
            chaveEstrangeira?: boolean,
            autoIncremento?: boolean) 
    {
        super(linha);
        this.tabela = tabela;
        this.nomeColuna = nomeColuna;
        this.tipo = tipo;
        this.tamanho = tamanho || -1;
        
        this.nulo = nulo || false;
        this.chavePrimaria = chavePrimaria || false;
        this.chaveEstrangeira = chaveEstrangeira || false;
        this.autoIncremento = autoIncremento || false;
    }
}