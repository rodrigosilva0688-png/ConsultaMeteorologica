
const formPesquisa = document.getElementById("formPesquisa");
const campoCidade = document.getElementById("cidade");
const mensagem = document.getElementById("mensagem");
const resultadosCidades = document.getElementById("resultadosCidades");
const climaAtual = document.getElementById("climaAtual");
const previsaoDias = document.getElementById("previsaoDias");
const cidadesFavoritas = document.getElementById("cidadesFavoritas");

let numeroPesquisa = 0;
let numeroConsultaClima = 0;
let cidadeSelecionada = null;
let favoritos = [];

try {
    const salvos = JSON.parse(
        localStorage.getItem("cidadesFavoritas") || "[]"
    );

    favoritos = Array.isArray(salvos) ? salvos : [];
} catch (erro) {
    console.error(erro);
    favoritos = [];
}

function mostrarMensagem(texto, estado = "normal") {
    mensagem.textContent = texto;
    mensagem.dataset.estado = estado;
}

function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
        elemento.className = classe;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}

function salvarFavoritos() {
    try {
        localStorage.setItem(
            "cidadesFavoritas",
            JSON.stringify(favoritos)
        );

        return true;
    } catch (erro) {
        console.error(erro);
        mostrarMensagem(
            "Não foi possível salvar os favoritos.",
            "erro"
        );

        return false;
    }
}

function cidadeEhFavorita(cidade) {
    return favoritos.some(function(favorita) {
        return favorita.id === cidade.id;
    });
}

function atualizarBotaoFavorito() {
    const botao = document.getElementById("botaoFavorito");

    if (!botao || !cidadeSelecionada) {
        return;
    }

    botao.textContent = cidadeEhFavorita(cidadeSelecionada)
        ? "★ Remover dos favoritos"
        : "☆ Adicionar aos favoritos";
}

function alternarFavorito(cidade) {
    const anteriores = [...favoritos];

    if (cidadeEhFavorita(cidade)) {
        favoritos = favoritos.filter(function(item) {
            return item.id !== cidade.id;
        });
    } else {
        favoritos.push({
            id: cidade.id,
            name: cidade.name,
            admin1: cidade.admin1 || "",
            country: cidade.country || "",
            latitude: cidade.latitude,
            longitude: cidade.longitude
        });
    }

    if (!salvarFavoritos()) {
        favoritos = anteriores;
        return;
    }

    exibirFavoritos();
    atualizarBotaoFavorito();
}

function exibirFavoritos() {
    cidadesFavoritas.replaceChildren();

    if (favoritos.length === 0) {
        cidadesFavoritas.appendChild(
            criarElemento(
                "p",
                "",
                "Nenhuma cidade favorita cadastrada."
            )
        );

        return;
    }

    favoritos.forEach(function(cidade) {
        const cartao = criarElemento("div", "favorito-card");

        const nome = criarElemento(
            "span",
            "favorito-nome",
            `${cidade.name} - ${cidade.admin1 || cidade.country}`
        );

        const consultar = criarElemento(
            "button",
            "favorito-consultar",
            "Consultar"
        );

        consultar.type = "button";

        consultar.addEventListener("click", function() {
            consultarClima(cidade);
        });

        const remover = criarElemento(
            "button",
            "favorito-remover",
            "Remover"
        );

        remover.type = "button";

        remover.addEventListener("click", function() {
            alternarFavorito(cidade);
        });

        cartao.append(nome, consultar, remover);
        cidadesFavoritas.appendChild(cartao);
    });
}

function criarDetalhe(titulo, valor) {
    const detalhe = criarElemento("div", "clima-detalhe");

    const rotulo = criarElemento("span", "", titulo);

    const informacao = criarElemento(
        "strong",
        "",
        valor
    );

    detalhe.append(rotulo, informacao);

    return detalhe;
}

function descricaoClima(codigo) {
    if (codigo === 0) return "Céu limpo";

    if ([1, 2].includes(codigo)) {
        return "Parcialmente nublado";
    }

    if (codigo === 3) return "Nublado";

    if ([45, 48].includes(codigo)) {
        return "Neblina";
    }

    if ([51, 53, 55, 56, 57].includes(codigo)) {
        return "Garoa";
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) {
        return "Chuva";
    }

    if ([71, 73, 75, 77, 85, 86].includes(codigo)) {
        return "Neve";
    }

    if ([95, 96, 99].includes(codigo)) {
        return "Tempestade";
    }

    return "Condição não informada";
}

