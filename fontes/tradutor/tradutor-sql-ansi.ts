import {
    Alterar,
    Atualizar,
    Comando,
    Criar,
    Excluir,
    Inserir,
    Selecionar
} from '../comandos';
import { Coluna, Construto, ParametroNomeado } from '../construtos';
import { Literal } from '../construtos/literal';
import { ReferenciaColuna } from '../construtos/referencia-coluna';
import { Restricao } from '../construtos/restricao';

import tiposDeSimbolos from '../tipos-de-simbolos/lincones';

/**
 * Este tradutor traduz comandos de alto nível em SQL ANSI, e a ideia é poder
 * utilizar para outros tradutores futuros, com pequenas nuances em
 * alguns comandos quando for o caso.
 */
export class TradutorSqlAnsi {
    tamanhoIndentacao: number;

    constructor(tamanhoIndentacao = 4) {
        this.tamanhoIndentacao = tamanhoIndentacao;
    }

    protected traduzirOperador(operador: string) {
        switch (operador) {
            case tiposDeSimbolos.IGUAL:
                return '=';
            case tiposDeSimbolos.VERDADEIRO:
                return true;
            case tiposDeSimbolos.FALSO:
                return false;
        }
    }

    protected traduzirTipoDeDados(tipo: string) {
        switch (tipo) {
            case 'INTEIRO':
                return 'INTEGER';
            case 'LOGICO':
                return 'BOOLEAN';
            case 'NUMERO':
                return 'INT';
            case 'TEXTO':
                return 'VARCHAR';
        }
    }

    protected traduzirTipoDeRestricao(tipo: string) {
        switch (tipo) {
            case 'CHAVE_PRIMARIA':
                return 'PRIMARY KEY';
            case 'CHAVE_ESTRANGEIRA':
                return 'FOREIGN KEY';
            case 'ÚNICA':
                return 'UNIQUE';
        }
    }

    protected traduzirConstruto(construto: Construto) {
        switch (construto.constructor.name) {
            case 'Literal':
                const construtoLiteral = construto as Literal;
                switch (construtoLiteral.tipoPresumido) {
                    case tiposDeSimbolos.LOGICO:
                        return construtoLiteral.valor.toUpperCase() === 'VERDADEIRO' ? 'TRUE' : 'FALSE';
                    case tiposDeSimbolos.TEXTO:
                        return `'${construtoLiteral.valor}'`;
                    case tiposDeSimbolos.INTEIRO:
                    default:
                        return `${String(construtoLiteral.valor)}`;
                }
            case 'ParametroAnonimo':
                return `?`;
            case 'ParametroNomeado':
                const construtoParametroNomeado = construto as ParametroNomeado;
                return `:${construtoParametroNomeado.nome}`;
            case 'ReferenciaColuna':
                const construtoReferenciaColuna = construto as ReferenciaColuna;
                return construtoReferenciaColuna.nomeColuna;
        }
    }

    protected traduzirColunaComTipo(coluna: Coluna) {
        let resultado = `${' '.repeat(this.tamanhoIndentacao)}${
            coluna.nomeColuna
        } ${this.traduzirTipoDeDados(coluna.tipo)}`;

        if (coluna.tamanho) {
            resultado += `(${coluna.tamanho.lexema}) `;
        }

        if (coluna.nulo) {
            resultado += `NULL `;
        } else {
            resultado += `NOT NULL `;
        }

        return resultado;
    }

    protected traduzirComandoAtualizar(comandoAtualizar: Atualizar) {
        let resultado = `UPDATE ${comandoAtualizar.tabela}\n`;
        resultado += `SET`;

        for (const valorAtualizacao of comandoAtualizar.colunasEValores) {
            resultado += ` ${this.traduzirConstruto(valorAtualizacao.coluna)} = ${this.traduzirConstruto(valorAtualizacao.valor)}, \n`;
        }

        resultado = resultado.slice(0, -3);
        resultado += `\nWHERE`;

        if (comandoAtualizar.condicoes.length > 0) {
            for (const condicao of comandoAtualizar.condicoes) {
                resultado += ` ${this.traduzirConstruto(condicao.esquerda)} ${this.traduzirOperador(condicao.operador)} ${this.traduzirConstruto(condicao.direita)}\nAND`;
            }

            resultado = resultado.slice(0, -4);
        }

        return resultado;
    }

    protected traduzirComandoCriar(comandoCriar: Criar) {
        let resultado = 'CREATE TABLE ';

        resultado += `${comandoCriar.nomeEntidade} (\n`;

        for (const coluna of comandoCriar.colunas) {
            resultado += this.traduzirColunaComTipo(coluna);

            if (coluna.chavePrimaria) {
                resultado += 'PRIMARY KEY ';
                if (coluna.autoIncremento) {
                    resultado += 'AUTOINCREMENT ';
                }
            }

            resultado = resultado.slice(0, -1);
            resultado += ',\n';
        }

        resultado = resultado.slice(0, -2);
        resultado += `\n)`;
        return resultado;
    }

