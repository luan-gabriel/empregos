const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');

// Caminho do JSON de vagas
const VAGAS_JSON = path.join(__dirname, 'jobs.json');

// Número pessoal (para testes)
const numeroPessoal = '5516991242066@c.us';

// Inicializa o Venom
venom
  .create({
    session: 'session-whats',
    headless: false, // depois de escanear o QR pode colocar true
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.error('❌ Erro ao iniciar Venom:', erro);
  });

// Função principal
async function start(client) {
  console.log("📦 Lendo vagas...");

  let vagas;
  try {
    vagas = JSON.parse(fs.readFileSync("jobs.json", "utf8")).slice(0, 5); // 5 vagas
  } catch (err) {
    console.error("❌ Erro ao ler vagas:", err);
    return;
  }

  console.log("📝 Formatando mensagem...");

  // Introdução personalizada
  const introducao =
    '📲 Para TODAS as vagas acesse: https://zero16-empregos.onrender.com\n' + 
    'SUA EMPRESA ESTA CONTRATANDO👀????   ENTRE EM CONTATO COM O ADM DO GRUPO 📲📞' +
    '👀 Fique atento! As vagas são atualizadas diariamente!\n' +
    '🆕 *5 VAGAS ADICIONADAS RECENTEMENTE:*\n\n';

  // Mensagem com as 5 vagas
  const mensagemVagas = vagas.map((vaga, i) => {
    const telefoneRegex = /(\(?\d{2}\)?\s?\d{4,5}-?\d{4}|\d{11})/;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

    const contato = vaga.description.match(telefoneRegex)?.[0] || "Não informado";
    const email = vaga.description.match(emailRegex)?.[0] || "Não informado";
    const data = new Date(vaga.dateCollected).toLocaleDateString("pt-BR");

    return `*${vaga.title}*\n📅 Publicado em: ${data}\n📞 Contato: ${contato}\n📧 Email: ${email}\n\n📝 ${vaga.description}`;
  }).join("\n\n");

  const mensagemFinal = introducao + mensagemVagas;

  console.log("📤 Enviando para seu número...");
  await client.sendText(numeroPessoal, mensagemFinal);
  console.log("✅ Mensagem enviada para você com sucesso!");
}