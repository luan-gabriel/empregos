const venom = require("venom-bot");
const fs = require("fs");

// Gera slug baseado no título da vaga
function gerarSlug(texto) {
  return texto
    .normalize("NFD") // remove acentos
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "") // remove pontuação
    .trim()
    .replace(/\s+/g, "-") // troca espaços por hífen
    .toLowerCase();
}

// Gera mensagem com 10 vagas aleatórias
function gerarMensagem() {
  const vagas = JSON.parse(fs.readFileSync("./jobs.json", "utf-8"));

  const aleatorias = vagas.sort(() => 0.5 - Math.random()).slice(0, 10);
  let mensagem = "📢 *Destaques de hoje no Empregos em Franca!*\n\n";

  aleatorias.forEach((vaga) => {
    const titulo = vaga.title || "Vaga sem título";
    const slug = gerarSlug(titulo);
    const link = `https://empregosemfranca.com/vaga/${slug}`;
    mensagem += `🔹 *${titulo}*\n👉 ${link}\n\n`;
  });

  mensagem += "🌐 Veja todas as vagas:\nhttps://empregosemfranca.com";
  return mensagem.trim();
}

// Inicializa e envia a mensagem no WhatsApp
venom
  .create({
    session: 'session-empregos',
    headless: true,
    browserArgs: [
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--use-gl=egl',
      '--disable-dev-shm-usage',
      '--headless=new'
    ],
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  })
  .then((client) => {
    const mensagem = gerarMensagem();

    client
      .sendText("5516991242066@c.us", mensagem)
      .then(() => {
        console.log("✅ Mensagem enviada com sucesso!!");
      })
      .catch((error) => {
        console.error("❌ Erro ao enviar mensagem:", error);
      });
  })
  .catch((error) => {
    console.error("❌ Erro ao iniciar o Venom:", error);
  });