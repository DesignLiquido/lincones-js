import { AvaliadorSintaticoBase } from './avaliador-sintatico-base';
import {
    Alterar,
    Atualizar,
    Criar,
    Excluir,
    RemoverEntidade,
    Inserir,
    Selecionar
} from '../comandos';
import { SimboloInterface } from '../interfaces';
import { Coluna, ColunaEValor, Construto, Literal, OperacaoAlteracaoTabela, ParametroAnonimo, ParametroNomeado, ReferenciaColuna } from '../construtos';

import tiposDeSimbolos from '../tipos-de-simbolos';

/**
 * O Avaliador Sintático SQL ANSI analisa _tokens_ em inglês (CREATE, SELECT, etc.)
 * e produz as mesmas estruturas de comando que o avaliador sintático base.
 */
export class AvaliadorSintaticoSqlAnsi extends AvaliadorSintaticoBase {
    
    private traduzirTipoDeDados(tipoSql: string): string {
        const tipoUpper = tipoSql.toUpperCase();
        switch (tipoUpper) {
            case 'INTEGER':
            case 'INT':
                return 'INTEIRO';
            case 'BOOLEAN':
            case 'BOOL':
                return 'LOGICO';
            case 'VARCHAR':
            case 'CHAR':
                return 'CARACTERES';
            case 'TEXT':
                return 'TEXTO';
            case 'NUMBER':
            case 'NUMERIC':
            case 'DECIMAL':
                return 'NUMERO';
            default:
                return tipoSql;
        }
    }

    protected override logicaAdicionarOuAlterarColuna(
        simboloNomeDaColuna: SimboloInterface
    ): Coluna {
        // Tipo de dados
        const simboloTipoElemento = this.avancarEDevolverAnterior();
        let tamanhoElemento = null;

        if (![
            tiposDeSimbolos.CARACTERES,
            tiposDeSimbolos.INTEIRO,
            tiposDeSimbolos.LOGICO,
            tiposDeSimbolos.NUMERO,
            tiposDeSimbolos.TEXTO
        ].includes(simboloTipoElemento.tipo)) {
            throw this.erro(simboloTipoElemento, `Tipo de coluna inválido para operação de adição ou alteração de coluna. Tipos válidos: inteiro, lógico ou texto. Obtido: ${simboloTipoElemento.tipo}.`);
        }

        if (simboloTipoElemento.tipo === tiposDeSimbolos.CARACTERES) {
            if (
                this.verificarSeSimboloAtualEIgualA(
                    tiposDeSimbolos.PARENTESE_ESQUERDO
                )
            ) {
                tamanhoElemento = this.consumir(
                    tiposDeSimbolos.NUMERO,
                    'Esperado tamanho de texto de coluna em comando de criação de tabela.'
                );
                this.consumir(
                    tiposDeSimbolos.PARENTESE_DIREITO,
                    'Esperado parêntese direito após declaração de tamanho de coluna em comando de criação de tabela.'
                );
            }
        }

        // Nulo/Não Nulo
        let nulo = true;
        if (
            this.verificarSeSimboloAtualEIgualA(
                tiposDeSimbolos.NAO,
                tiposDeSimbolos.NULO
            )
        ) {
            const simboloAnterior = this.simbolos[this.atual - 1];
            switch (simboloAnterior.tipo) {
                case tiposDeSimbolos.NAO:
                    this.consumir(
                        tiposDeSimbolos.NULO,
                        'Esperado palavra reservada "NULO" após palavra reservada "NÃO" em declaração de coluna em comando de criação de tabela.'
                    );
                    nulo = false;
                    break;
                case tiposDeSimbolos.NULO:
                default:
                    break;
            }
        }

        // Chave primária?
        const [chavePrimaria, autoIncremento] = this.logicaChavePrimaria();

        return new Coluna(
            simboloNomeDaColuna.lexema,
            simboloTipoElemento.tipo,
            tamanhoElemento ? tamanhoElemento : undefined,
            nulo,
            chavePrimaria,
            false,
            autoIncremento
        )
    }

