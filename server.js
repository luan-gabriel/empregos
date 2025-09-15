const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const winston = require("winston");
const cron = require("node-cron");
const generateStatic = require("./generateStatic");

const app = express();
const JOBS_FILE = path.join(__dirname, "jobs.json");

// Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${level}: ${message} {"timestamp":"${timestamp}"}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});

// Configurações do Express
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Servir arquivos estáticos mantendo /public nos links
app.use('/public', express.static(path.join(__dirname, 'public')));

// Página inicial
app.get("/", (req, res) => {
  let jobs = [];
  try {
    if (fs.existsSync(JOBS_FILE)) {
      const data = fs.readFileSync(JOBS_FILE, "utf-8");
      jobs = JSON.parse(data);
    }
  } catch (error) {
    logger.error("Erro ao ler jobs.json: " + error.message);
  }

  res.render("index", { jobs });
});



// Função de scraping que substitui as vagas antigas por novas
async function atualizarVagas() {
  try {
    logger.info("Buscando vagas em minha região...");

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("https://hardfranca.com.br/anuncios.php", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    logger.info("Página carregada com sucesso.");

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll("#anuncio-dest > div");
      const today = new Date().toISOString();
      return Array.from(jobElements).map((jobEl) => {
        const title = jobEl.querySelector(".titulo-anuncio")?.innerText.trim() || "Título não disponível";
        const descriptionElement = jobEl.querySelector('[style*="line-height:20px"]');
        const description = descriptionElement?.innerText.trim() || "Descrição não disponível";
        return { title, description, dateCollected: today };
      });
    });

    logger.info(`Vagas encontradas: ${jobs.length}`);

    if (jobs.length > 0) {
      const filteredJobs = jobs.filter(job => job.description !== "Descrição não disponível");

      // Salva somente as vagas novas, sobrescrevendo o arquivo
      fs.writeFileSync(JOBS_FILE, JSON.stringify(filteredJobs, null, 2));
      logger.info("Vagas salvas com sucesso (substituindo as anteriores).");

      generateStatic(); // Gera HTML estático com as novas vagas
    } else {
      logger.warn("Nenhuma vaga encontrada.");
    }

    await browser.close();
  } catch (error) {
    logger.error("Erro ao buscar vagas: " + error.message);
  }
}

// Agendamento automático diário
cron.schedule(
  "0 9 * * *",
  () => {
    logger.info("Executando atualização diária de vagas...");
    atualizarVagas();
  },
  {
    timezone: "America/Sao_Paulo",
  }
);

// Inicia o servidor e executa scraping ao iniciar
const PORT = 8080;
app.listen(PORT, async () => {
  logger.info(`Servidor rodando em http://localhost:${PORT}`);
  await atualizarVagas(); // Executa o scraping ao iniciar
});