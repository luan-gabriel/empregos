const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const JOBS_FILE = path.join(__dirname, "public", "jobs.json");
const OUTPUT_FILE = path.join(__dirname, "public", "index.html");
const TEMPLATE_FILE = path.join(__dirname, "views", "index.ejs");

async function generateStatic() {
  try {
    if (!fs.existsSync(JOBS_FILE)) {
      console.error("jobs.json não encontrado!");
      return;
    }

    const jobsData = fs.readFileSync(JOBS_FILE, "utf-8");
    const jobs = JSON.parse(jobsData);

    // Renderiza o EJS com os dados do jobs.json
    const html = await ejs.renderFile(TEMPLATE_FILE, { jobs }, { async: true });

    fs.writeFileSync(OUTPUT_FILE, html, "utf-8");
    console.log("✅ index.html estático gerado com sucesso!");
  } catch (err) {
    console.error("Erro ao gerar site estático:", err);
  }
}

// Função extra para WhatsApp (mantida)
function gerarMensagemWhatsApp(vagas) {
  const hoje = new Date().toLocaleDateString('pt-BR');
  let mensagem = `🆕 NOVAS VAGAS DISPONÍVEIS HOJE! (Franca/SP) 🚀\n\n`;

  vagas.slice(0, 5).forEach((vaga, index) => {
    mensagem += `${index + 1}️⃣ *${vaga.title}*\n`;
    if (vaga.location) mensagem += `📍 ${vaga.location}\n`;
    if (vaga.contact) mensagem += `📞 ${vaga.contact}\n`;
    if (vaga.email) mensagem += `📧 ${vaga.email}\n`;
    mensagem += `📅 Publicado em: ${hoje}\n`;
    if (vaga.link) mensagem += `🔗 ${vaga.link}\n\n`;
  });

  mensagem += `📲 Para mais vagas acesse: https://016empregos.com.br\n\n`;
  mensagem += `👀 Fique atento! As vagas são atualizadas diariamente!`;

  return mensagem;
}

module.exports = generateStatic;