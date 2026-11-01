
const formPesquisa = document.getElementById("formPesquisa");
const campoCidade = document.getElementById("cidade");
const mensagem = document.getElementById("mensagem");
const resultadosCidades = document.getElementById("resultadosCidades");
const climaAtual = document.getElementById("climaAtual");

let numeroPesquisa = 0;
let numeroConsultaClima = 0;

function mostrarMensagem(texto, estado = "normal") {
    mensagem.textContent = texto;
    mensagem.dataset.estado = estado;
}

function criarDetalhe(titulo, valor) {

    const detalhe = document.createElement("div");
    detalhe.className = "clima-detalhe";

    const rotulo = document.createElement("span");
    rotulo.textContent = titulo;

    const informacao = document.createElement("strong");
    informacao.textContent = valor;

    detalhe.appendChild(rotulo);
    detalhe.appendChild(informacao);

    return detalhe;
}

function exibirClima(cidade, dadosClima) {

    const tempo = dadosClima.current_weather;

    if (!tempo || typeof tempo.temperature !== "number") {
        throw new Error("Temperatura indisponível na resposta.");
    }

    const temperaturaAtual = tempo.temperature;
    const velocidadeVento = tempo.windspeed;
    const direcaoVento = tempo.winddirection;

    const nome = document.createElement("p");
    nome.className = "clima-cidade";
    nome.textContent = cidade.name;

    const regiao = document.createElement("p");
    regiao.className = "clima-regiao";

    const estado = cidade.admin1 || "Estado não informado";
    const pais = cidade.country || "País não informado";

    regiao.textContent = `${estado} - ${pais}`;

    const temperatura = document.createElement("p");
    temperatura.className = "clima-temperatura";

    temperatura.textContent =
        `${temperaturaAtual.toLocaleString("pt-BR")}°C`;

    if (temperaturaAtual < 20) {
        temperatura.style.color = "#7dd3fc";

    } else if (temperaturaAtual >= 20 && temperaturaAtual <= 30) {
        temperatura.style.color = "#ffcf43";

    } else {
        temperatura.style.color = "#ff6b6b";
    }

    const informacoes = document.createElement("div");
    informacoes.className = "clima-informacoes";

    const vento = criarDetalhe(
        "Velocidade do vento",
        typeof velocidadeVento === "number"
            ? `${velocidadeVento.toLocaleString("pt-BR")} km/h`
            : "Não disponível"
    );

    const direcao = criarDetalhe(
        "Direção do vento",
        typeof direcaoVento === "number"
            ? `${direcaoVento}°`
            : "Não disponível"
    );

    informacoes.appendChild(vento);
    informacoes.appendChild(direcao);

    climaAtual.replaceChildren(
        nome,
        regiao,
        temperatura,
        informacoes
    );
}

function consultarClima(cidade, botaoCidade) {

    const consultaAtual = ++numeroConsultaClima;

    document.querySelectorAll(".botao-cidade").forEach(
        function(botao) {
            botao.classList.remove("selecionado");
        }
    );

    botaoCidade.classList.add("selecionado");

    mostrarMensagem("Consultando clima...");

    climaAtual.textContent = "Carregando condições meteorológicas...";

    const urlClima =
        `https://api.open-meteo.com/v1/forecast?latitude=${cidade.latitude}&longitude=${cidade.longitude}&current_weather=true`;

    fetch(urlClima)
        .then(function(resposta) {

            if (!resposta.ok) {
                throw new Error("Erro ao consultar o clima.");
            }

            return resposta.json();
        })

        .then(function(dadosClima) {

            if (consultaAtual !== numeroConsultaClima) {
                return;
            }

            console.log(dadosClima);

            exibirClima(cidade, dadosClima);

            mostrarMensagem(
                "Consulta concluída!",
                "sucesso"
            );
        })

        .catch(function(erro) {

            if (consultaAtual !== numeroConsultaClima) {
                return;
            }

            console.error(erro);

            climaAtual.textContent =
                "Não foi possível consultar o clima desta cidade.";

            mostrarMensagem(
                "Erro ao consultar a previsão meteorológica.",
                "erro"
            );
        });
}

formPesquisa.addEventListener("submit", function(event) {

    event.preventDefault();

    const nomeCidade = campoCidade.value.trim();

    if (nomeCidade === "") {

        mostrarMensagem(
            "Digite o nome da cidade!",
            "erro"
        );

        return;
    }

    const pesquisaAtual = ++numeroPesquisa;

    ++numeroConsultaClima;

    resultadosCidades.replaceChildren();

    climaAtual.textContent =
        "Selecione uma cidade para consultar o clima.";

    mostrarMensagem("Pesquisando cidade...");

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nomeCidade)}&count=10&language=pt`;

    fetch(url)
        .then(function(resposta) {

            if (!resposta.ok) {
                throw new Error("Erro ao localizar a cidade.");
            }

            return resposta.json();
        })

        .then(function(dados) {

            if (pesquisaAtual !== numeroPesquisa) {
                return;
            }

            if (!Array.isArray(dados.results) ||
                dados.results.length === 0) {

                mostrarMensagem(
                    "Nenhuma cidade encontrada!",
                    "erro"
                );

                return;
            }

            dados.results.forEach(function(cidade) {

                const estado =
                    cidade.admin1 || "Estado não informado";

                const pais =
                    cidade.country || "País não informado";

                const botaoCidade =
                    document.createElement("button");

                botaoCidade.type = "button";
                botaoCidade.className = "botao-cidade";

                botaoCidade.textContent =
                    `${cidade.name} - ${estado} - ${pais}`;

                botaoCidade.addEventListener("click", function() {

                    console.log(cidade.name);
                    console.log(cidade.latitude);
                    console.log(cidade.longitude);

                    consultarClima(cidade, botaoCidade);
                });

                resultadosCidades.appendChild(botaoCidade);

            });

            mostrarMensagem(
                "Selecione uma cidade nos resultados.",
                "sucesso"
            );
        })

        .catch(function(erro) {

            if (pesquisaAtual !== numeroPesquisa) {
                return;
            }

            console.error(erro);

            mostrarMensagem(
                "Erro ao pesquisar cidades. Tente novamente.",
                "erro"
            );
        });

});
