import { ParametroInterface } from "../interfaces/parametro-interface";

export class Comando {
    linha: number;
    assinaturaMetodo: string;
    parametros: ParametroInterface[];

    constructor(linha: number) {
        this.linha = linha;
        this.assinaturaMetodo = '<principal>';
        this.parametros = [];
    }

    async aceitar(visitante: any): Promise<never> {
        return Promise.reject(
            new Error('Este método não deveria ser chamado.')
        );
    }
}