function iconeClima(codigo) {
    if (codigo === 0) return "☀️";

    if ([1, 2].includes(codigo)) return "🌤️";

    if (codigo === 3) return "☁️";

    if ([45, 48].includes(codigo)) return "🌫️";

    if ([51, 53, 55, 56, 57].includes(codigo)) {
        return "🌦️";
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) {
        return "🌧️";
    }

    if ([71, 73, 75, 77, 85, 86].includes(codigo)) {
        return "❄️";
    }

    if ([95, 96, 99].includes(codigo)) {
        return "⛈️";
    }

    return "🌡️";
}

function formatarData(data) {
    const dataLocal = new Date(`${data}T12:00:00`);

    return dataLocal.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit"
    });
}

function formatarTemperatura(valor) {
    return typeof valor === "number"
        ? `${Math.round(valor)}°C`
        : "N/D";
}

function exibirClima(cidade, dadosClima) {
    const tempo = dadosClima.current;

    if (!tempo || typeof tempo.temperature_2m !== "number") {
        throw new Error(
            "Temperatura atual indisponível na resposta."
        );
    }

    const temperaturaAtual = tempo.temperature_2m;
    const velocidadeVento = tempo.wind_speed_10m;
    const direcaoVento = tempo.wind_direction_10m;
    const sensacaoTermica = tempo.apparent_temperature;
    const umidadeRelativa = tempo.relative_humidity_2m;
    const codigoClima = tempo.weather_code;

    const nome = criarElemento(
        "p",
        "clima-cidade",
        cidade.name
    );

    const regiao = criarElemento(
        "p",
        "clima-regiao",
        `${cidade.admin1 || "Estado não informado"} - ${cidade.country || "País não informado"}`
    );

    const temperatura = criarElemento(
        "p",
        "clima-temperatura",
        `${temperaturaAtual.toLocaleString("pt-BR")}°C`
    );

    if (temperaturaAtual < 20) {
        temperatura.style.color = "#7dd3fc";
    } else if (temperaturaAtual <= 30) {
        temperatura.style.color = "#ffcf43";
    } else {
        temperatura.style.color = "#ff6b6b";
    }

    const condicao = criarElemento(
        "p",
        "clima-condicao",
        `${iconeClima(codigoClima)} ${descricaoClima(codigoClima)}`
    );

    const informacoes = criarElemento(
        "div",
        "clima-informacoes"
    );

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

    const sensacao = criarDetalhe(
        "Sensação térmica",
        typeof sensacaoTermica === "number"
            ? `${sensacaoTermica.toLocaleString("pt-BR")}°C`
            : "Não disponível"
    );

    const umidade = criarDetalhe(
        "Umidade relativa",
        typeof umidadeRelativa === "number"
            ? `${umidadeRelativa}%`
            : "Não disponível"
    );

    informacoes.append(
        vento,
        direcao,
        sensacao,
        umidade
    );

    const botaoFavorito = criarElemento(
        "button",
        "botao-favorito"
    );

    botaoFavorito.id = "botaoFavorito";
    botaoFavorito.type = "button";

    botaoFavorito.addEventListener("click", function() {
        alternarFavorito(cidade);
    });

    climaAtual.replaceChildren(
        nome,
        regiao,
        temperatura,
        condicao,
        informacoes,
        botaoFavorito
    );

    atualizarBotaoFavorito();
}

