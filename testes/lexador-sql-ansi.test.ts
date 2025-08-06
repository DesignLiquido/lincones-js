import { LexadorSqlAnsi } from '../fontes/lexador';

describe('Lexador SQL ANSI', () => {
    let lexador: LexadorSqlAnsi;

    beforeEach(() => {
        lexador = new LexadorSqlAnsi();
    });

    describe('mapear()', () => {
        describe('Cenário de sucesso', () => {
            it('Sucesso com código vazio', () => {
                const codigo = [''];
                const resultado = lexador.mapear(codigo);
                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Sucesso com código com apenas espaços', () => {
                const codigo = ['    '];
                const resultado = lexador.mapear(codigo);
                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Sucesso com código repetindo instruções', () => {
                const codigo = [
                    '((((((((((((((((((((((((((',
                    ')))))))))))))))))))))))))',
                    'CREATE CREATE CREATE CREATE CREATE CREATE'
                ];
                const resultado = lexador.mapear(codigo);
                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(57);
            });

            it('CREATE TABLE', () => {
                const codigo = ['CREATE TABLE usuarios'];
                const resultado = lexador.mapear(codigo);
                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(3);
            });

            it('UPDATE', () => {
                const codigo = ['UPDATE usuarios'];
                const resultado = lexador.mapear(codigo);
                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(2);
            });

            describe('Casos concretos', () => {
                it('CREATE TABLE Clientes', () => {
                    const codigo = [
                        'CREATE TABLE clientes(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nome VARCHAR(100) NOT NULL, idade INTEIRO NAO NULO, email VARCHAR(255) NOT NULL, ativo BOOLEAN NOT NULL)'
                    ];
                    const resultado = lexador.mapear(codigo);
                    expect(resultado).toBeTruthy();
                    expect(resultado.simbolos).toHaveLength(38);
                });

                it('CRUD', () => {
                    const codigo = [
                        'INSERT INTO clientes VALUES(1, "João", 20, "joao@gmail.com", TRUE)',
                        'INSERT INTO clientes VALUES(2, "Carlos", 23, "carlos@gmail.com", TRUE)',
                        'INSERT INTO clientes VALUES(3, "Thiago", 40, "thiago@gmail.com", TRUE)',
                        'INSERT INTO clientes VALUES(4, "Jose", 44, "jose@gmail.com", TRUE)'
                    ];
                    const resultado = lexador.mapear(codigo);
                    expect(resultado).toBeTruthy();
                    expect(resultado.simbolos).toHaveLength(60);
                });

                it('Selecionar', () => {
                    const codigo = ['SELECT * FROM clientes'];
                    const resultado = lexador.mapear(codigo);
                    expect(resultado).toBeTruthy();
                    expect(resultado.simbolos).toHaveLength(4);
                });
                
                it('Sucesso - Criar Tabela Clientes', () => {
                    const codigo = [
                        'CRIAR TABELA clientes(id INTEIRO NAO NULO CHAVE PRIMARIA AUTOINCREMENTO, nome TEXTO(100) NAO NULO, idade INTEIRO NAO NULO, email TEXTO(255) NAO NULO, ativo LOGICO NAO NULO);'
                    ];
                    const resultado = lexador.mapear(codigo);
                    expect(resultado).toBeTruthy();
                    expect(resultado.simbolos).toHaveLength(39);
                });
            });
        });
    });
});
