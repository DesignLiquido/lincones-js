import { Simbolo } from "../lexador/simbolo";
import { Construto } from "./construto";

export class Coluna extends Construto {
    nomeColuna: string;
    tipo?: 'CARACTERES' | 'INTEIRO' | 'LOGICO' | 'NUMERO' | 'TEXTO';
    tamanho: Simbolo | undefined;
    nulo: boolean;
    chavePrimaria: boolean;
    chaveEstrangeira: boolean;
    autoIncremento: boolean;

    constructor(
        nomeColuna: string,
        tipo?: string,
        tamanho?: Simbolo,
        nulo?: boolean,
        chavePrimaria?: boolean,
        chaveEstrangeira?: boolean,
        autoIncremento?: boolean
    ) {
        super();
        this.nomeColuna = nomeColuna;

        if (tipo) {
            const tipoColunaResolvido = tipo.toUpperCase();
            if (!['CARACTERES', 'INTEIRO', 'LOGICO', 'NUMERO', 'TEXTO'].includes(tipoColunaResolvido)) {
                throw new Error(`Tipo de dados de coluna inválido: ${tipoColunaResolvido}`);
            }

            this.tipo = tipoColunaResolvido as 'CARACTERES' | 'INTEIRO' | 'LOGICO' | 'NUMERO' | 'TEXTO';
        }
        
        this.tamanho = tamanho;
        
        this.nulo = nulo === true ? true : false;
        this.chavePrimaria = chavePrimaria || false;
        this.chaveEstrangeira = chaveEstrangeira || false;
        this.autoIncremento = autoIncremento || false;
    }

    toString(): string {
        let retorno = `<Coluna nome=${this.nomeColuna} tipo=${this.tipo}`;
        if (this.tamanho) {
            retorno += ` tamanho=${this.tamanho.lexema}`;
        }

        retorno += ` nulo=${this.nulo ? 'Sim' : 'Não'}`;

        if (this.chavePrimaria) {
            retorno += ` chave primária;`;
        }

        if (this.chaveEstrangeira) {
            retorno += ` chave estrangeira;`;
        }

        if (this.autoIncremento) {
            retorno += ` auto incremento;`;
        }

        retorno += `>`;
        return retorno;
    }
}
