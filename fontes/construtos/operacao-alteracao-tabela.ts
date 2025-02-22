import { Coluna } from "./coluna";
import { Construto } from "./construto";
import { Restricao } from "./restricao";

export class OperacaoAlteracaoTabela extends Construto {
    tipo: 'ADICIONAR' | 'ALTERAR' | 'EXCLUIR' | 'RENOMEAR';
    elemento: Coluna | Restricao;

    constructor(
        tipo: string, 
        elemento: Coluna | Restricao
    ) {
        super();
        const tipoOperacaoResolvido = tipo.toUpperCase();
        if (!['ADICIONAR', 'ALTERAR', 'EXCLUIR', 'RENOMEAR'].includes(tipoOperacaoResolvido)) {
            throw new Error(`Tipo de operação de alteração de tabela inválido: ${tipoOperacaoResolvido}`);
        }

        this.tipo = tipoOperacaoResolvido as 'ADICIONAR' | 'ALTERAR' | 'EXCLUIR' | 'RENOMEAR';
        this.elemento = elemento;
    }

    toString(): string {
        return `<OperaçãoAlteraçãoTabela tipo=${this.tipo} elemento=${this.elemento.toString()}>`;
    }
}