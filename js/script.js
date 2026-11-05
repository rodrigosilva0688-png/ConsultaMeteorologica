
const formPesquisa = document.getElementById("formPesquisa");
const campoCidade = document.getElementById("cidade");
const mensagem = document.getElementById("mensagem");
const resultadosCidades = document.getElementById("resultadosCidades");
const climaAtual = document.getElementById("climaAtual");
const previsaoDias = document.getElementById("previsaoDias");
const cidadesFavoritas = document.getElementById("cidadesFavoritas");

let pesquisaAtual = 0;
let consultaAtual = 0;
let cidadeSelecionada = null;
let favoritos = [];

const estados = {
    "acre": "AC",
    "alagoas": "AL",
    "amapa": "AP",
    "amazonas": "AM",
    "bahia": "BA",
    "ceara": "CE",
    "distrito federal": "DF",
    "espirito santo": "ES",
    "goias": "GO",
    "maranhao": "MA",
    "mato grosso": "MT",
    "mato grosso do sul": "MS",
    "minas gerais": "MG",
    "para": "PA",
    "paraiba": "PB",
    "parana": "PR",
    "pernambuco": "PE",
    "piaui": "PI",
    "rio de janeiro": "RJ",
    "rio grande do norte": "RN",
    "rio grande do sul": "RS",
    "rondonia": "RO",
    "roraima": "RR",
    "santa catarina": "SC",
    "sao paulo": "SP",
    "sergipe": "SE",
    "tocantins": "TO"
};

function criarElemento(tag, classe = "", texto) {
    const el = document.createElement(tag);

    if (classe) {
        el.className = classe;
    }

    if (texto !== undefined) {
        el.textContent = texto;
    }

    return el;
}

function normalizar(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function mostrarMensagem(texto, estado = "normal") {
    mensagem.textContent = texto;
    mensagem.dataset.estado = estado;
}

try {
    const armazenados = JSON.parse(
        localStorage.getItem("cidadesFavoritas") || "[]"
    );

    favoritos = Array.isArray(armazenados) ? armazenados : [];
} catch (erro) {
    console.error(erro);
}

function identificador(cidade) {
    return cidade.id != null
        ? String(cidade.id)
        : `${cidade.latitude},${cidade.longitude}`;
}

function ehFavorita(cidade) {
    return favoritos.some(
        item => identificador(item) === identificador(cidade)
    );
}

function atualizarBotaoFavorito() {
    const botao = document.getElementById("botaoFavorito");

    if (botao && cidadeSelecionada) {
        botao.textContent = ehFavorita(cidadeSelecionada)
            ? "★ Remover dos favoritos"
            : "☆ Adicionar aos favoritos";
    }
}

function alternarFavorito(cidade) {
    const anteriores = [...favoritos];

    if (ehFavorita(cidade)) {
        favoritos = favoritos.filter(
            item => identificador(item) !== identificador(cidade)
        );
    } else {
        favoritos.push({
            id: cidade.id,
            name: cidade.name,
            admin1: cidade.admin1 || "",
            country: cidade.country || "",
            country_code: cidade.country_code || "",
            latitude: cidade.latitude,
            longitude: cidade.longitude
        });
    }

    try {
        localStorage.setItem(
            "cidadesFavoritas",
            JSON.stringify(favoritos)
        );
    } catch (erro) {
        favoritos = anteriores;
        mostrarMensagem(
            "Não foi possível salvar os favoritos.",
            "erro"
        );
        return;
    }

    exibirFavoritos();
    atualizarBotaoFavorito();
}

function exibirFavoritos() {
    cidadesFavoritas.replaceChildren();

    if (!favoritos.length) {
        cidadesFavoritas.append(
            criarElemento(
                "p",
                "texto-vazio",
                "Nenhuma cidade favorita cadastrada."
            )
        );
        return;
    }

    favoritos.forEach(cidade => {
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

        const remover = criarElemento(
            "button",
            "favorito-remover",
            "Remover"
        );

        consultar.type = "button";
        remover.type = "button";

        consultar.addEventListener("click", () => consultarClima(cidade));
        remover.addEventListener("click", () => alternarFavorito(cidade));

        cartao.append(nome, consultar, remover);
        cidadesFavoritas.append(cartao);
    });
}

function descricaoClima(c) {
    if (c === 0) return "Céu limpo";
    if ([1, 2].includes(c)) return "Parcialmente nublado";
    if (c === 3) return "Nublado";
    if ([45, 48].includes(c)) return "Neblina";
    if ([51, 53, 55, 56, 57].includes(c)) return "Garoa";

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(c)) {
        return "Chuva";
    }

    if ([71, 73, 75, 77, 85, 86].includes(c)) {
        return "Neve";
    }

    if ([95, 96, 99].includes(c)) {
        return "Tempestade";
    }

    return "Condição não informada";
}

