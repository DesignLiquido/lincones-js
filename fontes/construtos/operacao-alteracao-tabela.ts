import { Coluna } from "./coluna";
import { Construto } from "./construto";
import { Restricao } from "./restricao";

export class OperacaoAlteracaoTabela extends Construto {
    tipo: 'ADICIONAR' | 'ALTERAR' | 'REMOVER' | 'RENOMEAR';
    elemento: Coluna | Restricao;
    nomeAnterior?: string;

    constructor(
        tipo: string,
        elemento: Coluna | Restricao
    ) {
        super();
        const tipoOperacaoResolvido = tipo.toUpperCase();
        if (!['ADICIONAR', 'ALTERAR', 'REMOVER', 'RENOMEAR'].includes(tipoOperacaoResolvido)) {
            throw new Error(`Tipo de operação de alteração de tabela inválido: ${tipoOperacaoResolvido}`);
        }

        this.tipo = tipoOperacaoResolvido as 'ADICIONAR' | 'ALTERAR' | 'REMOVER' | 'RENOMEAR';
        this.elemento = elemento;
    }

    toString(): string {
        return `<OperaçãoAlteraçãoTabela tipo=${this.tipo} elemento=${this.elemento.toString()}>`;
    }
}