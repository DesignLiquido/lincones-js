import { Alterar, Comando, Criar } from "../comandos";
import { Coluna, OperacaoAlteracaoTabela, Restricao } from "../construtos";

/**
 * Este tradutor traduz comandos de alto nível em LinConEs, 
 * normalmente lendo um arquivo em SQL ANSI e produzindo estruturas de alto
 * nível sobre eles.
 */
export class TradutorReversoSqlAnsi {
    tamanhoIndentacao: number;

    constructor(tamanhoIndentacao = 4) {
        this.tamanhoIndentacao = tamanhoIndentacao;
    }

    dicionarioComandos = {
        Alterar: this.traduzirComandoAlterar.bind(this),
        Atualizar: this.traduzirComandoAtualizar.bind(this),
        Criar: this.traduzirComandoCriar.bind(this),
        Excluir: this.traduzirComandoExcluir.bind(this),
        // ExcluirEntidade: this.traduzirComandoExcluirEntidade.bind(this),
        Inserir: this.traduzirComandoInserir.bind(this),
        Selecionar: this.traduzirComandoSelecionar.bind(this)
    };

    protected traduzirIdentificador(nome: string): string {
        if (!nome) return "";
        return `${String(nome).replace(/"/g, '""')} `;
    }

    protected traduzirValor(valor: any): string {
        if (valor === null || valor === undefined) {
            return "NULO";
        }
        
        if (typeof valor === "number" || typeof valor === "bigint") {
            return String(valor);
        }
        
        if (typeof valor === "boolean") {
            return valor ? "VERDADEIRO" : "FALSO";
        }
        
        return `'${String(valor).replace(/'/g, "''")}'`;
    }

    protected traduzirCondicoes(condicoes: any): string {
        if (!condicoes) return "";
        
        if (typeof condicoes === "string") {
            return condicoes;
        }
        
        if (Array.isArray(condicoes)) {
            return condicoes
                .map((c) => (typeof c === "string" ? c : this.traduzirCondicaoObjeto(c)))
                .filter((s) => s)
                .join(" E ");
        }
        
        return this.traduzirCondicaoObjeto(condicoes);
    }

    protected traduzirCondicaoObjeto(obj: any): string {
        if (!obj) return "";
        
        const partes: string[] = [];
        for (const chave of Object.keys(obj)) {
            const val = obj[chave];
            
            if (val && typeof val === "object" && "op" in val) {
                const op = (val.op || "=").toUpperCase();
                partes.push(`${this.traduzirIdentificador(chave)} ${op} ${this.traduzirValor(val.valor)}`);
            } else if (val === null) {
                partes.push(`${this.traduzirIdentificador(chave)} É NULO`);
            } else {
                partes.push(`${this.traduzirIdentificador(chave)} = ${this.traduzirValor(val)}`);
            }
        }
        
        return partes.join(" E ");
    }

    protected traduzirComandoInserir(comando: Comando): string {
        const cmd: any = comando as any;
        const tabela = this.traduzirIdentificador(cmd.tabela || cmd.nome || cmd.table || "");
        const valores = cmd.valores || cmd.registro || cmd.rows;
        
        if (!tabela) return "";

        if (!valores) {
            return `INSERIR EM ${tabela} VALORES PADRÃO`;
        }

        if (Array.isArray(valores)) {
            if (valores.length === 0) {
                return `INSERIR EM ${tabela} VALORES PADRÃO`;
            }
            
            const cols = Object.keys(valores[0]);
            const colList = cols.map((c) => this.traduzirIdentificador(c)).join(", ");
            const rows = valores
                .map((r: any) => `(${cols.map((c) => this.traduzirValor(r[c])).join(", ")})`)
                .join(", ");
            
            return `INSERIR EM ${tabela} (${colList})\nVALORES ${rows}`;
        }

        const cols = Object.keys(valores);
        const colList = cols.map((c) => this.traduzirIdentificador(c)).join(", ");
        const vals = cols.map((c) => this.traduzirValor((valores as any)[c])).join(", ");
        
        return `INSERIR EM ${tabela} (${colList})\nVALORES (${vals})`;
    }

    protected traduzirComandoAtualizar(comando: Comando): string {
        const cmd: any = comando as any;
        const tabela = this.traduzirIdentificador(cmd.tabela || cmd.nome || cmd.table || "");
        const valores = cmd.valores || cmd.set;
        const condicoes = this.traduzirCondicoes(cmd.condicoes || cmd.where);

        if (!tabela || !valores) return "";

        let resultado = `ATUALIZAR ${tabela}\n`;
        resultado += `DEFINIR`;

        const pares = Object.keys(valores)
            .map((c) => `${this.traduzirIdentificador(c)} = ${this.traduzirValor((valores as any)[c])}`)
            .join(", \n");

        resultado += ` ${pares}`;

        if (condicoes) {
            resultado += `\nONDE ${condicoes}`;
        }

        return resultado;
    }

    protected traduzirComandoExcluir(comando: Comando): string {
        const cmd: any = comando as any;
        const tabela = this.traduzirIdentificador(cmd.tabela || cmd.nome || cmd.table || "");
        const condicoes = this.traduzirCondicoes(cmd.condicoes || cmd.where);

        if (!tabela) return "";

        let resultado = `EXCLUIR DE ${tabela}`;

        if (condicoes) {
            resultado += `\nONDE ${condicoes}`;
        }

        return resultado;
    }