function iconeClima(c) {
    if (c === 0) return "☀️";
    if ([1, 2].includes(c)) return "🌤️";
    if (c === 3) return "☁️";
    if ([45, 48].includes(c)) return "🌫️";

    if ([51, 53, 55, 56, 57].includes(c)) {
        return "🌦️";
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(c)) {
        return "🌧️";
    }

    if ([71, 73, 75, 77, 85, 86].includes(c)) {
        return "❄️";
    }

    if ([95, 96, 99].includes(c)) {
        return "⛈️";
    }

    return "🌡️";
}

function numero(valor, unidade = "") {
    return typeof valor === "number"
        ? `${valor.toLocaleString("pt-BR")}${unidade}`
        : "N/D";
}

function criarDetalhe(titulo, valor) {
    const card = criarElemento("div", "clima-detalhe");

    card.append(
        criarElemento("span", "", titulo),
        criarElemento("strong", "", valor)
    );

    return card;
}

function exibirClima(cidade, dados) {
    const tempo = dados.current;

    if (!tempo || typeof tempo.temperature_2m !== "number") {
        throw new Error("Temperatura atual indisponível.");
    }

    const nome = criarElemento(
        "p",
        "clima-cidade",
        cidade.name
    );

    const regiao = criarElemento(
        "p",
        "clima-regiao",
        `${cidade.admin1 || ""} ${cidade.country || ""}`
    );

    const temperatura = criarElemento(
        "p",
        "clima-temperatura",
        numero(tempo.temperature_2m, "°C")
    );

    temperatura.style.color =
        tempo.temperature_2m < 20
            ? "#84d9ff"
            : tempo.temperature_2m <= 30
                ? "#ffcd56"
                : "#ff8a7b";

    const condicao = criarElemento(
        "p",
        "clima-condicao",
        `${iconeClima(tempo.weather_code)} ${descricaoClima(tempo.weather_code)}`
    );

    const detalhes = criarElemento("div", "clima-informacoes");

    detalhes.append(
        criarDetalhe(
            "Sensação térmica",
            numero(tempo.apparent_temperature, "°C")
        ),
        criarDetalhe(
            "Umidade relativa",
            numero(tempo.relative_humidity_2m, "%")
        ),
        criarDetalhe(
            "Velocidade do vento",
            numero(tempo.wind_speed_10m, " km/h")
        ),
        criarDetalhe(
            "Direção do vento",
            numero(tempo.wind_direction_10m, "°")
        )
    );

    const favorito = criarElemento("button", "botao-favorito");
    favorito.id = "botaoFavorito";
    favorito.type = "button";

    favorito.addEventListener("click", () => alternarFavorito(cidade));

    climaAtual.replaceChildren(
        nome,
        regiao,
        temperatura,
        condicao,
        detalhes,
        favorito
    );

    atualizarBotaoFavorito();
}

function exibirPrevisao(dados) {
    const diario = dados.daily;

    if (!diario || !Array.isArray(diario.time)) {
        throw new Error("Previsão indisponível.");
    }

    previsaoDias.replaceChildren();

    diario.time.slice(0, 5).forEach((dia, i) => {
        const card = criarElemento("article", "previsao-card");

        const data = new Date(`${dia}T12:00:00`).toLocaleDateString(
            "pt-BR",
            {
                weekday: "short",
                day: "2-digit",
                month: "2-digit"
            }
        );

        const temperaturas = criarElemento(
            "div",
            "previsao-temperaturas"
        );

        temperaturas.append(
            criarElemento(
                "span",
                "previsao-maxima",
                `↑ ${numero(diario.temperature_2m_max?.[i], "°C")}`
            ),
            criarElemento(
                "span",
                "previsao-minima",
                `↓ ${numero(diario.temperature_2m_min?.[i], "°C")}`
            )
        );

        const chuva = diario.precipitation_probability_max?.[i];

        card.append(
            criarElemento("h3", "previsao-data", data),
            criarElemento(
                "div",
                "previsao-icone",
                iconeClima(diario.weather_code?.[i])
            ),
            criarElemento(
                "p",
                "previsao-condicao",
                descricaoClima(diario.weather_code?.[i])
            ),
            temperaturas,
            criarElemento(
                "p",
                "previsao-chuva",
                `💧 ${numero(chuva, "%")} de chuva`
            )
        );

        previsaoDias.append(card);
    });
}

const secaoAlertas = criarElemento("section", "secao-alertas");
secaoAlertas.id = "alertasMeteorologicos";
secaoAlertas.hidden = true;

