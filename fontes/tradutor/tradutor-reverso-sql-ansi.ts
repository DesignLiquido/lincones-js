import { Comando } from "../comandos";

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
        return `"${String(nome).replace(/"/g, '""')}"`;
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

    protected traduzirColunaComTipo(coluna: any): string {
        let resultado = `${' '.repeat(this.tamanhoIndentacao)}${this.traduzirIdentificador(coluna.nome || coluna.name || coluna.column)}`;

        if (coluna.tipo || coluna.type) {
            resultado += ` ${String(coluna.tipo || coluna.type)}`;
        }

        if (coluna.notNull || coluna.not_null || coluna.notnull) {
            resultado += ` NAO NULO`;
        } else {
            resultado += ` NULO`;
        }

        if (typeof coluna.default !== "undefined") {
            resultado += ` PADRÃO ${this.traduzirValor(coluna.default)}`;
        }

        if (coluna.unique) {
            resultado += ` ÚNICA`;
        }

        return resultado;
    }

    protected traduzirComandoCriar(comando: Comando): string {
        const cmd: any = comando as any;
        const tabela = this.traduzirIdentificador(cmd.tabela || cmd.nome || cmd.table || "");
        const colunas = cmd.colunas || cmd.campos || cmd.definicoes || [];

        let resultado = `CRIAR TABELA ${tabela} (\n`;

        if (Array.isArray(colunas) && colunas.length > 0) {
            for (const coluna of colunas) {
                resultado += this.traduzirColunaComTipo(coluna);

                if (coluna.primaryKey || coluna.primary) {
                    resultado += ` CHAVE PRIMARIA`;
                    if (coluna.autoIncremento || coluna.autoincrement) {
                        resultado += ` AUTO INCREMENTO`;
                    }
                }

                resultado += ",\n";
            }

            resultado = resultado.slice(0, -2);
        }

        resultado += `\n)`;
        return resultado;
    }

    protected traduzirAlteracaoColuna(alteracao: any): string {
        const tipo = (alteracao.tipo || alteracao.type || "ADICIONAR").toString().toUpperCase();

        switch (tipo) {
            case "ADD":
            case "ADICIONAR":
                if (alteracao.definicao) {
                    return `ADICIONAR ${alteracao.definicao}`;
                }
                if (alteracao.coluna) {
                    const c = alteracao.coluna;
                    let partes = `${this.traduzirIdentificador(c.nome || c.name || c.column)}`;
                    if (c.tipo || c.type) {
                        partes += ` ${c.tipo || c.type}`;
                    }
                    if (c.notNull) {
                        partes += ` NAO NULO`;
                    }
                    return `ADICIONAR COLUNA ${partes}`;
                }
                break;

            case "DROP":
            case "EXCLUIR":
                if (alteracao.coluna) {
                    return `EXCLUIR COLUNA ${this.traduzirIdentificador(alteracao.coluna)}`;
                }
                if (alteracao.constraint) {
                    return `EXCLUIR RESTRIÇÃO ${this.traduzirIdentificador(alteracao.constraint)}`;
                }
                break;

            case "RENAME":
            case "RENOMEAR":
                return `RENOMEAR COLUNA ${this.traduzirIdentificador(alteracao.de || alteracao.from)} PARA ${this.traduzirIdentificador(alteracao.para || alteracao.to)}`;

            case "MODIFY":
            case "ALTER":
            case "ALTERAR":
                if (alteracao.coluna && alteracao.tipo) {
                    return `ALTERAR COLUNA ${this.traduzirIdentificador(alteracao.coluna)} TIPO ${alteracao.tipo}`;
                }
                break;
        }

        return String(alteracao.raw || alteracao.sql || "");
    }

    protected traduzirComandoAlterar(comando: Comando): string {
        const cmd: any = comando as any;
        const tabela = this.traduzirIdentificador(cmd.tabela || cmd.nome || cmd.table || "");
        const alteracoes = cmd.alteracoes || cmd.changes || cmd.modificacoes || [];

        if (!tabela || !Array.isArray(alteracoes) || alteracoes.length === 0) {
            return "";
        }

        let resultado = `ALTERAR TABELA ${tabela} `;

        const partes = alteracoes
            .map((a: any) => this.traduzirAlteracaoColuna(a))
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