# 🌦️ Nimbus — Consulta Meteorológica

Aplicação web desenvolvida como projeto do curso de Desenvolvimento Front-end do programa **Bolsa Futuro Digital**.

## Sobre o projeto

A Nimbus permite consultar condições meteorológicas de diferentes cidades, visualizar a previsão do tempo para os próximos cinco dias e acompanhar alertas meteorológicos de municípios brasileiros.

O projeto foi desenvolvido utilizando HTML, CSS e JavaScript, com integração a APIs públicas e armazenamento local de cidades favoritas.

## Funcionalidades

- Pesquisa de cidades por nome.
- Seleção de localidades por estado e país.
- Consulta de temperatura e condições meteorológicas atuais.
- Exibição de sensação térmica, umidade e velocidade do vento.
- Previsão meteorológica para cinco dias.
- Probabilidade de precipitação.
- Cadastro e remoção de cidades favoritas.
- Persistência de favoritos utilizando localStorage.
- Consulta de alertas meteorológicos do INMET.
- Interface responsiva para computadores e dispositivos móveis.
- Tratamento de erros e mensagens de carregamento.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Fetch API
- Async/Await
- DOM
- LocalStorage
- JSON

## APIs utilizadas

**Open-Meteo:** pesquisa de localidades, condições meteorológicas e previsão do tempo.

**RadarMeteorológico:** consulta de alertas meteorológicos associados ao INMET.

## Como executar

1. Clone ou baixe este repositório.
2. Abra a pasta do projeto no VS Code.
3. Abra o arquivo `index.html` utilizando a extensão Live Server.
4. Pesquise uma cidade para consultar os dados meteorológicos.

É necessária conexão com a internet para obter informações atualizadas das APIs.

## Estrutura do projeto

```text
ConsultaMeteorologica/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── README.md
```

## Objetivo de aprendizagem

Praticar o desenvolvimento Front-end por meio da comunicação com APIs, programação assíncrona, manipulação do DOM, organização de funções e persistência de dados no navegador.

## Autor

**Rodrigo Conceição da Silva**

Projeto acadêmico desenvolvido durante o Bolsa Futuro Digital.