    protected traduzirComandoExcluir(comandoExcluir: Excluir) {
        let resultado = 'DELETE FROM ';

        resultado += `${comandoExcluir.tabela}`;

        // Condições
        if (comandoExcluir.condicoes.length > 0) {
            resultado += '\nWHERE ';
            for (const condicao of comandoExcluir.condicoes) {
                resultado += ` ${this.traduzirConstruto(condicao.esquerda)} ${this.traduzirOperador(condicao.operador)} ${this.traduzirConstruto(condicao.direita)}\nAND`;
            }
            resultado = resultado.slice(0, -4);
        }

        return resultado;
    }

    protected traduzirComandoInserir(comandoInserir: Inserir) {
        let resultado = 'INSERT INTO ';
        resultado += `${comandoInserir.tabela} (`;

        for (const coluna of comandoInserir.colunas) {
            resultado += `${coluna}, `;
        }

        resultado = resultado.slice(0, -2);
        resultado += `)\nVALUES (`;

        for (const valor of comandoInserir.valores) {
            resultado += `${this.traduzirConstruto(valor)}, `;
        }

        resultado = resultado.slice(0, -2);
        resultado += `)`;

        return resultado;
    }

    protected traduzirComandoSelecionar(comandoSelecionar: Selecionar) {
        let resultado = 'SELECT ';

        // Colunas
        if (comandoSelecionar.tudo) {
            resultado += '*';
        } else {
            for (const coluna of comandoSelecionar.colunas) {
                resultado += coluna + ', ';
            }

            resultado = resultado.slice(0, -2);
        }

        resultado += `\nFROM ${comandoSelecionar.tabela}`;

        // Condições
        if (comandoSelecionar.condicoes.length > 0) {
            resultado += '\nWHERE ';
            for (const condicao of comandoSelecionar.condicoes) {
                resultado += ` ${this.traduzirConstruto(condicao.esquerda)} ${this.traduzirOperador(condicao.operador)} ${this.traduzirConstruto(condicao.direita)}\nAND`;
                /* resultado += `${
                    condicao.esquerda.lexema
                } ${this.traduzirOperador(condicao.operador)} ${
                    condicao.direita
                } AND `; */
            }
            resultado = resultado.slice(0, -4);
        }

        return resultado;
    }

    private logicaManipulacaoColunas(elemento: Coluna | Restricao) {
        if (elemento instanceof Coluna) {
            let formatacaoColuna = `COLUMN ${elemento.nomeColuna} ${this.traduzirTipoDeDados(elemento.tipo)}`;
            if (elemento.tipo === 'TEXTO') {
                formatacaoColuna += `(${elemento.tamanho.lexema})`;
            }

            formatacaoColuna += ` `;
            return formatacaoColuna;
        }

        if (elemento instanceof Restricao) {
            let formatacaoRestricao = `CONSTRAINT ${elemento.nome} ${this.traduzirTipoDeRestricao(elemento.tipo)} (`;
            for (const coluna of elemento.colunas) {
                formatacaoRestricao += coluna + ', ';
            }

            formatacaoRestricao = formatacaoRestricao.slice(0, -2);
            formatacaoRestricao += `) REFERENCES ${elemento.tabelaReferenciada} (`;
            for (const colunaReferenciada of elemento.colunasReferenciadas) {
                formatacaoRestricao += colunaReferenciada + ', ';
            }

            formatacaoRestricao = formatacaoRestricao.slice(0, -2);
            formatacaoRestricao += `) `;
            return formatacaoRestricao;
        }
    }

    private traduzirTipoEntidade(tipoEntidade: string) {
        switch (tipoEntidade.toUpperCase()) {
            case 'TABELA':
                return 'TABLE';
            case 'VISÃO':
            case 'VISAO':
                return 'VIEW';
        }
    }

    protected traduzirComandoAlterar(comandoAlterar: Alterar): string {
        let resultado = `ALTER ${this.traduzirTipoEntidade(comandoAlterar.tipoEntidade)} ${comandoAlterar.nomeEntidade} `;

        for (const operacao of comandoAlterar.operacoes) {
            switch (operacao.tipo) {
                case 'ADICIONAR':
                    resultado += `ADD ${this.logicaManipulacaoColunas(
                        operacao.elemento
                    )}`;
                    break;
                case 'ALTERAR':
                    resultado += `ALTER ${this.logicaManipulacaoColunas(
                        operacao.elemento
                    )}`;
                    break;
                case 'EXCLUIR':
                    resultado += 'BIT';
                    break;
                case 'RENOMEAR':
                    break;
            }
        }

        return resultado;
    }

    dicionarioComandos = {
        Alterar: this.traduzirComandoAlterar.bind(this),
        Atualizar: this.traduzirComandoAtualizar.bind(this),
        Criar: this.traduzirComandoCriar.bind(this),
        Excluir: this.traduzirComandoExcluir.bind(this),
        Inserir: this.traduzirComandoInserir.bind(this),
        Selecionar: this.traduzirComandoSelecionar.bind(this)
    };

    traduzir(comandos: Comando[]) {
        let resultado = '';

        for (const comando of comandos.filter((c) => c)) {
            resultado += `${this.dicionarioComandos[comando.constructor.name](
                comando
            )} \n`;
        }

        return resultado;
    }
}
