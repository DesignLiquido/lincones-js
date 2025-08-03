import { ColunaEValor, Condicao, Literal, OperacaoAlteracaoTabela, Restricao } from '../fontes/construtos';
import { Coluna } from '../fontes/construtos/coluna';

describe('Construtos', () => {
    describe('Coluna', () => {
        it('toString, trivial', () => {
            const coluna = new Coluna('nome', 'texto', undefined, true);
            expect(coluna.toString()).toBe("<Coluna nome=nome tipo=TEXTO nulo=Sim>");
        });

        it('toString, chave primária', () => {
            const coluna = new Coluna('nome', 'texto', undefined, false, true);
            expect(coluna.toString()).toBe("<Coluna nome=nome tipo=TEXTO nulo=Não chave primária;>");
        });
    });

    describe('ColunaEValor', () => {
        it('toString, trivial', () => {
            const colunaEValor = new ColunaEValor(
                new Coluna('nome', 'texto', undefined, false, true), 
                new Literal('valor')
            );
            
            expect(colunaEValor.toString()).toBe("<ColunaEValor coluna=nome valor=<Literal valor=valor tipo presumido=TEXTO>>");
        });
    });

    describe('Condicao', () => {
        it('toString, trivial', () => {
            const condicao = new Condicao(
                new Coluna('nome', 'texto', undefined, false, true), 
                'IGUAL', 
                new Literal('teste')
            );

            expect(condicao.toString()).toBe("<Condição operando esquerdo=<Coluna nome=nome tipo=TEXTO nulo=Não chave primária;> operador=IGUAL operando direito=<Literal valor=teste tipo presumido=TEXTO>>");
        });
    });

    describe('OperacaoAlteracaoTabela', () => {
        it('construtor, tipo inválido', () => {
            expect(() => {
                new OperacaoAlteracaoTabela('INVALIDO', new Coluna('coluna', 'texto'));
            }).toThrow('Tipo de operação de alteração de tabela inválido: INVALIDO');
        });

        it('toString, trivial', () => {
            const operacaoAlteracaoTabela = new OperacaoAlteracaoTabela('ADICIONAR', new Coluna('nova_coluna', 'texto'));
            expect(operacaoAlteracaoTabela.toString()).toBe("<OperaçãoAlteraçãoTabela tipo=ADICIONAR elemento=<Coluna nome=nova_coluna tipo=TEXTO nulo=Não>>");
        });
    });

    describe('Restricao', () => {
        it('toString, trivial', () => {
            const restricao = new Restricao(
                'teste_restricao', 
                'ÚNICA', 
                'teste_tabela',
                [
                    'coluna1',
                    'coluna2'
                ],
                'outra_tabela',
                [
                    'coluna3',
                    'coluna4'
                ]
            );

            expect(restricao.toString()).toBe("<Restrição nome=teste_restricao tabela=teste_tabela colunas=[coluna1, coluna2] tabela referenciada=outra_tabela colunas referenciadas=[coluna3, coluna4]>");
        });
    });
});
