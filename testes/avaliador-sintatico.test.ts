import { AvaliadorSintatico } from '../fontes/avaliador-sintatico';
import { Lexador } from '../fontes/lexador';

describe('Avaliador Sintático', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;

    describe('analisar()', () => {
        describe('Cenário de sucesso', () => {
            beforeEach(() => {
                lexador = new Lexador();
                avaliadorSintatico = new AvaliadorSintatico();
            });

            describe('Operações sobre dados', () => {
                it('Atualizar dados em Tabela', () => {
                    const codigo = [
                        'ATUALIZAR clientes DEFINIR NOME = "Pernalonga" ONDE ID = 10;'
                    ];
                    const resultadoLexador = lexador.mapear(codigo);
                    const resultadoAvaliadorSintatico =
                        avaliadorSintatico.analisar(resultadoLexador);
                    expect(resultadoAvaliadorSintatico).toBeTruthy();
                    expect(resultadoAvaliadorSintatico.comandos).toHaveLength(1);
                    expect(resultadoAvaliadorSintatico.erros).toHaveLength(0);
                });
    
                it('Excluir em Tabela', () => {
                    const codigo = [
                        'EXCLUIR EM clientes ONDE ID = 3;'
                    ];
                    const resultadoLexador = lexador.mapear(codigo);
                    const resultadoAvaliadorSintatico =
                        avaliadorSintatico.analisar(resultadoLexador);
                    expect(resultadoAvaliadorSintatico).toBeTruthy();
                    expect(resultadoAvaliadorSintatico.comandos).toHaveLength(1);
                    expect(resultadoAvaliadorSintatico.erros).toHaveLength(0);
                });
    
                it('Inserir em Tabela', () => {
                    const codigo = [
                        'INSERIR EM clientes (NOME) VALORES ("Pernalonga")'
                    ];
                    const resultadoLexador = lexador.mapear(codigo);
                    const resultadoAvaliadorSintatico =
                        avaliadorSintatico.analisar(resultadoLexador);
                    expect(resultadoAvaliadorSintatico).toBeTruthy();
                    expect(resultadoAvaliadorSintatico.comandos).toHaveLength(1);
                    expect(resultadoAvaliadorSintatico.erros).toHaveLength(0);
                });
    
                it('Selecionar em tabela', () => {
                    const codigo = [
                        'SELECIONAR NOME, EMAIL DE clientes ONDE IDADE = 18;'
                    ];
                    const retornoLexador = lexador.mapear(codigo);
                    const retornoAvaliadorSintatico =
                        avaliadorSintatico.analisar(retornoLexador);
                    expect(retornoAvaliadorSintatico).toBeTruthy();
                    expect(retornoAvaliadorSintatico.comandos).toHaveLength(1);
                    expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                });
            });

            describe('Manipulação de esquemas de tabelas', () => {
                it('Criar Tabela', () => {
                    const codigo = [
                        'CRIAR TABELA clientes(ID INTEIRO NAO NULO CHAVE PRIMARIA AUTO INCREMENTO, NOME TEXTO(100) NAO NULO, IDADE INTEIRO NAO NULO, EMAIL TEXTO(255) NAO NULO, ATIVO LOGICO NAO NULO);'
                    ];
                    const resultadoLexador = lexador.mapear(codigo);
                    const resultadoAvaliadorSintatico =
                        avaliadorSintatico.analisar(resultadoLexador);
                    expect(resultadoAvaliadorSintatico).toBeTruthy();
                    expect(resultadoAvaliadorSintatico.comandos).toHaveLength(1);
                    expect(resultadoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Criar Tabela se não existir', () => {
                    const codigo = [
                        'CRIAR TABELA SE NÃO EXISTIR clientes ( ',
                        '  ID INTEIRO NAO NULO CHAVE PRIMARIA, ',
                        '  NOME TEXTO(100) NAO NULO, ',
                        '  IDADE INTEIRO NAO NULO, ',
                        '  EMAIL TEXTO(255) NAO NULO, ',
                        '  ATIVO LOGICO NAO NULO ',
                        ');'
                    ];
                    const resultadoLexador = lexador.mapear(codigo);
                    const resultadoAvaliadorSintatico =
                        avaliadorSintatico.analisar(resultadoLexador);
                    expect(resultadoAvaliadorSintatico).toBeTruthy();
                    expect(resultadoAvaliadorSintatico.comandos).toHaveLength(1);
                    expect(resultadoAvaliadorSintatico.erros).toHaveLength(0);
                });

                it('Criar Tabela se não existir', () => {
                    const codigo = [
                        'EXCLUIR TABELA clientes;'
                    ];
                    const resultadoLexador = lexador.mapear(codigo);
                    const resultadoAvaliadorSintatico =
                        avaliadorSintatico.analisar(resultadoLexador);
                    expect(resultadoAvaliadorSintatico).toBeTruthy();
                    expect(resultadoAvaliadorSintatico.comandos).toHaveLength(1);
                    expect(resultadoAvaliadorSintatico.erros).toHaveLength(0);
                });

                describe('Casos de alteração de tabelas', () => {
                    it('Adição de restrição', () => {
                        const codigo = [
                            'ALTERAR TABELA pedidos ',
                            'ADICIONAR RESTRIÇÃO chave_estrang ',
                            'CHAVE ESTRANGEIRA (cliente_id) ',
                            'REFERENCIA clientes (id);'
                        ];
                        const resultadoLexador = lexador.mapear(codigo);
                        const resultadoAvaliadorSintatico =
                            avaliadorSintatico.analisar(resultadoLexador);
                        expect(resultadoAvaliadorSintatico).toBeTruthy();
                        expect(resultadoAvaliadorSintatico.comandos).toHaveLength(1);
                        expect(resultadoAvaliadorSintatico.erros).toHaveLength(0);
                    });
                });
            });
        });
    });
});
