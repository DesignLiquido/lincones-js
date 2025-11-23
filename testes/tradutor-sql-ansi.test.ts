import { AvaliadorSintatico } from "../fontes/avaliador-sintatico";
import { Lexador } from "../fontes/lexador";
import { TradutorSqlAnsi } from "../fontes/tradutor";

describe('Tradutor (SQL ANSI)', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;
    let tradutor: TradutorSqlAnsi;

    describe('traduzir()', () => {
        describe('Cenário de sucesso', () => {
            beforeEach(() => {
                lexador = new Lexador();
                avaliadorSintatico = new AvaliadorSintatico();
                tradutor = new TradutorSqlAnsi();
            });

            it.skip('Criar', () => {
                const codigo = [
                    'CRIAR TABELA clientes (id INTEIRO CHAVE PRIMARIA, email CARACTERES(120))'
                ];
                const retornoLexador = lexador.mapear(codigo);
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.comandos);

                expect(resultado).toBeTruthy();
                expect(resultado).toContain('CREATE TABLE clientes');
                expect(resultado).toContain('email');
                expect(resultado).toContain('VARCHAR');
            });

            describe('Alterar tabela', () => {
                it('Adição de coluna', () => {
                    const codigo = [
                        'ALTERAR TABELA clientes ADICIONAR COLUNA email CARACTERES(120)'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador);
                    const resultado = tradutor.traduzir(retornoAvaliadorSintatico.comandos);
                    expect(resultado).toBeTruthy();
                    expect(resultado).toContain('ALTER TABLE clientes');
                    expect(resultado).toContain('ADD COLUMN');
                    expect(resultado).toContain('email');
                    expect(resultado).toContain('VARCHAR(120)');
                });

                it('Adição de restrição', () => {
                    const codigo = [
                        'ALTERAR TABELA pedidos ',
                        'ADICIONAR RESTRIÇÃO chave_estrang ',
                        'CHAVE ESTRANGEIRA (cliente_id) ',
                        'REFERENCIA clientes (id);'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador);
                    const resultado = tradutor.traduzir(retornoAvaliadorSintatico.comandos);
                    expect(resultado).toBeTruthy();
                    expect(resultado).toContain('ALTER TABLE pedidos');
                    expect(resultado).toContain('ADD CONSTRAINT chave_estrang');
                    expect(resultado).toContain('FOREIGN KEY');
                });

                it('Alteração de coluna', () => {
                    const codigo = [
                        'ALTERAR TABELA clientes ALTERAR COLUNA email CARACTERES(120)'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador);
                    const resultado = tradutor.traduzir(retornoAvaliadorSintatico.comandos);
                    expect(resultado).toBeTruthy();
                    expect(resultado).toContain('ALTER TABLE clientes');
                    expect(resultado).toContain('ALTER COLUMN');
                    expect(resultado).toContain('email');
                    expect(resultado).toContain('VARCHAR(120)');
                });
            });

            it('Atualizar', () => {
                const codigo = [
                    'ATUALIZAR clientes DEFINIR NOME = "Pernalonga", IDADE = 18, ATIVO = VERDADEIRO, CASADO = FALSO ONDE ID = 10;'
                ];
                const retornoLexador = lexador.mapear(codigo);
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.comandos);
                expect(resultado).toBeTruthy();
                expect(resultado).toContain('UPDATE clientes');
                expect(resultado).toContain('SET');
                expect(resultado).toContain('NOME');
                expect(resultado).toContain('Pernalonga');
                expect(resultado).toContain('IDADE');
                expect(resultado).toContain('18');
                expect(resultado).toContain('ATIVO');
                expect(resultado).toContain('TRUE');
                expect(resultado).toContain('CASADO');
                expect(resultado).toContain('FALSE');
                expect(resultado).toContain('WHERE');
                expect(resultado).toContain('ID');
                expect(resultado).toContain('=');
                expect(resultado).toContain('10');
            });

            it('Inserir', () => {
                const codigo = [
                    'INSERIR EM clientes (NOME, IDADE, ATIVO, EMAIL) VALORES ("Pernalonga", 18, verdadeiro, "pernalonga@warnerbros.com")'
                ];
                const retornoLexador = lexador.mapear(codigo);
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.comandos);
                expect(resultado).toBeTruthy();
                expect(resultado).toContain('INSERT INTO');
                expect(resultado).toContain('VALUES');
                expect(resultado).toContain('Pernalonga');
                expect(resultado).toContain('18');
                expect(resultado).toContain('TRUE');
            });

            it('Excluir', () => {
                const codigo = [
                    'EXCLUIR EM clientes ONDE ID = 2'
                ];
                const retornoLexador = lexador.mapear(codigo);
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.comandos);
                expect(resultado).toBeTruthy();
                expect(resultado).toContain('DELETE FROM');
                expect(resultado).toContain('clientes');
                expect(resultado).toContain('WHERE');
                expect(resultado).toContain('ID = 2');
            });

            it('Selecionar', () => {
                const codigo = [
                    'SELECIONAR NOME, EMAIL DE clientes ONDE IDADE = 18;'
                ];
                const retornoLexador = lexador.mapear(codigo);
                const retornoAvaliadorSintatico =
                    avaliadorSintatico.analisar(retornoLexador);
                const resultado = tradutor.traduzir(retornoAvaliadorSintatico.comandos);
                expect(resultado).toBeTruthy();
                expect(resultado).toContain('SELECT');
                expect(resultado).toContain('FROM');
                expect(resultado).toContain('WHERE');
            });
        });
    });
});