    protected override logicaChavePrimaria(): boolean[] {
        let chavePrimaria = false;
        const autoIncremento = false;
        if (this.verificarTipoSimboloAtual(tiposDeSimbolos.PRIMARIA)) {
            this.avancar();
            switch (this.simbolos[this.atual].tipo) {
                case tiposDeSimbolos.CHAVE:
                    chavePrimaria = true;
                    this.avancar();
                    // TODO: Aparentemente, SQL ANSI não é padronizado na questão de
                    // auto incremento.
                    /* if (
                        this.verificarSeSimboloAtualEIgualA(
                            tiposDeSimbolos.AUTO
                        )
                    ) {
                        this.consumir(
                            tiposDeSimbolos.INCREMENTO,
                            'Esperado palavra reservada "INCREMENTO" após palavra reservada "AUTO" em declaração de coluna em comando de criação de tabela.'
                        );
                        autoIncremento = true;
                    } */
                    break;
                default:
                    throw this.erro(
                        this.simbolos[this.atual],
                        'Esperado palavra reservada "PRIMARIA" após palavra reservada "CHAVE" na definição de coluna em comando de criação de tabela.'
                    );
            }
        }

        return [chavePrimaria, autoIncremento];
    }

    protected logicaComumOperando(): Construto {
        const simboloOperando = this.avancarEDevolverAnterior();
        switch (simboloOperando.tipo) {
            case tiposDeSimbolos.IDENTIFICADOR:
                return new ReferenciaColuna(simboloOperando.lexema);
            case tiposDeSimbolos.CARACTERES:
            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.TEXTO:
                return new Literal(simboloOperando.literal || simboloOperando.lexema, this.inferirTipoOperando(simboloOperando.tipo));
            case tiposDeSimbolos.VERDADEIRO:
            case tiposDeSimbolos.FALSO:
                return new Literal(simboloOperando.lexema === 'TRUE' ? 'VERDADEIRO' : 'FALSO', this.inferirTipoOperando(simboloOperando.tipo));
            case tiposDeSimbolos.INTERROGACAO:
                return new ParametroAnonimo();
            case tiposDeSimbolos.DOIS_PONTOS:
                if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IDENTIFICADOR)) {
                    throw this.erro(
                        simboloOperando,
                        'Esperado identificador após dois pontos em condição, para definição de parâmetro.'
                    );
                }

