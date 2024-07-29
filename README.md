# lincones-js

Implementação base da especificação de [LinConEs](https://github.com/DesignLiquido/LinConEs), normalmente usada por outros pacotes de tecnologias específicas.

## Motivação

Idealmente, LinConEs é uma especificação única para qualquer banco de dados. No entanto, nem todo banco de dados relacional segue a especificação SQL ANSI, sendo necessárias algumas nuancas tecnológicas na hora de traduzir alguns comandos. 

Esta implementação conta com três compomentes funcionais:

- Um Lexador, que separa o texto de entrada em símbolos significativos;
- Um Avaliador Sintático, que lê os simbolos gerados pelo Lexador em uma determinada ordem e retorna estruturas de alto nível, que representam diferentes comandos em bancos de dados;
- Um Tradutor, que lê as estruturas de alto nível geradas pelo Avaliador Sintático e as converte para comandos em SQL ANSI. 

Diferentemente de pacotes dedicados a certas tecnologias, este pacote não possui um núcleo de execução, ou seja, uma interface por linha de comando. 
