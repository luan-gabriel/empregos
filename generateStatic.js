const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

// --- Caminhos ---
const JOBS_FILE = path.join(__dirname, "public", "jobs.json"); // agora dentro de public
const OUTPUT_DIR = path.join(__dirname, "public"); // pasta de saída do HTML

async function generateStatic() {
  try {
    console.log("Gerando HTML estático...");

    let jobs = [];

    // Lê jobs.json gerado pelo server.js
    if (fs.existsSync(JOBS_FILE)) {
      jobs = JSON.parse(fs.readFileSync(JOBS_FILE, "utf-8"));
    }

    // Remove vagas sem descrição válida
    jobs = jobs.filter(job => job.description && job.description !== "Descrição não disponível");

    console.log(`✅ Total de vagas válidas: ${jobs.length}`);

    // Caminho do template EJS
    const indexTemplatePath = path.join(__dirname, "views", "index.ejs");
    const indexTemplate = fs.readFileSync(indexTemplatePath, "utf-8");

    // Renderiza o HTML
    const indexHtml = ejs.render(indexTemplate, { jobs, baseUrl: "/" });

    // Gera o arquivo estático
    fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), indexHtml, "utf-8");

    console.log("✅ HTML gerado com sucesso em /public!");
  } catch (error) {
    console.error("❌ Erro ao gerar o HTML:", error);
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