                const simboloParametro = this.simbolos[this.atual - 1];
                return new ParametroNomeado(simboloParametro.lexema);
            default:
                throw this.erro(
                    simboloOperando,
                    `Esperado identificador, número, texto, verdadeiro, falso ou parâmetro anônimo após operador em condição. Obtido: ${simboloOperando.tipo}.`
                );
        }
    }

    protected override comandoCriacaoColuna(): Coluna {
        // Nome da coluna
        const nomeDaColuna = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de coluna em comando de criação de tabela.'
        );

        // Tipo de dados - pode vir como IDENTIFICADOR (VARCHAR, INTEGER, etc.)
        const simboloTipo = this.avancarEDevolverAnterior();
        
        const tipoColuna = this.traduzirTipoDeDados(simboloTipo.lexema);
        let tamanhoColuna = null;

        // Tamanho (VARCHAR(120), CHAR(50), etc.)
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
            tamanhoColuna = this.consumir(
                tiposDeSimbolos.NUMERO,
                'Esperado tamanho de texto de coluna em comando de criação de tabela.'
            );
            this.consumir(
                tiposDeSimbolos.PARENTESE_DIREITO,
                'Esperado parêntese direito após declaração de tamanho de coluna em comando de criação de tabela.'
            );
        }

        // NOT NULL / NULL
        let nulo = true;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NAO, tiposDeSimbolos.NULO)) {
            const simboloAnterior = this.simbolos[this.atual - 1];
            switch (simboloAnterior.tipo) {
                case tiposDeSimbolos.NAO:
                    this.consumir(
                        tiposDeSimbolos.NULO,
                        'Esperado palavra reservada "NULO" após palavra reservada "NÃO" em declaração de coluna em comando de criação de tabela.'
                    );
                    nulo = false;
                    break;
                case tiposDeSimbolos.NULO:
                default:
                    break;
            }
        }

        // Chave primária?
        const [chavePrimaria, autoIncremento] = this.logicaChavePrimaria();

        return new Coluna(
            nomeDaColuna.lexema,
            tipoColuna,
            tamanhoColuna,
            nulo,
            chavePrimaria,
            false,
            autoIncremento
        );
    }

    protected override comandoCriar(): Criar {
        // CREATE
        this.consumir(
            tiposDeSimbolos.CRIAR,
            'Esperado palavra reservada "CREATE".'
        );

        // TABLE
        const simboloTabela = this.consumir(
            tiposDeSimbolos.TABELA,
            'Esperado palavra reservada "TABLE".'
        );

        // IF NOT EXISTS (opcional)
        let seNaoExistir = false;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SE)) {
            this.consumir(
                tiposDeSimbolos.NAO,
                'Esperado palavra "NOT" após palavra "IF".'
            );

            this.consumir(
                tiposDeSimbolos.EXISTIR,
                'Esperado palavra "EXISTS" após palavra "NOT".'
            );

            seNaoExistir = true;
        }

        const nomeDaTabela = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de tabela após palavra reservada "TABLE".'
        );

        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            'Esperado abertura de parênteses após nome da tabela'
        );

        const colunas: Coluna[] = [];

        do {
            colunas.push(this.comandoCriacaoColuna());
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            'Esperado fechamento de parênteses após definição das colunas'
        );

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_VIRGULA);

        return new Criar(
            simboloTabela.linha,
            nomeDaTabela.lexema,
            colunas,
            seNaoExistir
        );
    }

    protected override comandoInserir(): Inserir {
        // INSERT
        const simboloInserir = this.consumir(
            tiposDeSimbolos.INSERIR,
            'Esperado palavra reservada "INSERT".'
        );

        // INTO
        this.consumir(
            tiposDeSimbolos.EM,
            'Esperado palavra reservada "INTO" após palavra reservada "INSERT".'
        );

        const nomeDaTabela = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de tabela após palavra reservada "INTO" em declaração "INSERT".'
        );

        // Colunas
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            'Esperado abertura de parênteses após identificador de nome de tabela em comando "INSERT".'
        );
        const colunas = [];
        do {
            const nomeDaColuna = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado identificador de nome de coluna após identificador de nome de tabela em comando "INSERT".'
            );
            colunas.push(nomeDaColuna.lexema);
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            'Esperado fechamento de parênteses após declaração de colunas em comando "INSERT".'
        );
        this.consumir(
            tiposDeSimbolos.VALORES,
            'Esperado palavra reservada "VALUES" após primeiro fechamento de parênteses em comando "INSERT".'
        );
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            'Esperado abertura de parênteses após palavra reservada "VALUES" em comando "INSERT".'
        );

        // Valores
        const valores: Construto[] = [];
        do {
            if (
                ![
                    tiposDeSimbolos.IDENTIFICADOR,
                    tiposDeSimbolos.FALSO,
                    tiposDeSimbolos.NUMERO,
                    tiposDeSimbolos.TEXTO,
                    tiposDeSimbolos.VERDADEIRO,
                    tiposDeSimbolos.INTERROGACAO,
                    tiposDeSimbolos.DOIS_PONTOS
                ].includes(this.simbolos[this.atual].tipo)
            ) {
                throw this.erro(
                    this.simbolos[this.atual],
                    `Esperado valor válido para inserção em comando "INSERT".`
                );
            }

            const operando = this.logicaComumOperando();
            valores.push(operando);
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            'Esperado fechamento de parênteses após declaração de valores em comando "INSERT".'
        );

        if (valores.length !== colunas.length) {
            throw this.erro(
                simboloInserir,
                'Número de colunas não correspondente ao número de valores em comando "INSERT".'
            );
        }

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_VIRGULA);

        return new Inserir(simboloInserir.linha, nomeDaTabela.lexema, colunas, valores);
    }

    protected override comandoAtualizar(): Atualizar {
        // UPDATE
        const simboloAtualizar = this.consumir(
            tiposDeSimbolos.ATUALIZAR,
            'Esperado palavra reservada "UPDATE".'
        );

        const nomeDaTabela = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de tabela após palavra reservada "UPDATE".'
        );

        // SET
        this.consumir(
            tiposDeSimbolos.DEFINIR,
            'Esperado palavra reservada "SET" após palavra reservada "UPDATE".'
        );

        // Relação de colunas para atualização
        const colunasAtualizacao: ColunaEValor[] = [];
        do {
            const esquerda = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                `Esperado nome de coluna ou literal em descrição de atualização.`
            );
            this.consumir(
                tiposDeSimbolos.IGUAL,
                'Esperado operador válido após identificador em descrição de atualização.'
            );

            if (
                ![
                    tiposDeSimbolos.DOIS_PONTOS,
                    tiposDeSimbolos.IDENTIFICADOR,
                    tiposDeSimbolos.INTERROGACAO,
                    tiposDeSimbolos.NUMERO,
                    tiposDeSimbolos.TEXTO,
                    tiposDeSimbolos.VERDADEIRO,
                    tiposDeSimbolos.FALSO
                ].includes(this.simbolos[this.atual].tipo)
            ) {
                throw this.erro(
                    this.simbolos[this.atual],
                    `Esperado operador válido após identificador em descrição de atualização.`
                );
            }

            const direita = this.logicaComumOperando();

            colunasAtualizacao.push(
                new ColunaEValor(
                    new ReferenciaColuna(esquerda.lexema),
                    direita
                )
            );
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        // WHERE
        const condicoes = this.logicaComumCondicoes('atualização');

        // Ponto-e-vírgula opcional
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_VIRGULA);

        return new Atualizar(
            simboloAtualizar.linha,
            nomeDaTabela.lexema,
            colunasAtualizacao,
            condicoes
        );
    }

    protected override comandoRemoverEntidade(): RemoverEntidade {
        // Essa linha nunca deve retornar erro.
        this.consumir(
            tiposDeSimbolos.REMOVER,
            'Esperado palavra reservada "REMOVER".'
        );

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.TABELA, tiposDeSimbolos.VISAO)) {
            throw this.erro(this.simbolos[this.atual], `Esperado palavras reservadas "TABELA" ou "VISÃO" após palavra reservada "REMOVER".`);
        }

        const simboloTipoEntidade = this.simbolos[this.atual - 1];

        const nomeDaEntidade = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de tabela após palavras reservadas "TABELA" ou "VISÃO".'
        );

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_VIRGULA);

        return new RemoverEntidade(
            nomeDaEntidade.linha,
            nomeDaEntidade.lexema,
            simboloTipoEntidade.tipo.toUpperCase()
        );
    }

    protected override comandoSelecionar(): Selecionar {
        // SELECT
        const simboloSelecionar = this.consumir(
            tiposDeSimbolos.SELECIONAR,
            'Esperado palavra reservada "SELECT".'
        );

        // Colunas
        let tudo = false;
        const colunas = [];
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.TUDO)) {
            tudo = true;
        } else {
            do {
                colunas.push(this.simbolos[this.atual].lexema);
                this.avancar();
            } while (
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA)
            );
        }

        // FROM
        this.consumir(
            tiposDeSimbolos.DE,
            'Esperado palavra reservada "FROM" após definição das colunas em comando de seleção.'
        );
        const nomeTabela = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome de tabela após palavra reservada "FROM".'
        );

        // WHERE
        const condicoes = this.logicaComumCondicoes('seleção');

        // Ponto-e-vírgula opcional.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_VIRGULA);

        return new Selecionar(simboloSelecionar.linha, nomeTabela.lexema, colunas, condicoes, tudo);
    }

    protected logicaManipulacaoColunaOuRestricao(simboloOperacao: SimboloInterface, simboloDaTabelaOuVisao: SimboloInterface) {
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.COLUNA:
                this.avancar();
                return this.logicaManipulacaoColuna(simboloOperacao);
            case tiposDeSimbolos.RESTRICAO:
                this.avancar();
                return this.logicaManipulacaoRestricao(simboloDaTabelaOuVisao, simboloOperacao);
            default:
                throw this.erro(this.simbolos[this.atual], `Tipo de elemento de tabela ou visão inválido para operação "${simboloOperacao.lexema}": ${this.simbolos[this.atual].lexema}.`);
        }
    }

    protected override comandoAlterar(): Alterar {
        // ALTER
        const simboloAlterar = this.consumir(
            tiposDeSimbolos.ALTERAR,
            'Esperado palavra reservada "ALTER".'
        );

        // TABLE ou VIEW
        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.TABELA, tiposDeSimbolos.VISAO)) {
            throw this.erro(this.simbolos[this.atual], 'Esperado palavra reservada "TABLE" ou "VIEW".');
        }

        const simboloTipoEntidade = this.simbolos[this.atual - 1];

        const nomeDaEntidade = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            `Esperado identificador de nome de tabela ou visão após palavra reservada '${simboloTipoEntidade.lexema}'.`
        );

        const operacoes = [];
        
        // Processar operações em SQL: ADD, DROP, ALTER COLUMN, RENAME COLUMN
        while (this.verificarSeSimboloAtualEIgualA(
            tiposDeSimbolos.ADICIONAR,
            tiposDeSimbolos.ALTERAR,
            tiposDeSimbolos.REMOVER,
            tiposDeSimbolos.RENOMEAR
        )) {
            const simboloOperacao = this.simbolos[this.atual - 1];

            const elemento = this.logicaManipulacaoColunaOuRestricao(simboloOperacao, nomeDaEntidade);

            if (elemento) {
                operacoes.push(
                    new OperacaoAlteracaoTabela(
                        simboloOperacao.tipo,
                        elemento
                    )
                );
            }

            this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA);
        }

        if (operacoes.length <= 0) {
            throw this.erro(this.simbolos[this.atual - 1], `Esperado pelo menos uma operação em um comando de alteração de tabela.`)
        }

        return new Alterar(
            simboloAlterar.linha,
            nomeDaEntidade.lexema,
            simboloTipoEntidade.lexema,
            operacoes
        );
    }

    protected override declaracao() {
        try {
            switch (this.simbolos[this.atual].tipo) {
                case tiposDeSimbolos.ALTERAR:
                    return this.comandoAlterar();
                case tiposDeSimbolos.ATUALIZAR:
                    return this.comandoAtualizar();
                case tiposDeSimbolos.CRIAR:
                    return this.comandoCriar();
                case tiposDeSimbolos.EXCLUIR:
                    return this.comandoExcluir();
                case tiposDeSimbolos.INSERIR:
                    return this.comandoInserir();
                case tiposDeSimbolos.REMOVER:
                    return this.comandoRemoverEntidade();
                case tiposDeSimbolos.SELECIONAR:
                    return this.comandoSelecionar();
                default:
                    this.avancar();
                    return null;
            }
        } catch (erro) {
            this.erros.push(erro);
            return null;
        }
    }
}