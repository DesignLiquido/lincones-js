import { AvaliadorSintatico } from "./fontes/avaliador-sintatico";
import { Lexador } from "./fontes/lexador";
import { Tradutor } from "./fontes/tradutor";

const lexador = new Lexador();
const avaliadorSintatico = new AvaliadorSintatico();
const tradutor = new Tradutor();

const sentencaSelecao = 'SELECIONAR NOME, EMAIL DE clientes ONDE IDADE = 18;';
let resultadoLexador = lexador.mapear([sentencaSelecao]);
let resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador);
let resultadoTraducao = tradutor.traduzir(resultadoAvaliacaoSintatica.comandos);
console.log(resultadoTraducao);

const sentencaCriacao = 'CRIAR TABELA clientes(ID INTEIRO NAO NULO CHAVE PRIMARIA AUTO INCREMENTO, NOME TEXTO(100) NAO NULO, IDADE INTEIRO NAO NULO, EMAIL TEXTO(255) NAO NULO, ATIVO LOGICO NAO NULO);';
resultadoLexador = lexador.mapear([sentencaCriacao]);
resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador);
resultadoTraducao = tradutor.traduzir(resultadoAvaliacaoSintatica.comandos);
console.log(resultadoTraducao);

const sentencaInsercao = 'INSERIR EM clientes (NOME) VALORES ("Pernalonga")';
resultadoLexador = lexador.mapear([sentencaInsercao]);
resultadoAvaliacaoSintatica = avaliadorSintatico.analisar(resultadoLexador);
resultadoTraducao = tradutor.traduzir(resultadoAvaliacaoSintatica.comandos);
console.log(resultadoTraducao);