    protected traduzirComandoSelecionar(comando: Comando): string {
        const cmd: any = comando as any;
        const colunas = cmd.colunas || cmd.fields || cmd.campos || ["*"];
        const tabela = cmd.tabela || cmd.nome || cmd.from || cmd.table;
        const condicoes = this.traduzirCondicoes(cmd.condicoes || cmd.where);
        const orderBy = cmd.orderBy;
        const limit = cmd.limit;
        const offset = cmd.offset;

        let resultado = "SELECIONAR ";

        if (Array.isArray(colunas) && colunas.length > 0) {
            resultado += colunas
                .map((c) => (typeof c === "string" ? c : String(c)))
                .join(", ");
        } else {
            resultado += "*";
        }

        if (tabela) {
            const tabelaFormatada = Array.isArray(tabela) 
                ? tabela.join(", ") 
                : tabela;
            resultado += `\nDE ${tabelaFormatada}`;
        }

        if (condicoes) {
            resultado += `\nONDE ${condicoes}`;
        }

        if (orderBy) {
            resultado += ` ORDENAR POR ${orderBy}`;
        }

        if (typeof limit !== "undefined") {
            resultado += ` LIMITE ${Number(limit)}`;
        }

        if (typeof offset !== "undefined") {
            resultado += ` DESLOCAMENTO ${Number(offset)}`;
        }

        return resultado;
    }

    protected traduzirColunaComTipo(coluna: Coluna): string {
        let resultado = `${' '.repeat(this.tamanhoIndentacao)}${this.traduzirIdentificador(coluna.nomeColuna)}`;

        if (coluna.tipo) {
            resultado += `${String(coluna.tipo)} `;
        }

        if (coluna.nulo) {
            resultado += `NAO NULO `;
        } else {
            resultado += `NULO `;
        }

        // TODO: Implementar mais futuramente.
        /* if (typeof coluna.default !== "undefined") {
            resultado += `PADRÃO ${this.traduzirValor(coluna.default)} `;
        }

        if (coluna.unique) {
            resultado += `ÚNICA `;
        } */

        return resultado;
    }

    protected traduzirComandoCriar(comando: Criar): string {
        let resultado = `CRIAR TABELA `;

        resultado += `${comando.nomeEntidade} (\n`;

        for (const coluna of comando.colunas) {
            resultado += this.traduzirColunaComTipo(coluna);

            if (coluna.chavePrimaria) {
                resultado += 'CHAVE PRIMÁRIA ';
                if (coluna.autoIncremento) {
                    resultado += 'AUTO INCREMENTO ';
                }
            }

            resultado = resultado.slice(0, -1);
            resultado += ',\n';
        }

        resultado = resultado.slice(0, -2);
        resultado += `\n)`;
        return resultado;
    }

    protected traduzirTipoDeDados(tipo: string) {
        switch (tipo) {
            case 'INTEIRO':
                return 'INT';
            case 'LOGICO':
            case 'LÓGICO':
                return 'BOOLEAN';
            case 'NUMERO':
            case 'NÚMERO':
                return 'NUMERIC';
            case 'CARACTERES':
                return 'VARCHAR';
            case 'TEXTO':
                return 'TEXT';
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

    protected logicaManipulacaoColunas(elemento: Coluna | Restricao) {
        if (elemento instanceof Coluna) {
            let formatacaoColuna = `COLUNA ${elemento.nomeColuna} ${this.traduzirTipoDeDados(elemento.tipo)}`;
            if (elemento.tipo === 'CARACTERES') {
                formatacaoColuna += `(${elemento.tamanho.lexema})`;
            }

            formatacaoColuna += ` `;
            return formatacaoColuna;
        }

        if (elemento instanceof Restricao) {
            let formatacaoRestricao = `RESTRIÇÃO ${elemento.nome} ${this.traduzirTipoDeRestricao(elemento.tipo)} (`;
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

    protected traduzirAlteracaoColuna(operacao: OperacaoAlteracaoTabela): string {
        switch (operacao.tipo) {
            case "ADICIONAR":
                return `ADICIONAR ${this.logicaManipulacaoColunas(
                    operacao.elemento
                )}`;

            case "REMOVER":
                /* if (operacao.coluna) {
                    return `REMOVER COLUNA ${this.traduzirIdentificador(operacao.coluna)}`;
                }
                if (operacao.constraint) {
                    return `REMOVER RESTRIÇÃO ${this.traduzirIdentificador(operacao.constraint)}`;
                } */
                break;

            case "RENOMEAR":
                // return `RENOMEAR COLUNA ${this.traduzirIdentificador(operacao.de || operacao.from)} PARA ${this.traduzirIdentificador(operacao.para || operacao.to)}`;
                break;

            case "ALTERAR":
                return `ALTERAR COLUNA ${this.logicaManipulacaoColunas(
                    operacao.elemento
                )}`;
        }
    }

    protected traduzirComandoAlterar(comando: Alterar): string {
        const tabela = this.traduzirIdentificador(comando.nomeEntidade);

        let resultado = `ALTERAR TABELA ${tabela} `;

        const partes = comando.operacoes
            .map((a: OperacaoAlteracaoTabela) => this.traduzirAlteracaoColuna(a))
            .filter((s: string) => s);

        if (partes.length === 0) return "";

        resultado += partes.join(", ");

        return resultado;
    }

    traduzir(comandos: Comando[]): string {
        let resultado = '';

        for (const comando of comandos.filter((c) => c)) {
            resultado += `${this.dicionarioComandos[comando.constructor.name](comando)} \n`;
        }

        return resultado;
    }
}