import {
    Alterar,
    Atualizar,
    Comando,
    Criar,
    Excluir,
    Inserir,
    Selecionar
} from '../comandos';
import { Coluna } from '../construtos';
import { SimboloInterface } from '../interfaces';
import { Simbolo } from '../lexador/simbolo';

import tiposDeSimbolos from '../tipos-de-simbolos';

/**
 * Este tradutor traduz sentenças em SQL ANSI, e a ideia é poder
 * utilizar para outros tradutores futuros, com pequenas nuances em
 * alguns comandos quando for o caso.
 */
export class Tradutor {
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

    protected traduzirTipo(tipo: string) {
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

    protected traduzirColunaComTipo(coluna: Coluna) {
        let resultado = `${" ".repeat(this.tamanhoIndentacao)}${coluna.nomeColuna} ${this.traduzirTipo(
                coluna.tipo
            )} `;

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
        let resultado = 'UPDATE ';
        resultado += `${comandoAtualizar.tabela}\nSET `;

        for (const valorAtualizacao of comandoAtualizar.colunasEValores) {
            if (valorAtualizacao.direita.tipo === tiposDeSimbolos.TEXTO) {
                resultado += `${valorAtualizacao.esquerda.lexema} = '${valorAtualizacao.direita.lexema}', `;
                continue;
            }
            if (
                [tiposDeSimbolos.VERDADEIRO, tiposDeSimbolos.FALSO].includes(
                    valorAtualizacao.direita.tipo
                )
            ) {
                resultado += `${
                    valorAtualizacao.esquerda.lexema
                } = ${this.traduzirOperador(valorAtualizacao.direita.tipo)}, `;
                continue;
            }
            resultado += `${valorAtualizacao.esquerda.lexema} = ${valorAtualizacao.direita.lexema}, `;
        }

        resultado = resultado.slice(0, -2);
        resultado += `\nWHERE `;

        if (comandoAtualizar.condicoes.length > 0) {
            for (const condicao of comandoAtualizar.condicoes) {
                resultado += `${
                    condicao.esquerda.lexema
                } ${this.traduzirOperador(condicao.operador)} ${
                    condicao.direita
                } AND `;
            }

            resultado = resultado.slice(0, -5);
        }

        return resultado;
    }

    protected traduzirComandoCriar(comandoCriar: Criar) {
        let resultado = 'CREATE TABLE ';

        resultado += `${comandoCriar.tabela} (\n`;

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
                resultado += `${
                    condicao.esquerda.lexema
                } ${this.traduzirOperador(condicao.operador)} ${
                    condicao.direita
                } AND `;
            }
            resultado = resultado.slice(0, -5);
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
            switch (valor.tipo) {
                case tiposDeSimbolos.FALSO:
                    resultado += 'FALSE, ';
                    break;
                case tiposDeSimbolos.TEXTO:
                    resultado += `'${valor.literal}', `;
                    break;
                case tiposDeSimbolos.VERDADEIRO:
                    resultado += 'TRUE, ';
                    break;
                default:
                    resultado += `${valor.literal}, `;
                    break;
            }
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
                resultado += `${
                    condicao.esquerda.lexema
                } ${this.traduzirOperador(condicao.operador)} ${
                    condicao.direita
                } AND `;
            }
            resultado = resultado.slice(0, -5);
        }

        return resultado;
    }

    protected traduzirComandoAlterar(comandoAlterar: Alterar): string {
        let resultado = `ALTER TABLE ${comandoAlterar.tabela} ADD COLUMN ${comandoAlterar.nomeColuna} `;

        switch (comandoAlterar.tipo) {
            case 'TEXTO':
                const numero = comandoAlterar.tamanho as SimboloInterface;
                resultado += `VARCHAR(${numero.literal})`;
                break;
            case 'INTEIRO':
                resultado += 'INTEGER';
                break;
            case 'LOGICO':
                resultado += 'BIT';
                break;
            case 'NUMERO':
                resultado += 'NUMBER';
                break;
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
