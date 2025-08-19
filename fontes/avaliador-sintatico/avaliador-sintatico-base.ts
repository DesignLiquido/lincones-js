import {
    Alterar,
    Atualizar,
    Comando,
    Criar,
    Excluir,
    ExcluirEntidade,
    Inserir,
    Selecionar
} from '../comandos';
import { AvaliadorSintaticoInterface, SimboloInterface } from '../interfaces';
import {
    RetornoAvaliadorSintatico,
    RetornoLexador
} from '../interfaces/retornos';
import { ErroAvaliadorSintatico } from './erro-avaliador-sintatico';
import { Coluna, ColunaEValor, Condicao, Construto, Literal, OperacaoAlteracaoTabela, ParametroAnonimo, ParametroNomeado, ReferenciaColuna, Restricao } from '../construtos';

import tiposDeSimbolos from '../tipos-de-simbolos';

export abstract class AvaliadorSintaticoBase
    implements AvaliadorSintaticoInterface {
    simbolos: SimboloInterface[];
    erros: ErroAvaliadorSintatico[];
    atual: number;
    bloco: number;

    consumir(tipo: string, mensagemDeErro: string): SimboloInterface {
        if (this.verificarTipoSimboloAtual(tipo))
            return this.avancarEDevolverAnterior();
        throw this.erro(this.simbolos[this.atual], mensagemDeErro);
    }

    estaNoFinal(): boolean {
        return this.atual === this.simbolos.length;
    }

    verificarTipoSimboloAtual(tipo: string): boolean {
        if (this.estaNoFinal()) return false;
        return this.simbolos[this.atual].tipo === tipo;
    }

    verificaSeLexemaSimboloAtual(lexama: string): boolean {
        if (this.estaNoFinal()) return false;
        return this.simbolos[this.atual].lexema === lexama;
    }

    avancarEDevolverAnterior(): SimboloInterface {
        if (!this.estaNoFinal()) this.atual++;
        return this.simbolos[this.atual - 1];
    }

    erro(
        simbolo: SimboloInterface,
        mensagemDeErro: string
    ): ErroAvaliadorSintatico {
        const excecao = new ErroAvaliadorSintatico(simbolo, mensagemDeErro);
        this.erros.push(excecao);
        return excecao;
    }

    verificarSeSimboloAtualEIgualA(...argumentos: string[]): boolean {
        for (let i = 0; i < argumentos.length; i++) {
            const tipoAtual = argumentos[i];
            if (this.verificarTipoSimboloAtual(tipoAtual)) {
                this.avancarEDevolverAnterior();
                return true;
            }
        }

        return false;
    }

    protected avancar(): void {
        if (!this.estaNoFinal()) {
            this.atual++;
        }
    }

    private logicaManipulacaoColuna(simboloOperacao: SimboloInterface): Coluna {
        const simboloNomeDaColuna = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de tabela após palavra reservada "TABELA".'
        );

        switch (simboloOperacao.tipo) {
            case tiposDeSimbolos.ADICIONAR:
            case tiposDeSimbolos.ALTERAR:
                return this.logicaAdicionarOuAlterarColuna(
                    simboloNomeDaColuna
                );

            case tiposDeSimbolos.EXCLUIR:
                break;
            case tiposDeSimbolos.RENOMEAR:
                break;
        }

        return undefined;
    }

    private logicaManipulacaoRestricao(simboloNomeTabela: SimboloInterface, simboloOperacao: SimboloInterface): Restricao {
        const simboloNomeDaRestricao = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de restrição após palavra reservada "RESTRIÇÃO".'
        );

        switch (simboloOperacao.tipo) {
            case tiposDeSimbolos.ADICIONAR:
            case tiposDeSimbolos.ALTERAR:
                return this.logicaAdicionarOuAlterarRestricao(
                    simboloNomeTabela,
                    simboloNomeDaRestricao
                );

            case tiposDeSimbolos.EXCLUIR:
                break;
            case tiposDeSimbolos.RENOMEAR:
                break;
        }

        return undefined;
    }

    private logicaAdicionarOuAlterarColuna(
        simboloNomeDaColuna: SimboloInterface
    ): Coluna {
        // Tipo de dados
        const simboloTipoElemento = this.avancarEDevolverAnterior();
        let tamanhoElemento = null;

        if (![
            tiposDeSimbolos.INTEIRO,
            tiposDeSimbolos.LOGICO,
            tiposDeSimbolos.TEXTO
        ].includes(simboloTipoElemento.tipo)) {
            throw this.erro(simboloTipoElemento, `Tipo de coluna inválido para operação de adição ou alteração de coluna. Tipos válidos: inteiro, lógico ou texto. Obtido: ${simboloTipoElemento.tipo}.`);
        }

        if (simboloTipoElemento.tipo === tiposDeSimbolos.TEXTO) {
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
        let chavePrimaria = false;
        let autoIncremento = false;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE)) {
            switch (this.simbolos[this.atual].tipo) {
                case tiposDeSimbolos.PRIMARIA:
                    chavePrimaria = true;
                    this.avancar();
                    if (
                        this.verificarSeSimboloAtualEIgualA(
                            tiposDeSimbolos.AUTO
                        )
                    ) {
                        this.consumir(
                            tiposDeSimbolos.INCREMENTO,
                            'Esperado palavra reservada "INCREMENTO" após palavra reservada "AUTO" em declaração de coluna em comando de criação de tabela.'
                        );
                        autoIncremento = true;
                    }
                    break;
                default:
                    throw this.erro(
                        this.simbolos[this.atual],
                        'Esperado palavra reservada "PRIMARIA" após palavra reservada "CHAVE" na definição de coluna em comando de criação de tabela.'
                    );
            }
        }

        return new Coluna(
            simboloNomeDaColuna.lexema,
            simboloTipoElemento.lexema,
            tamanhoElemento ? tamanhoElemento : undefined,
            nulo,
            chavePrimaria,
            false,
            false
        )
    }

    private logicaAdicionarOuAlterarRestricao(
        simboloNomeDaTabela: SimboloInterface,
        simboloNomeDaRestricao: SimboloInterface
    ): Restricao {
        // Tipo de restrição
        const simboloTipoRestricao = this.avancarEDevolverAnterior();
        switch (simboloTipoRestricao.tipo) {
            case tiposDeSimbolos.CHAVE:
                return this.logicaRestricaoChave(simboloNomeDaTabela, simboloNomeDaRestricao);
            case tiposDeSimbolos.UNICA:
                break;
        }

        return undefined;
    }

    private logicaRestricaoChave(simboloNomeDaTabela: SimboloInterface, simboloNomeDaRestricao: SimboloInterface) {
        const simboloTipoChave = this.avancarEDevolverAnterior();
        switch (simboloTipoChave.tipo) {
            case tiposDeSimbolos.PRIMARIA:
                break;
            case tiposDeSimbolos.ESTRANGEIRA:
                this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, 'Esperado abertura de parêntese após palavra reservada "ESTRANGEIRA".');
                const nomeColunaChave = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome de coluna para restrição do tipo chave estrangeira.');
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, 'Esperado fechamento de parêntese após nome de coluna para restrição do tipo chave estrangeira.');
                this.consumir(tiposDeSimbolos.REFERENCIA, 'Esperado palavra reservada "REFERENCIA" após definição de coluna para restrição do tipo chave estrangeira.');
                const nomeTabelaReferenciada = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome da tabela referenciada por restrição do tipo chave estrangeira.');
                this.consumir(tiposDeSimbolos.PARENTESE_ESQUERDO, 'Esperado abertura de parêntese após palavra reservada "REFERENCIA".');
                const nomeColunaReferenciada = this.consumir(tiposDeSimbolos.IDENTIFICADOR, 'Esperado nome de coluna referenciada para restrição do tipo chave estrangeira.');
                this.consumir(tiposDeSimbolos.PARENTESE_DIREITO, 'Esperado fechamento de parêntese após nome de coluna referenciada para restrição do tipo chave estrangeira.');
                this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_VIRGULA);
                return new Restricao(
                    simboloNomeDaRestricao.lexema,
                    "CHAVE_ESTRANGEIRA",
                    simboloNomeDaTabela.lexema,
                    [nomeColunaChave.lexema],
                    nomeTabelaReferenciada.lexema,
                    [nomeColunaReferenciada.lexema]
                );
        }
    }

    protected inferirTipoLiteral(simboloLiteral: SimboloInterface): 'INTEIRO' | 'LOGICO' | 'NUMERO' | 'TEXTO' {
        const lexemaOuLiteral = simboloLiteral.lexema || simboloLiteral.literal;
        switch (lexemaOuLiteral.constructor.name) {
            case 'String':
                if (['VERDADEIRO', 'FALSO'].includes(lexemaOuLiteral.toUpperCase())) {
                    return 'LOGICO';
                }
                return 'TEXTO';
            case 'Number':
                return 'NUMERO';
            default:
                throw new ErroAvaliadorSintatico(simboloLiteral, `Tipo ${simboloLiteral.lexema} não pode ser inferido.`);
        }
    }

    //https://pgdocptbr.sourceforge.io/pg80/ddl-alter.html
    //ALTER TABLE produtos ADD COLUMN descricao text => alterar tabela produtos adicionar coluna descricao texto(50)
    //ALTER TABLE produtos DROP COLUMN descricao;
    //ALTER TABLE produtos RENAME COLUMN cod_prod TO cod_produto;
    //ALTER TABLE produtos RENAME TO equipamentos;
    protected comandoAlterar(): Alterar {
        const simboloAlterar = this.consumir(
            tiposDeSimbolos.ALTERAR,
            'Esperado palavra reservada "ALTERAR".'
        );

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.TABELA, tiposDeSimbolos.VISAO)) {
            throw this.erro(this.simbolos[this.atual], 'Esperado palavra reservada "TABELA" ou "VISÃO".');
        }

        const simboloTipoEntidade = this.simbolos[this.atual - 1];

        const nomeDaTabela = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de tabela após palavra reservada "IDENTIFICADOR".'
        );

        const operacoes = [];
        while (this.verificarSeSimboloAtualEIgualA(
            tiposDeSimbolos.ADICIONAR,
            tiposDeSimbolos.ALTERAR,
            tiposDeSimbolos.EXCLUIR,
            tiposDeSimbolos.RENOMEAR
        )) {
            const simboloOperacao = this.simbolos[this.atual - 1];
            let elemento: Coluna | Restricao;

            switch (this.simbolos[this.atual].tipo) {
                case tiposDeSimbolos.COLUNA:
                    this.avancar();
                    elemento = this.logicaManipulacaoColuna(simboloOperacao);
                    break;
                case tiposDeSimbolos.RESTRICAO:
                    this.avancar();
                    elemento = this.logicaManipulacaoRestricao(nomeDaTabela, simboloOperacao);
                    break;
                default:
                    throw this.erro(this.simbolos[this.atual], `Tipo de elemento de tabela ou visão inválido para operação "${simboloOperacao.lexema}": ${this.simbolos[this.atual].lexema}.`);
            }

            operacoes.push(
                new OperacaoAlteracaoTabela(
                    simboloOperacao.lexema,
                    elemento
                )
            );
        }

        if (operacoes.length <= 0) {
            throw this.erro(this.simbolos[this.atual - 1], `Esperado pelo menos uma operação em um comando de alteração de tabela.`)
        }

        return new Alterar(
            simboloAlterar.linha,
            nomeDaTabela.lexema,
            simboloTipoEntidade.lexema,
            operacoes
        );
    }

    protected comandoAtualizar(): Atualizar {
        // Essa linha nunca deve retornar erro.
        const simboloAtualizar = this.consumir(
            tiposDeSimbolos.ATUALIZAR,
            'Esperado palavra reservada "ATUALIZAR".'
        );

        const nomeDaTabela = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de tabela após palavra reservada "ATUALIZAR".'
        );

        this.consumir(
            tiposDeSimbolos.DEFINIR,
            'Esperado palavra reservada "DEFINIR". após palavra reservada "ATUALIZAR".'
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

        // Condições
        const condicoes = this.logicaComumCondicoes('seleção');

        // Ponto-e-vírgula opcional
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_VIRGULA);

        return new Atualizar(
            simboloAtualizar.linha,
            nomeDaTabela.lexema,
            colunasAtualizacao,
            condicoes
        );
    }

    protected comandoCriacaoColuna(): Coluna {
        // Nome
        const nomeDaColuna = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de coluna em comando de criação de tabela.'
        );

        // Tipo de dados
        let tipoColuna = null;
        let tamanhoColuna = null;
        switch (this.simbolos[this.atual].tipo) {
            case tiposDeSimbolos.INTEIRO:
                tipoColuna = tiposDeSimbolos.INTEIRO;
                this.avancar();
                break;
            case tiposDeSimbolos.LOGICO:
                tipoColuna = tiposDeSimbolos.LOGICO;
                this.avancar();
                break;
            case tiposDeSimbolos.TEXTO:
                tipoColuna = tiposDeSimbolos.TEXTO;
                this.avancar();
                if (
                    this.verificarSeSimboloAtualEIgualA(
                        tiposDeSimbolos.PARENTESE_ESQUERDO
                    )
                ) {
                    tamanhoColuna = this.consumir(
                        tiposDeSimbolos.NUMERO,
                        'Esperado tamanho de texto de coluna em comando de criação de tabela.'
                    );
                    this.consumir(
                        tiposDeSimbolos.PARENTESE_DIREITO,
                        'Esperado parêntese direito após declaração de tamanho de coluna em comando de criação de tabela.'
                    );
                }

                break;
            default:
                throw this.erro(
                    this.simbolos[this.atual],
                    'Esperado tipo de dados válido na definição de coluna em comando de criação de tabela.'
                );
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
        let chavePrimaria = false;
        let autoIncremento = false;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE)) {
            switch (this.simbolos[this.atual].tipo) {
                case tiposDeSimbolos.PRIMARIA:
                    chavePrimaria = true;
                    this.avancar();
                    if (
                        this.verificarSeSimboloAtualEIgualA(
                            tiposDeSimbolos.AUTO
                        )
                    ) {
                        this.consumir(
                            tiposDeSimbolos.INCREMENTO,
                            'Esperado palavra reservada "INCREMENTO" após palavra reservada "AUTO" em declaração de coluna em comando de criação de tabela.'
                        );
                        autoIncremento = true;
                    }
                    break;
                default:
                    throw this.erro(
                        this.simbolos[this.atual],
                        'Esperado palavra reservada "PRIMARIA" após palavra reservada "CHAVE" na definição de coluna em comando de criação de tabela.'
                    );
            }
        }

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

    protected comandoCriar(): Criar {
        // Essa linha nunca deve retornar erro.
        this.consumir(
            tiposDeSimbolos.CRIAR,
            'Esperado palavra reservada "CRIAR".'
        );

        switch (this.simbolos[this.atual].tipo) {
            case 'TABELA':
            default:
                return this.comandoCriarTabela();
        }
    }

    protected comandoCriarTabela() {
        // Essa linha nunca deve retornar erro.
        const simboloTabela = this.consumir(
            tiposDeSimbolos.TABELA,
            'Esperado palavra reservada "TABELA".'
        );

        let seNaoExistir = false;
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SE)) {
            this.consumir(
                tiposDeSimbolos.NAO,
                'Esperado palavra reservada "NÃO" após palavra reservada "SE".'
            );

            this.consumir(
                tiposDeSimbolos.EXISTIR,
                'Esperado palavra reservada "EXISTIR" após palavra reservada "NÃO".'
            );

            seNaoExistir = true;
        }

        const nomeDaTabela = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de tabela após palavra reservada "TABELA".'
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
            'Esperado fechamento de parênteses após nome da tabela'
        );

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_VIRGULA);

        return new Criar(
            simboloTabela.linha,
            nomeDaTabela.lexema,
            colunas,
            seNaoExistir
        );
    }

    protected comandoExcluirTabela(): ExcluirEntidade {
        const nomeDaTabela = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de tabela após palavra reservada "TABELA".'
        );

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_VIRGULA);

        return new ExcluirEntidade(
            nomeDaTabela.linha,
            nomeDaTabela.lexema,
            'TABELA'
        );
    }

    protected comandoExcluirVisao(): ExcluirEntidade {
        const nomeDaVisao = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de visão após palavra reservada "VISÃO".'
        );

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_VIRGULA);

        return new ExcluirEntidade(
            nomeDaVisao.linha,
            nomeDaVisao.lexema,
            'VISÃO'
        );
    }

    protected comandoExcluir(): Excluir | ExcluirEntidade {
        // Essa linha nunca deve retornar erro.
        const simboloExcluir = this.consumir(
            tiposDeSimbolos.EXCLUIR,
            'Esperado palavra reservada "EXCLUIR".'
        );

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.TABELA)) {
            return this.comandoExcluirTabela();
        }

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VISAO)) {
            return this.comandoExcluirVisao();
        }

        if (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DE, tiposDeSimbolos.EM)) {
            throw this.erro(this.simbolos[this.atual], 'Esperado palavra reservada "DE" ou "EM" após palavra reservada "EXCLUIR".');
        }

        const nomeDaTabela = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de tabela após palavra reservada "TABELA".'
        );

        const condicoes = this.logicaComumCondicoes('exclusão');

        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_VIRGULA);

        return new Excluir(
            simboloExcluir.linha,
            nomeDaTabela.lexema,
            condicoes
        );
    }

    protected comandoInserir(): Inserir {
        // Essa linha nunca deve retornar erro.
        const simboloInserir = this.consumir(
            tiposDeSimbolos.INSERIR,
            'Esperado palavra reservada "INSERIR".'
        );

        this.consumir(
            tiposDeSimbolos.EM,
            'Esperado palavra reservada "EM" após palavra reservada "INSERIR".'
        );

        const nomeDaTabela = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado identificador de nome de tabela após palavra reservada "EM" em declaração "INSERIR".'
        );

        // Colunas
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            'Esperado abertura de parênteses após identificador de nome de tabela em comando "INSERIR".'
        );
        const colunas = [];
        do {
            const nomeDaColuna = this.consumir(
                tiposDeSimbolos.IDENTIFICADOR,
                'Esperado identificador de nome de coluna após identificador de nome de tabela em comando "INSERIR".'
            );
            colunas.push(nomeDaColuna.lexema);
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            'Esperado fechamento de parênteses após declaração de colunas em comando "INSERIR".'
        );
        this.consumir(
            tiposDeSimbolos.VALORES,
            'Esperado palavra reservada "VALORES" após primeiro fechamento de parênteses em comando "INSERIR".'
        );
        this.consumir(
            tiposDeSimbolos.PARENTESE_ESQUERDO,
            'Esperado abertura de parênteses após palavra reservada "VALORES" em comando "INSERIR".'
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
                    `Esperado valor válido para inserção em comando "INSERIR".`
                );
            }

            const operando = this.logicaComumOperando();
            valores.push(operando);
        } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VIRGULA));

        this.consumir(
            tiposDeSimbolos.PARENTESE_DIREITO,
            'Esperado fechamento de parênteses após declaração de valores em comando "INSERIR".'
        );

        if (valores.length !== colunas.length) {
            throw this.erro(
                simboloInserir,
                'Número de colunas não correspondente ao número de valores em comando "INSERIR".'
            );
        }

        return new Inserir(simboloInserir.linha, nomeDaTabela.lexema, colunas, valores);
    }

    protected logicaComumOperando(): Construto {
        const simboloOperando = this.avancarEDevolverAnterior();
        switch (simboloOperando.tipo) {
            case tiposDeSimbolos.IDENTIFICADOR:
                return new ReferenciaColuna(simboloOperando.lexema);
            case tiposDeSimbolos.NUMERO:
            case tiposDeSimbolos.TEXTO:
            case tiposDeSimbolos.VERDADEIRO:
            case tiposDeSimbolos.FALSO:
                const tipoInferido = this.inferirTipoLiteral(simboloOperando);
                return new Literal(simboloOperando.literal || simboloOperando.lexema, tipoInferido);
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

    protected logicaComumCondicoes(operacao: string): Condicao[] {
        const condicoes: Condicao[] = [];
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ONDE)) {
            do {
                const esquerda = this.consumir(
                    tiposDeSimbolos.IDENTIFICADOR,
                    `Esperado nome de coluna ou literal em condição de ${operacao}.`
                );
                if (
                    ![
                        tiposDeSimbolos.IGUAL,
                        tiposDeSimbolos.MAIOR,
                        tiposDeSimbolos.MAIOR_IGUAL,
                        tiposDeSimbolos.MENOR,
                        tiposDeSimbolos.MENOR_IGUAL
                    ].includes(this.simbolos[this.atual].tipo)
                ) {
                    throw this.erro(
                        this.simbolos[this.atual],
                        `Esperado operador válido após identificador em condição de ${operacao}.`
                    );
                }

                const operador = this.simbolos[this.atual].tipo  as "IGUAL" | "MAIOR" | "MAIOR_IGUAL" | "MENOR" | "MENOR_IGUAL";
                this.avancar();

                if (
                    ![
                        tiposDeSimbolos.DOIS_PONTOS,
                        tiposDeSimbolos.INTERROGACAO,
                        tiposDeSimbolos.IDENTIFICADOR,
                        tiposDeSimbolos.NUMERO,
                        tiposDeSimbolos.TEXTO
                    ].includes(this.simbolos[this.atual].tipo)
                ) {
                    throw this.erro(
                        this.simbolos[this.atual],
                        `Esperado operando válido após identificador em condição de ${operacao}.`
                    );
                }

                const direita = this.logicaComumOperando();

                condicoes.push(
                    new Condicao(
                        new ReferenciaColuna(esquerda.lexema),
                        operador,
                        direita
                    )
                );
            } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E));
        }

        return condicoes;
    }

    protected comandoSelecionar() {
        // Essa linha idealmente nunca deve retornar erro.
        const simboloSelecionar = this.consumir(
            tiposDeSimbolos.SELECIONAR,
            'Esperado palavra reservada "SELECIONAR".'
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

        // De
        this.consumir(
            tiposDeSimbolos.DE,
            'Esperado palavra reservada "de" após definição das colunas em comando de seleção.'
        );
        const nomeTabela = this.consumir(
            tiposDeSimbolos.IDENTIFICADOR,
            'Esperado nome de coluna ou literal em condição de seleção.'
        );

        // Condições
        const condicoes = this.logicaComumCondicoes('seleção');

        // Ponto-e-vírgula opcional.
        this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_VIRGULA);

        return new Selecionar(simboloSelecionar.linha, nomeTabela.lexema, colunas, condicoes, tudo);
    }

    protected declaracao() {
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
            case tiposDeSimbolos.SELECIONAR:
                return this.comandoSelecionar();
            default:
                this.avancar();
                return null;
        }
    }

    analisar(retornoLexador: RetornoLexador): RetornoAvaliadorSintatico {
        this.erros = [];
        this.atual = 0;
        this.bloco = 0;
        this.simbolos = retornoLexador?.simbolos || [];

        const declaracoes: Comando[] = [];
        while (!this.estaNoFinal()) {
            declaracoes.push(this.declaracao());
        }

        return {
            comandos: declaracoes,
            erros: this.erros
        } as RetornoAvaliadorSintatico;
    }
}
