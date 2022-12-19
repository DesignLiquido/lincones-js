import { Atualizar, Comando, Criar, Inserir, Selecionar } from "../comandos";

import tiposDeSimbolos from "../tipos-de-simbolos";

export class Tradutor {

    private traduzirOperador(operador: string) {
        switch (operador) {
            case tiposDeSimbolos.IGUAL:
                return '=';
            case tiposDeSimbolos.VERDADEIRO:
                return true;
            case tiposDeSimbolos.FALSO:
                return false;
        }
    }

    private traduzirTipo(tipo: string) {
        switch (tipo) {
            case 'INTEIRO':
                return 'INT';
            case 'LOGICO':
                return 'BOOLEAN';
            case 'NUMERO':
                return 'INT';
            case 'TEXTO':
                return 'VARCHAR';
        }
    }

    private traduzirComandoAtualizar(comandoAtualizar: Atualizar) {
        let resultado = 'UPDATE ';
        resultado += `${comandoAtualizar.tabela}\nSET `

        for (const valorAtualizacao of comandoAtualizar.colunasEValores) {
            if(valorAtualizacao.direita.tipo === tiposDeSimbolos.TEXTO){
                resultado += `${valorAtualizacao.esquerda.lexema} = '${valorAtualizacao.direita.lexema}', `
                continue;
            }
            if([tiposDeSimbolos.VERDADEIRO, tiposDeSimbolos.FALSO].includes(valorAtualizacao.direita.tipo)){
                resultado += `${valorAtualizacao.esquerda.lexema} = ${this.traduzirOperador(valorAtualizacao.direita.tipo)}, `;
                continue;
            }
            resultado += `${valorAtualizacao.esquerda.lexema} = ${valorAtualizacao.direita.lexema}, `;
        }

        resultado = resultado.slice(0, -2);
        resultado += `\nWHERE `

        if (comandoAtualizar.condicoes.length > 0) {
            for (const condicao of comandoAtualizar.condicoes) {
                resultado += `${condicao.esquerda.lexema} ${this.traduzirOperador(condicao.operador)} ${condicao.direita} AND `;
            }

            resultado = resultado.slice(0, -5);
        }

        return resultado;
    }

    private traduzirComandoCriar(comandoCriar: Criar) {
        let resultado = 'CREATE TABLE ';

        resultado += `${comandoCriar.tabela} (\n`;

        for (const coluna of comandoCriar.colunas) {
            resultado += `    ${coluna.nomeColuna} ${this.traduzirTipo(coluna.tipo)} `;
            if (coluna.nulo) {
                resultado += `NULL `;
            } else {
                resultado += `NOT NULL `;
            }

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

    private traduzirComandoExcluir() {
        return '';
    }

    private traduzirComandoInserir(comandoInserir: Inserir) {
        let resultado = 'INSERT INTO ';
        resultado += `${comandoInserir.tabela} (`;

        for (const coluna of comandoInserir.colunas) {
            resultado += `${coluna}, `;
        }

        resultado = resultado.slice(0, -2);
        resultado += `)\nVALUES (`;

        for (const valor of comandoInserir.valores) {
            if (typeof valor.literal === "string") {
                resultado += `"${valor.literal}", `;
            } else {
                resultado += `${valor.literal}, `;
            }
        }

        resultado = resultado.slice(0, -2);
        resultado += `)`;

        return resultado;
    }

    private traduzirComandoSelecionar(comandoSelecionar: Selecionar) {
        let resultado = 'SELECT ';

        // Colunas
        if (comandoSelecionar.tudo) {
            resultado += '*'
        } else {
            for (const coluna of comandoSelecionar.colunas) {
                resultado += coluna + ', ';
            }

            resultado = resultado.slice(0, -2);
        }

        resultado += `\nFROM ${comandoSelecionar.tabela}`;

        // Condições
        if (comandoSelecionar.condicoes.length > 0) {
            resultado += '\n WHERE ';
            for (const condicao of comandoSelecionar.condicoes) {
                resultado += `${condicao.esquerda.lexema} ${this.traduzirOperador(condicao.operador)} ${condicao.direita} AND `;
            }
            resultado = resultado.slice(0, -5);
        }

        return resultado;
    }

    dicionarioComandos = {
        Atualizar: this.traduzirComandoAtualizar.bind(this),
        Criar: this.traduzirComandoCriar.bind(this),
        Excluir: this.traduzirComandoExcluir.bind(this),
        Inserir: this.traduzirComandoInserir.bind(this),
        Selecionar: this.traduzirComandoSelecionar.bind(this)
    }

    traduzir(comandos: Comando[]) {
        let resultado = '';

        for (const comando of comandos.filter(c => c)) {
            resultado += `${this.dicionarioComandos[comando.constructor.name](comando)} \n`;
        }

        return resultado;
    }
}