const conteudoAlertas = criarElemento("div", "conteudo-alertas");

secaoAlertas.append(
    criarElemento("h2", "", "⚠ Alertas meteorológicos"),
    conteudoAlertas
);

climaAtual.closest("section").after(secaoAlertas);

function limparAlertas() {
    secaoAlertas.hidden = true;
    conteudoAlertas.replaceChildren();
}

function fonteAlertas() {
    const link = criarElemento(
        "a",
        "alerta-fonte",
        "Fonte: INMET via RadarMeteorológico"
    );

    link.href = "https://radarmeteorologico.com.br/alertas";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    conteudoAlertas.append(link);
}

function codigoIbge(codigo) {
    if (codigo && typeof codigo === "object") {
        return String(
            codigo.ibge ?? codigo.codigo ?? codigo.geocode ?? ""
        );
    }

    return String(codigo ?? "");
}
function alertaEstaVigente(alerta) {
    if (alerta.futuro === true) {
        return false;
    }

    if (!alerta.fim) {
        return false;
    }

    const fim = new Date(
        alerta.fim.replace(" ", "T")
    );

    if (Number.isNaN(fim.getTime())) {
        return false;
    }

    return fim.getTime() > Date.now();
}
function criarAlerta(alerta) {
    const card = criarElemento("article", "alerta-card");
    const nivel = Number(alerta.nivel);

    card.classList.add(
        nivel >= 3
            ? "alerta-grave"
            : nivel === 2
                ? "alerta-perigo"
                : "alerta-potencial"
    );

    card.append(
        criarElemento(
            "span",
            "alerta-nivel",
            alerta.severidade || "Aviso meteorológico"
        ),
        criarElemento(
            "h3",
            "alerta-evento",
            `⚠ ${alerta.evento || "Alerta do INMET"}`
        )
    );

    if (alerta.fim) {
        card.append(
            criarElemento(
                "p",
                "alerta-validade",
                `Válido até: ${alerta.fim}`
            )
        );
    }

    for (const campo of ["riscos", "instrucoes"]) {
        const valores = Array.isArray(alerta[campo])
            ? alerta[campo]
            : [alerta[campo]];

        valores.forEach(item => {
            const texto = typeof item === "string"
                ? item
                : (item?.descricao || item?.texto);

            if (texto) {
                card.append(
                    criarElemento(
                        "p",
                        campo === "riscos"
                            ? "alerta-risco"
                            : "alerta-instrucao",
                        texto
                    )
                );
            }
        });
    }

    return card;
}

async function consultarAlertas(cidade, numeroDaConsulta) {
    limparAlertas();

    const brasileiro =
        cidade.country_code === "BR" ||
        ["brasil", "brazil"].includes(normalizar(cidade.country));

    if (!brasileiro) {
        return;
    }

    const uf =
        estados[normalizar(cidade.admin1)] ||
        String(cidade.admin1 || "").toUpperCase();

    if (!Object.values(estados).includes(uf)) {
        return;
    }

    try {
        const urlMunicipios =
            `https://radarmeteorologico.com.br/api/v1/cidades?q=${encodeURIComponent(cidade.name)}`;

        const municipiosResposta = await fetch(urlMunicipios);

        if (!municipiosResposta.ok) {
            throw new Error("Falha na consulta de municípios.");
        }

        const municipiosJson = await municipiosResposta.json();

        if (numeroDaConsulta !== consultaAtual) {
            return;
        }

        const municipios = Array.isArray(municipiosJson)
            ? municipiosJson
            : municipiosJson.cidades;

        if (!Array.isArray(municipios)) {
            throw new Error("Resposta de municípios desconhecida.");
        }

        const municipio = municipios.find(item =>
            normalizar(item.nome) === normalizar(cidade.name) &&
            String(item.uf).toUpperCase() === uf
        );

        if (!municipio) {
            throw new Error(
                "Não foi possível confirmar o município pelo IBGE."
            );
        }

        const ibge = codigoIbge(
            municipio.ibge ??
            municipio.codigo_ibge ??
            municipio.codigo
        );

        if (!/^\d{7}$/.test(ibge)) {
            throw new Error("Código IBGE não identificado.");
        }

        const urlAlertas =
            `https://radarmeteorologico.com.br/api/v1/alertas?uf=${uf}`;

        const alertasResposta = await fetch(urlAlertas);

        if (!alertasResposta.ok) {
            throw new Error("Falha na consulta de alertas.");
        }

        const alertasJson = await alertasResposta.json();

        if (numeroDaConsulta !== consultaAtual) {
            return;
        }

        const alertas = Array.isArray(alertasJson)
            ? alertasJson
            : alertasJson.alertas;

        if (!Array.isArray(alertas)) {
            throw new Error("Resposta de alertas desconhecida.");
        }

const locais = alertas.filter(alerta =>
    alertaEstaVigente(alerta) &&
    Array.isArray(alerta.geocodes) &&
    alerta.geocodes.some(
        codigo => codigoIbge(codigo) === ibge
    )
);
        if (!locais.length) {
            return;
        }

        locais.sort(
            (a, b) => Number(b.nivel || 0) - Number(a.nivel || 0)
        );

        locais.forEach(alerta => {
            conteudoAlertas.append(criarAlerta(alerta));
        });

        fonteAlertas();
        secaoAlertas.hidden = false;

    } catch (erro) {
        if (numeroDaConsulta !== consultaAtual) {
            return;
        }

        console.error("Alertas:", erro);

        conteudoAlertas.append(
            criarElemento(
                "p",
                "alerta-indisponivel",
                "Não foi possível verificar alertas para esta cidade."
            )
        );

        fonteAlertas();
        secaoAlertas.hidden = false;
    }
}

