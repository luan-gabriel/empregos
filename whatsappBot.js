const venom = require('venom-bot');
const fs = require('fs');
const path = require('path');

// Caminho do JSON de vagas
const VAGAS_JSON = path.join(__dirname, 'jobs.json');

// ID do grupo (caso vá usar futuramente)
//const GROUP_ID = '120363190053885734@g.us';

// Número pessoal (para testes)
const numeroPessoal = '5516991242066@c.us';

// Função que formata a mensagem
function gerarMensagemWhatsApp(vagas) {
  if (!vagas || vagas.length === 0) {
    return '⚠️ Nenhuma vaga disponível no momento.';
  }

  const top5 = vagas.slice(0, 5);
  let mensagem = '🆕 *NOVAS VAGAS DISPONÍVEIS HOJE!* (Franca/SP) 🚀\n\n';

  top5.forEach((vaga, index) => {
    mensagem += `${index + 1}️⃣ *${vaga.titulo}*\n`;
    if (vaga.local) mensagem += `📍 ${vaga.local}\n`;
    if (vaga.contato) mensagem += `📞 ${vaga.contato}\n`;
    if (vaga.email) mensagem += `📧 ${vaga.email}\n`;
    mensagem += `📅 Publicado em: ${vaga.data || vaga.dataPublicacao}\n`;
    mensagem += `🔗 ${vaga.link}\n\n`;
  });

  mensagem += '📲 Para mais vagas acesse: https://zero16-empregos.onrender.com\n';
  mensagem += '👀 Fique atento! As vagas são atualizadas diariamente!';
  return mensagem;
}

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
  
    const mensagemBase = vagas.map((vaga, i) => {
      // Expressões Regulares para extrair contato e email
      const telefoneRegex = /(\(?\d{2}\)?\s?\d{4,5}-?\d{4}|\d{11})/;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  
      const contato = vaga.description.match(telefoneRegex)?.[0] || "Não informado";
      const email = vaga.description.match(emailRegex)?.[0] || "Não informado";
  
      const data = new Date(vaga.dateCollected).toLocaleDateString("pt-BR");
  
      return `*${vaga.title}*\n📅 Publicado em: ${data}\n📞 Contato: ${contato}\n📧 Email: ${email}\n\n📝 ${vaga.description}`;
    }).join("\n\n");
  
    // 🚀 Rodapé com o link do seu site
    const rodape = '\n\n📲 Para mais vagas acesse: https://zero16-empregos.onrender.com\n👀 Fique atento! As vagas são atualizadas diariamente!';
  
    const mensagem = mensagemBase + rodape;
  
    const numeroPessoal = "5516991242066@c.us";
  
    console.log("📤 Enviando para seu número...");
    await client.sendText(numeroPessoal, mensagem);
    console.log("✅ Mensagem enviada para você com sucesso!");
  }