console.log("java script funcionando");
const formPesquisa=document.getElementById("formPesquisa");
formPesquisa.addEventListener("submit", function(event)  {
    event.preventDefault();
    const mensagem = document.getElementById("mensagem");
    const campoCidade = document.getElementById("cidade");
    const nomeCidade = campoCidade.value.trim();
     if (nomeCidade === "") {
        mensagem.textContent = "Digite o nome da cidade!";
        return;

     }

    console.log("Formulario enviado!");
    mensagem.textContent= "Pesquisando cidade";
    const url =`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nomeCidade)}`;
    fetch(url).then(function(resposta) {
        return resposta.json();
    })
    
.then(function(dados) {
    console.log(dados);
    console.log(dados.results[0].name);

    const resultadosCidades = document.getElementById("resultadosCidades");
    resultadosCidades.replaceChildren();

    dados.results.forEach(function(cidade) {
        console.log(cidade.name);
        console.log(cidade.admin1);
        console.log(cidade.country);
        const estado = cidade.admin1 || "Estado não informado";

        const paragrafoCidade = document.createElement("p");
        paragrafoCidade.textContent = `${cidade.name} - ${estado} - ${cidade.country}`;
        paragrafoCidade.addEventListener("click", function(){
            console.log(cidade.name);
            console.log(cidade.latitude);
            console.log(cidade.longitude);
            const urlClima = `https://api.open-meteo.com/v1/forecast?latitude=${cidade.latitude}&longitude=${cidade.longitude}&current_weather=true`;
            fetch(urlClima).then(function(resposta) {
                return resposta.json();
            }).then(function(dadosClima) {
                console.log(dadosClima);
                console.log(dadosClima.current_weather.temperature);

                const climaAtual = document.getElementById("climaAtual");
               climaAtual.textContent= `Clima atual em ${cidade.name}: ${dadosClima.current_weather.temperature}°C, Velocidade do vento: ${dadosClima.current_weather.windspeed} km/h, Direção do vento: ${dadosClima.current_weather.winddirection}°`;
               const velocidadeVento = dadosClima.current_weather.windspeed;
               console.log(velocidadeVento);
                const temperaturaAtual = dadosClima.current_weather.temperature;
                if (temperaturaAtual < 20) {
                    climaAtual.style.color = "blue";
                } else if (temperaturaAtual >= 20 && temperaturaAtual <= 30) {
                    climaAtual.style.color = "orange";
                } else {
                    climaAtual.style.color = "red";
                };
                const paragrafoTemperatura = document.createElement("p");
            


            
            });
        });
        resultadosCidades.appendChild(paragrafoCidade);
    });

    });

});