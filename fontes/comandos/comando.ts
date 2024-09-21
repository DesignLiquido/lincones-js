export class Comando {
    linha: number;
    assinaturaMetodo: string;

    constructor(linha: number) {
        this.linha = linha;
        this.assinaturaMetodo = '<principal>';
    }

    async aceitar(visitante: any): Promise<never> {
        return Promise.reject(
            new Error('Este método não deveria ser chamado.')
        );
    }
}
