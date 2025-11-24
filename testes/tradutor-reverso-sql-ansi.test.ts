import { AvaliadorSintaticoSqlAnsi } from "../fontes/avaliador-sintatico";
import { LexadorSqlAnsi } from "../fontes/lexador";
import { TradutorReversoSqlAnsi } from "../fontes/tradutor/tradutor-reverso-sql-ansi";

describe('Tradutor Reverso (SQL ANSI)', () => {
    let lexador: LexadorSqlAnsi;
    let avaliadorSintatico: AvaliadorSintaticoSqlAnsi;
    let tradutor: TradutorReversoSqlAnsi;

    describe('traduzir()', () => {
        describe('Cenário de sucesso', () => {
            beforeEach(() => {
                lexador = new LexadorSqlAnsi();
                avaliadorSintatico = new AvaliadorSintaticoSqlAnsi();
                tradutor = new TradutorReversoSqlAnsi();
            });

            it('Criar', () => {
                const resultadoLexador = lexador.mapear([
                    "CREATE TABLE clientes (id INT PRIMARY KEY, email VARCHAR(255) NOT NULL)"
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('CRIAR TABELA clientes');
                expect(resultado).toContain('id');
                expect(resultado).toContain('INTEIRO');
                expect(resultado).toContain('CHAVE PRIMÁRIA');
                expect(resultado).toContain('email');
                expect(resultado).toContain('CARACTERES');
                expect(resultado).toContain('NÃO NULO');
            });

            describe('Alterar tabela', () => {
                it('Adição de coluna', () => {
                    const resultadoLexador = lexador.mapear([
                        "ALTER TABLE clientes ADD COLUMN telefone VARCHAR(20)"
                    ]);
                    const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                    const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                    expect(resultado).toBeTruthy();
                    expect(resultado).toContain('ALTERAR TABELA clientes');
                    expect(resultado).toContain('ADICIONAR COLUNA');
                    expect(resultado).toContain('telefone');
                    expect(resultado).toContain('CARACTERES');
                });

                it('Adição de coluna com NOT NULL', () => {
                    const resultadoLexador = lexador.mapear([
                        "ALTER TABLE produtos ADD COLUMN categoria TEXT NOT NULL"
                    ]);

                    const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                    const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                    expect(resultado).toBeTruthy();
                    expect(resultado).toContain('ALTERAR TABELA produtos');
                    expect(resultado).toContain('ADICIONAR COLUNA');
                    expect(resultado).toContain('categoria');
                    expect(resultado).toContain('NÃO NULO');
                });

                it('Remoção de coluna', () => {
                    const resultadoLexador = lexador.mapear([
                        "ALTER TABLE clientes DROP COLUMN telefone"
                    ]);
                    const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                    const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                    expect(resultado).toBeTruthy();
                    expect(resultado).toContain('ALTERAR TABELA clientes');
                    expect(resultado).toContain('REMOVER COLUNA');
                    expect(resultado).toContain('telefone');
                });

                it('Alterar coluna', () => {
                    const resultadoLexador = lexador.mapear([
                        "ALTER TABLE produtos ALTER COLUMN preco NUMERIC"
                    ]);

                    const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                    const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                    expect(resultado).toBeTruthy();
                    expect(resultado).toContain('ALTERAR TABELA produtos');
                    expect(resultado).toContain('ALTERAR COLUNA');
                    expect(resultado).toContain('preco');
                });
            });

            it('Atualizar', () => {
                const resultadoLexador = lexador.mapear([
                    'UPDATE clientes SET nome = "João Pedro", idade = 31, ativo = TRUE, casado = FALSE WHERE id = 1'
                ]);

                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('ATUALIZAR clientes');
                expect(resultado).toContain('DEFINIR');
                expect(resultado).toContain('nome');
                expect(resultado).toContain('João Pedro');
                expect(resultado).toContain('idade');
                expect(resultado).toContain('31');
                expect(resultado).toContain('ativo');
                expect(resultado).toContain('VERDADEIRO');
                expect(resultado).toContain('casado');
                expect(resultado).toContain('FALSO');
                expect(resultado).toContain('ONDE');
                expect(resultado).toContain('id');
            });

            it('Atualizar com múltiplas condições', () => {
                const resultadoLexador = lexador.mapear([
                    'UPDATE produtos SET preco = 100 WHERE categoria = "eletronicos" AND estoque > 0'
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('ATUALIZAR produtos');
                expect(resultado).toContain('DEFINIR');
                expect(resultado).toContain('ONDE');
                expect(resultado).toContain('categoria');
                expect(resultado).toContain('estoque');
            });

            it('Atualizar sem condições', () => {
                const resultadoLexador = lexador.mapear([
                    'UPDATE clientes SET ativo = FALSE'
                ]);

                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('ATUALIZAR clientes');
                expect(resultado).toContain('DEFINIR');
                expect(resultado).not.toContain('ONDE');
            });

            it('Inserir', () => {
                const resultadoLexador = lexador.mapear([
                    'INSERT INTO clientes (nome, idade, ativo, email) VALUES ("Pernalonga", 18, TRUE, "pernalonga@warnerbros.com")'
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('INSERIR EM clientes');
                expect(resultado).toContain('VALORES');
                expect(resultado).toContain('Pernalonga');
                expect(resultado).toContain('18');
                expect(resultado).toContain('VERDADEIRO');
                expect(resultado).toContain('pernalonga@warnerbros.com');
            });

            it('Inserir com valores booleanos', () => {
                const resultadoLexador = lexador.mapear([
                    'INSERT INTO usuarios (nome, ativo, admin) VALUES ("Maria", TRUE, FALSE)'
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('INSERIR EM usuarios');
                expect(resultado).toContain('Maria');
                expect(resultado).toContain('VERDADEIRO');
                expect(resultado).toContain('FALSO');
            });

            it('Excluir', () => {
                const resultadoLexador = lexador.mapear([
                    'DELETE FROM clientes WHERE id = 2'
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('EXCLUIR DE clientes');
                expect(resultado).toContain('ONDE');
                expect(resultado).toContain('id');
                expect(resultado).toContain('2');
            });

            it('Excluir sem condições', () => {
                const resultadoLexador = lexador.mapear([
                    'DELETE FROM temporarios'
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('EXCLUIR DE temporarios');
                expect(resultado).not.toContain('ONDE');
            });

            it('Excluir com múltiplas condições', () => {
                const resultadoLexador = lexador.mapear([
                    'DELETE FROM produtos WHERE categoria = "obsoleto" AND estoque = 0'
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('EXCLUIR DE produtos');
                expect(resultado).toContain('ONDE');
                expect(resultado).toContain('categoria');
                expect(resultado).toContain('estoque');
            });

            it('Selecionar todas as colunas', () => {
                const resultadoLexador = lexador.mapear([
                    'SELECT * FROM clientes'
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('SELECIONAR *');
                expect(resultado).toContain('DE clientes');
            });

            it('Selecionar colunas específicas', () => {
                const resultadoLexador = lexador.mapear([
                    'SELECT nome, email, idade FROM clientes'
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('SELECIONAR');
                expect(resultado).toContain('nome');
                expect(resultado).toContain('email');
                expect(resultado).toContain('idade');
                expect(resultado).toContain('DE clientes');
            });

            it('Selecionar com condição', () => {
                const resultadoLexador = lexador.mapear([
                    'SELECT nome, email FROM clientes WHERE idade >= 18'
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('SELECIONAR');
                expect(resultado).toContain('nome');
                expect(resultado).toContain('email');
                expect(resultado).toContain('ONDE');
                expect(resultado).toContain('idade');
            });

            it('Selecionar com múltiplas condições', () => {
                const resultadoLexador = lexador.mapear([
                    'SELECT * FROM produtos WHERE preco > 100 AND categoria = "eletronicos"'
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('SELECIONAR *');
                expect(resultado).toContain('ONDE');
                expect(resultado).toContain('preco');
                expect(resultado).toContain(' E ');
                expect(resultado).toContain('categoria');
            });

            it('Selecionar com operadores de comparação', () => {
                const resultadoLexador = lexador.mapear([
                    'SELECT * FROM vendas WHERE valor < 1000'
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('SELECIONAR *');
                expect(resultado).toContain('ONDE');
                expect(resultado).toContain('valor');
            });

            it('Excluir tabela', () => {
                const resultadoLexador = lexador.mapear([
                    'DROP TABLE clientes_antigos'
                ]);

                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('REMOVER TABELA clientes_antigos');
            });

            it('Excluir visão', () => {
                const resultadoLexador = lexador.mapear([
                    'DROP VIEW relatorio_vendas'
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('REMOVER VISAO relatorio_vendas');
            });

            it('Múltiplos comandos', () => {
                const resultadoLexador = lexador.mapear([
                    'CREATE TABLE usuarios (id INT PRIMARY KEY);',
                    'INSERT INTO usuarios (id) VALUES (1);',
                    'SELECT * FROM usuarios;'
                ]);
                const resultadoAvaliadorSintatico = avaliadorSintatico.analisar(resultadoLexador);
                const resultado = tradutor.traduzir(resultadoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('CRIAR TABELA usuarios');
                expect(resultado).toContain('INSERIR EM usuarios');
                expect(resultado).toContain('SELECIONAR *');
            });
        });
    });
});