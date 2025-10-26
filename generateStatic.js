const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

const JOBS_FILE = path.join(__dirname, "jobs.json");
const OUTPUT_DIR = path.join(__dirname, "public");

async function generateStatic() {
  try {
    console.log("Gerando HTML estático...");

    let jobs = [];

    // Lê os três arquivos de vagas
    const autoJobs = fs.existsSync(JOBS_FILE)
      ? JSON.parse(fs.readFileSync(JOBS_FILE, "utf-8")).map(j => ({ ...j, type: "auto" }))
      : [];



    // Mostra no console quantas vagas foram carregadas de cada tipo
    console.log(`✅ Vagas automáticas: ${autoJobs.length}`);
   

    

    // Remove vagas sem descrição
    jobs = jobs.filter(job => job.description && job.description !== "Descrição não disponível");

    // Caminho do template e renderização
    const indexTemplatePath = path.join(__dirname, "views", "index.ejs");
    const indexTemplate = fs.readFileSync(indexTemplatePath, "utf-8");

    const indexHtml = ejs.render(indexTemplate, { jobs, baseUrl: "/" });

    // Gera o arquivo estático
    fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), indexHtml);

    console.log("✅ HTML gerado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao gerar o HTML:", error);
  }
}

// Função extra (mantida)
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