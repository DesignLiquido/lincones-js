# lincones-js

Implementação base da especificação de [LinConEs](https://github.com/DesignLiquido/LinConEs), normalmente usada por outros pacotes de tecnologias específicas.

## Motivação

Este pacote implementa todos os componentes comuns entre todos os outros pacotes de LinConEs, que são especializados por tecnologia. 

Esta implementação conta com três compomentes funcionais:

- Um Lexador, que separa o texto de entrada em símbolos significativos;
- Um Avaliador Sintático, que lê os simbolos gerados pelo Lexador em uma determinada ordem e retorna estruturas de alto nível, que representam diferentes comandos em bancos de dados;
- Um Tradutor, que lê as estruturas de alto nível geradas pelo Avaliador Sintático e as converte para comandos em SQL ANSI. 

Além desses componentes funcionais, definimos aqui comandos e construtos, usados pelos demais pacotes para definir estruturas de alto nível, servindo a diferentes propósitos, tais como:

- Tradução de LinConEs para SQL, e vice-versa;
- Produção de diagramas e fluxogramas.

### Suporte a traduções

Idealmente, LinConEs é uma especificação única para qualquer banco de dados. No entanto, nem todo banco de dados relacional segue a especificação SQL ANSI, sendo necessárias algumas nuances tecnológicas na hora de traduzir alguns comandos. Essas nuances tecnológicas são implementadas em pacotes específicos de cada tecnologia. Este pacote oferece tradução a SQL ANSI, independente da tecnologia do banco de dados, e a correspondente tradução reversa de SQL para LinConEs.

Diferentemente de pacotes dedicados a certas tecnologias, este pacote não possui um núcleo de execução, ou seja, uma interface por linha de comando. 
