const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const winston = require("winston");
const generateStatic = require("./generateStatic"); // seu generateStatic.js
const app = express();

// --- Caminhos ---
const JOBS_FILE = path.join(__dirname, "public", "jobs.json");

// --- Logger ---
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

// --- Configurações do Express ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- Servir arquivos estáticos ---
app.use(
  "/public",
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".css")) res.setHeader("Content-Type", "text/css");
      if (filePath.endsWith(".js")) res.setHeader("Content-Type", "application/javascript");
    },
  })
);

// --- Página inicial ---
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

// --- Função de scraping ---
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

      // --- Salva jobs.json direto em /public ---
      fs.writeFileSync(JOBS_FILE, JSON.stringify(filteredJobs, null, 2), "utf-8");
      logger.info("Vagas salvas com sucesso em /public (substituindo as anteriores).");

      // --- Gera HTML estático ---
      generateStatic();
    } else {
      logger.warn("Nenhuma vaga encontrada.");
    }

    await browser.close();
  } catch (error) {
    logger.error("Erro ao buscar vagas: " + error.message);
  }
}

// --- Inicia o servidor e executa scraping ao iniciar ---
(async () => {
  await atualizarVagas(); // 1️⃣ Faz o scraping e gera o HTML
  const PORT = process.env.PORT || 8081;
  app.listen(PORT, () => {
    logger.info(`Servidor rodando em http://localhost:${PORT}`);
  });
})();