function exibirPrevisao(dadosClima) {
    const daily = dadosClima.daily;

    if (!daily || !Array.isArray(daily.time)) {
        throw new Error("Previsão diária indisponível.");
    }

    previsaoDias.replaceChildren();

    daily.time.slice(0, 5).forEach(function(dia, indice) {
        const maxima = daily.temperature_2m_max?.[indice];
        const minima = daily.temperature_2m_min?.[indice];
        const chuva = daily.precipitation_probability_max?.[indice];
        const codigo = daily.weather_code?.[indice];

        const cartao = criarElemento(
            "div",
            "previsao-card"
        );

        const data = criarElemento(
            "h3",
            "previsao-data",
            formatarData(dia)
        );

        const icone = criarElemento(
            "div",
            "previsao-icone",
            iconeClima(codigo)
        );

        const condicao = criarElemento(
            "p",
            "previsao-condicao",
            descricaoClima(codigo)
        );

        const temperaturas = criarElemento(
            "div",
            "previsao-temperaturas"
        );

        const textoMaxima = criarElemento(
            "span",
            "previsao-maxima",
            `↑ ${formatarTemperatura(maxima)}`
        );

        const textoMinima = criarElemento(
            "span",
            "previsao-minima",
            `↓ ${formatarTemperatura(minima)}`
        );

        temperaturas.append(
            textoMaxima,
            textoMinima
        );

        const probabilidade = criarElemento(
            "p",
            "previsao-chuva",
            typeof chuva === "number"
                ? `💧 Chuva: ${chuva}%`
                : "💧 Chuva: N/D"
        );

        cartao.append(
            data,
            icone,
            condicao,
            temperaturas,
            probabilidade
        );

        previsaoDias.appendChild(cartao);
    });
}

function consultarClima(cidade) {
    const consultaAtual = ++numeroConsultaClima;

    cidadeSelecionada = cidade;

    document.querySelectorAll(".botao-cidade").forEach(
        function(botao) {
            botao.classList.toggle(
                "selecionado",
                botao.dataset.cidadeId === String(cidade.id)
            );
        }
    );

    mostrarMensagem("Consultando clima...");

    climaAtual.textContent =
        "Carregando condições meteorológicas...";

    previsaoDias.textContent =
        "Carregando previsão...";

    const parametros = new URLSearchParams({
        latitude: cidade.latitude,
        longitude: cidade.longitude,
        current: [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "weather_code",
            "wind_speed_10m",
            "wind_direction_10m"
        ].join(","),
        daily: [
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_probability_max",
            "weather_code"
        ].join(","),
        timezone: "auto",
        forecast_days: "5"
    });

    const urlClima =
        `https://api.open-meteo.com/v1/forecast?${parametros.toString()}`;

    fetch(urlClima)
        .then(function(resposta) {
            if (!resposta.ok) {
                throw new Error(
                    `Erro HTTP ${resposta.status} ao consultar o clima.`
                );
            }

            return resposta.json();
        })
        .then(function(dadosClima) {
            if (consultaAtual !== numeroConsultaClima) {
                return;
            }

            if (dadosClima.error) {
                throw new Error(
                    dadosClima.reason || "Erro retornado pela API."
                );
            }

            console.log("Dados meteorológicos:", dadosClima);

            if (!dadosClima.current) {
                throw new Error(
                    "A API não retornou os dados meteorológicos atuais."
                );
            }

            exibirClima(cidade, dadosClima);
            exibirPrevisao(dadosClima);

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

            previsaoDias.textContent =
                "Previsão indisponível no momento.";

            mostrarMensagem(
                "Erro ao consultar o clima. Tente novamente.",
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
    cidadeSelecionada = null;

    resultadosCidades.replaceChildren();

    climaAtual.textContent =
        "Selecione uma cidade para consultar o clima.";

    previsaoDias.replaceChildren();

    mostrarMensagem("Pesquisando cidade...");

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nomeCidade)}&count=10&language=pt`;

    fetch(url)
        .then(function(resposta) {
            if (!resposta.ok) {
                throw new Error(
                    "Erro ao localizar a cidade."
                );
            }

            return resposta.json();
        })
        .then(function(dados) {
            if (pesquisaAtual !== numeroPesquisa) {
                return;
            }

            if (
                !Array.isArray(dados.results) ||
                dados.results.length === 0
            ) {
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

                const botaoCidade = criarElemento(
                    "button",
                    "botao-cidade",
                    `${cidade.name} - ${estado} - ${pais}`
                );

                botaoCidade.type = "button";

                botaoCidade.dataset.cidadeId =
                    String(cidade.id);

                botaoCidade.addEventListener(
                    "click",
                    function() {
                        consultarClima(cidade);
                    }
                );

                resultadosCidades.appendChild(
                    botaoCidade
                );
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

exibirFavoritos();
