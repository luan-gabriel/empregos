async function carregarVagas() {
    const response = await fetch('/api/jobs');
    const vagas = await response.json();
    const vagasDiv = document.getElementById('vagas');

    vagasDiv.innerHTML = vagas.length ? 
        vagas.map(vaga => `<div class="vaga"><a href="${vaga.link}" target="_blank">${vaga.title}</a></div>`).join('') 
        : "<p>Nenhuma vaga disponível no momento.</p>";
}

carregarVagas();