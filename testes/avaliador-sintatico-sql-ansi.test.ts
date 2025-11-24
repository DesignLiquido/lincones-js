import { AvaliadorSintaticoSqlAnsi } from "../fontes/avaliador-sintatico/avaliador-sintatico-sql-ansi";
import { LexadorSqlAnsi } from "../fontes/lexador/lexador-sql-ansi";
import { Alterar, Atualizar, Criar, Excluir, RemoverEntidade, Inserir, Selecionar } from "../fontes/comandos";

describe('Avaliador Sintático (SQL ANSI)', () => {
    let lexador: LexadorSqlAnsi;
    let avaliadorSintatico: AvaliadorSintaticoSqlAnsi;

    describe('analisar()', () => {
        describe('Cenário de sucesso', () => {
            beforeEach(() => {
                lexador = new LexadorSqlAnsi();
                avaliadorSintatico = new AvaliadorSintaticoSqlAnsi();
            });

            describe('CREATE TABLE', () => {
                it('Criar tabela simples', () => {
                    const codigo = [
                        'CREATE TABLE clientes (id INTEGER PRIMARY KEY, nome VARCHAR(120) NOT NULL)'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    expect(retornoAvaliadorSintatico.comandos.length).toBe(1);
                    
                    const comando = retornoAvaliadorSintatico.comandos[0] as Criar;
                    expect(comando).toBeInstanceOf(Criar);
                    expect(comando.nomeEntidade).toBe('clientes');
                    expect(comando.colunas.length).toBe(2);
                    expect(comando.colunas[0].nomeColuna).toBe('id');
                    expect(comando.colunas[0].tipo).toBe('INTEIRO');
                    expect(comando.colunas[0].chavePrimaria).toBe(true);
                    expect(comando.colunas[1].nomeColuna).toBe('nome');
                    expect(comando.colunas[1].tipo).toBe('CARACTERES');
                    expect(comando.colunas[1].nulo).toBe(false);
                });

                // TODO: Verificar se `IF NOT EXISTS` é parte do SQL ANSI.
                it.skip('Criar tabela com IF NOT EXISTS', () => {
                    const codigo = [
                        'CREATE TABLE IF NOT EXISTS usuarios (id INT PRIMARY KEY)'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Criar;
                    expect(comando.seNaoExistir).toBe(true);
                });

                it('Criar tabela com tipos variados', () => {
                    const codigo = [
                        'CREATE TABLE dados (id INT, ativo BOOLEAN, preco NUMERIC, descricao VARCHAR(255))'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Criar;
                    expect(comando.colunas[0].tipo).toBe('INTEIRO');
                    expect(comando.colunas[1].tipo).toBe('LOGICO');
                    expect(comando.colunas[2].tipo).toBe('NUMERO');
                    expect(comando.colunas[3].tipo).toBe('CARACTERES');
                });
            });

            describe('INSERT INTO', () => {
                it('Inserir registro simples', () => {
                    const codigo = [
                        'INSERT INTO clientes (nome, idade, ativo) VALUES ("João Silva", 30, TRUE)'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    expect(retornoAvaliadorSintatico.comandos.length).toBe(1);
                    
                    const comando = retornoAvaliadorSintatico.comandos[0] as Inserir;
                    expect(comando).toBeInstanceOf(Inserir);
                    expect(comando.tabela).toBe('clientes');
                    expect(comando.colunas.length).toBe(3);
                    expect(comando.colunas).toEqual(['nome', 'idade', 'ativo']);
                    expect(comando.valores.length).toBe(3);
                });

                it('Inserir com valores booleanos', () => {
                    const codigo = [
                        'INSERT INTO usuarios (nome, ativo, admin) VALUES ("Maria", TRUE, FALSE)'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Inserir;
                    expect(comando.valores.length).toBe(3);
                });

                it('Inserir com parâmetros', () => {
                    const codigo = [
                        'INSERT INTO produtos (nome, preco) VALUES (?, :preco)'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Inserir;
                    expect(comando.valores.length).toBe(2);
                });
            });

            describe('UPDATE', () => {
                it('Atualizar registro simples', () => {
                    const codigo = [
                        'UPDATE clientes SET nome = "João Pedro", idade = 31 WHERE id = 1'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    expect(retornoAvaliadorSintatico.comandos.length).toBe(1);
                    
                    const comando = retornoAvaliadorSintatico.comandos[0] as Atualizar;
                    expect(comando).toBeInstanceOf(Atualizar);
                    expect(comando.tabela).toBe('clientes');
                    expect(comando.colunasEValores.length).toBe(2);
                    expect(comando.condicoes.length).toBe(1);
                });

                it('Atualizar com valores booleanos', () => {
                    const codigo = [
                        'UPDATE usuarios SET ativo = TRUE, verificado = FALSE WHERE id = 5'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Atualizar;
                    expect(comando.colunasEValores.length).toBe(2);
                });

                it('Atualizar com múltiplas condições', () => {
                    const codigo = [
                        'UPDATE produtos SET preco = 100 WHERE categoria = "eletronicos" AND estoque > 0'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Atualizar;
                    expect(comando.condicoes.length).toBe(2);
                });

                it('Atualizar sem condições', () => {
                    const codigo = [
                        'UPDATE clientes SET ativo = FALSE'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Atualizar;
                    expect(comando.condicoes.length).toBe(0);
                });
            });

            describe('DELETE FROM', () => {
                it('Excluir registro com condição', () => {
                    const codigo = [
                        'DELETE FROM clientes WHERE id = 10'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    expect(retornoAvaliadorSintatico.comandos.length).toBe(1);
                    
                    const comando = retornoAvaliadorSintatico.comandos[0] as Excluir;
                    expect(comando).toBeInstanceOf(Excluir);
                    expect(comando.tabela).toBe('clientes');
                    expect(comando.condicoes.length).toBe(1);
                });

                it('Excluir com múltiplas condições', () => {
                    const codigo = [
                        'DELETE FROM produtos WHERE categoria = "obsoleto" AND estoque = 0'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Excluir;
                    expect(comando.condicoes.length).toBe(2);
                });

                it('Excluir sem condições', () => {
                    const codigo = [
                        'DELETE FROM temporarios'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Excluir;
                    expect(comando.condicoes.length).toBe(0);
                });
            });

            describe('SELECT', () => {
                it('Selecionar todas as colunas', () => {
                    const codigo = [
                        'SELECT * FROM clientes'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    expect(retornoAvaliadorSintatico.comandos.length).toBe(1);
                    
                    const comando = retornoAvaliadorSintatico.comandos[0] as Selecionar;
                    expect(comando).toBeInstanceOf(Selecionar);
                    expect(comando.tabela).toBe('clientes');
                    expect(comando.tudo).toBe(true);
                });

                it('Selecionar colunas específicas', () => {
                    const codigo = [
                        'SELECT nome, email, idade FROM clientes'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Selecionar;
                    expect(comando.colunas.length).toBe(3);
                    expect(comando.colunas).toEqual(['nome', 'email', 'idade']);
                });

                it('Selecionar com condição', () => {
                    const codigo = [
                        'SELECT nome, email FROM clientes WHERE idade >= 18'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Selecionar;
                    expect(comando.condicoes.length).toBe(1);
                });

                it('Selecionar com múltiplas condições', () => {
                    const codigo = [
                        'SELECT * FROM produtos WHERE preco > 100 AND categoria = "eletronicos"'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Selecionar;
                    expect(comando.condicoes.length).toBe(2);
                });

                it('Selecionar com operadores de comparação', () => {
                    const codigo = [
                        'SELECT * FROM vendas WHERE valor < 1000'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Selecionar;
                    expect(comando.condicoes.length).toBe(1);
                });
            });

            describe('ALTER TABLE', () => {
                it('Adicionar coluna', () => {
                    const codigo = [
                        'ALTER TABLE clientes ADD COLUMN telefone VARCHAR(20)'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    expect(retornoAvaliadorSintatico.comandos.length).toBe(1);
                    
                    const comando = retornoAvaliadorSintatico.comandos[0] as Alterar;
                    expect(comando).toBeInstanceOf(Alterar);
                    expect(comando.nomeEntidade).toBe('clientes');
                    expect(comando.operacoes.length).toBe(1);
                    expect(comando.operacoes[0].tipo).toBe('ADICIONAR');
                });

                it('Adicionar coluna com NOT NULL', () => {
                    const codigo = [
                        'ALTER TABLE produtos ADD COLUMN categoria TEXT NOT NULL'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Alterar;
                    expect((comando.operacoes[0].elemento as any).nulo).toBe(false);
                });

                it('Remover coluna', () => {
                    const codigo = [
                        'ALTER TABLE clientes DROP COLUMN telefone'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Alterar;
                    expect(comando.operacoes.length).toBe(1);
                    expect(comando.operacoes[0].tipo).toBe('REMOVER');
                });

                it('Alterar coluna', () => {
                    const codigo = [
                        'ALTER TABLE produtos ALTER COLUMN preco NUMERIC'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    const comando = retornoAvaliadorSintatico.comandos[0] as Alterar;
                    expect(comando.operacoes.length).toBe(1);
                    expect(comando.operacoes[0].tipo).toBe('ALTERAR');
                });
            });

            describe('DROP TABLE/VIEW', () => {
                it('Remover tabela', () => {
                    const codigo = [
                        'DROP TABLE clientes_antigos'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    expect(retornoAvaliadorSintatico.comandos.length).toBe(1);
                    
                    expect(retornoAvaliadorSintatico.comandos[0]).toBeInstanceOf(RemoverEntidade);
                    const comando = retornoAvaliadorSintatico.comandos[0] as RemoverEntidade;
                    expect(comando.nomeEntidade).toBe('clientes_antigos');
                    expect(comando.tipoEntidade).toBe('TABELA');
                });

                it('Remover view', () => {
                    const codigo = [
                        'DROP VIEW relatorio_vendas'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    expect(retornoAvaliadorSintatico.comandos[0]).toBeInstanceOf(RemoverEntidade);
                    const comando = retornoAvaliadorSintatico.comandos[0] as RemoverEntidade;
                    expect(comando.nomeEntidade).toBe('relatorio_vendas');
                    expect(comando.tipoEntidade).toBe('VISAO');
                });
            });

            describe('Múltiplos comandos', () => {
                it('Processar vários comandos em sequência', () => {
                    const codigo = [
                        'CREATE TABLE usuarios (id INT PRIMARY KEY);',
                        'INSERT INTO usuarios (id) VALUES (1);',
                        'SELECT * FROM usuarios;'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                    expect(retornoAvaliadorSintatico.erros.length).toBe(0);
                    expect(retornoAvaliadorSintatico.comandos.length).toBe(3);
                    expect(retornoAvaliadorSintatico.comandos[0]).toBeInstanceOf(Criar);
                    expect(retornoAvaliadorSintatico.comandos[1]).toBeInstanceOf(Inserir);
                    expect(retornoAvaliadorSintatico.comandos[2]).toBeInstanceOf(Selecionar);
                });
            });
        });

        describe('Cenários de erro', () => {
            beforeEach(() => {
                lexador = new LexadorSqlAnsi();
                avaliadorSintatico = new AvaliadorSintaticoSqlAnsi();
            });

            it('CREATE TABLE sem nome', () => {
                const codigo = ['CREATE TABLE ()'];
                const retornoLexador = lexador.mapear(codigo);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('INSERT com número incorreto de valores', () => {
                const codigo = [
                    'INSERT INTO clientes (nome, idade) VALUES ("João")'
                ];
                const retornoLexador = lexador.mapear(codigo);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('UPDATE sem SET', () => {
                const codigo = ['UPDATE clientes WHERE id = 1'];
                const retornoLexador = lexador.mapear(codigo);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });

            it('SELECT sem FROM', () => {
                const codigo = ['SELECT nome, email'];
                const retornoLexador = lexador.mapear(codigo);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                expect(retornoAvaliadorSintatico.erros.length).toBeGreaterThan(0);
            });
        });
    });
});