async function consultarClima(cidade) {
    const numeroDaConsulta = ++consultaAtual;

    cidadeSelecionada = cidade;
    limparAlertas();

    document.querySelectorAll(".botao-cidade").forEach(botao => {
        botao.classList.toggle(
            "selecionado",
            botao.dataset.id === identificador(cidade)
        );
    });

    climaAtual.textContent =
        "Consultando condições meteorológicas...";

    previsaoDias.textContent =
        "Carregando previsão...";

    mostrarMensagem("Consultando clima...");

    const parametros = new URLSearchParams({
        latitude: cidade.latitude,
        longitude: cidade.longitude,
        current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m",
        daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
        timezone: "auto",
        forecast_days: "5"
    });

    try {
        const resposta = await fetch(
            `https://api.open-meteo.com/v1/forecast?${parametros}`
        );

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (numeroDaConsulta !== consultaAtual) {
            return;
        }

        if (dados.error) {
            throw new Error(
                dados.reason || "Resposta inválida da API."
            );
        }

        if (!dados.current || !dados.daily) {
            throw new Error("Dados meteorológicos incompletos.");
        }

        exibirClima(cidade, dados);
        exibirPrevisao(dados);

        mostrarMensagem(
            "Consulta concluída!",
            "sucesso"
        );

        consultarAlertas(cidade, numeroDaConsulta);

    } catch (erro) {
        if (numeroDaConsulta !== consultaAtual) {
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
    }
}

formPesquisa.addEventListener("submit", async function(event) {
    event.preventDefault();

    const nomeCidade = campoCidade.value.trim();

    if (!nomeCidade) {
        mostrarMensagem(
            "Digite o nome da cidade!",
            "erro"
        );
        return;
    }

    const numeroDaPesquisa = ++pesquisaAtual;

    ++consultaAtual;
    cidadeSelecionada = null;

    resultadosCidades.replaceChildren();

    climaAtual.textContent =
        "Selecione uma cidade para consultar o clima.";

    previsaoDias.replaceChildren();
    limparAlertas();

    mostrarMensagem("Pesquisando cidade...");

    try {
        const resposta = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nomeCidade)}&count=10&language=pt`
        );

        if (!resposta.ok) {
            throw new Error(`Erro HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (numeroDaPesquisa !== pesquisaAtual) {
            return;
        }

        if (!Array.isArray(dados.results) || !dados.results.length) {
            mostrarMensagem(
                "Nenhuma cidade encontrada!",
                "erro"
            );
            return;
        }

        dados.results.forEach(cidade => {
            const botao = criarElemento(
                "button",
                "botao-cidade",
                `${cidade.name} - ${cidade.admin1 || "Estado não informado"} - ${cidade.country || "País não informado"}`
            );

            botao.type = "button";
            botao.dataset.id = identificador(cidade);

            botao.addEventListener("click", () => {
                resultadosCidades
                    .querySelectorAll(".botao-cidade")
                    .forEach(outro => {
                        if (outro !== botao) {
                            outro.remove();
                        }
                    });

                consultarClima(cidade);
            });

            resultadosCidades.append(botao);
        });

        mostrarMensagem(
            "Selecione uma cidade nos resultados.",
            "sucesso"
        );

    } catch (erro) {
        if (numeroDaPesquisa !== pesquisaAtual) {
            return;
        }

        console.error(erro);

        mostrarMensagem(
            "Erro ao pesquisar cidades. Tente novamente.",
            "erro"
        );
    }
});

exibirFavoritos();
