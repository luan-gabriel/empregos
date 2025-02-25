const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const winston = require("winston");
const generateStatic = require("./generateStatic"); // Importar a função generateStatic

// Arquivo de vagas
const JOBS_FILE = path.join(__dirname, "jobs.json");

// Configuração do logger
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

// Inicializar o Express
const app = express();

// Configurar o EJS como template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rota principal
app.get("/", (req, res) => {
    let jobs = [];
    try {
        if (fs.existsSync(JOBS_FILE)) {
            const data = fs.readFileSync(JOBS_FILE, "utf-8");
            jobs = JSON.parse(data);
        }
    } catch (error) {
        logger.error("Erro ao ler o arquivo jobs.json: " + error.message);
    }

    res.render("index", { jobs });
});

// Função para buscar vagas no Hard Franca
async function fetchJobs() {
    try {
        logger.info("Buscando vagas em minha região...");

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto("https://hardfranca.com.br/anuncios.php", {
            waitUntil: "networkidle2",
            timeout: 60000,
        });

        logger.info("Página carregada com sucesso.");

        // Selecionar os anúncios
        const selector = "#anuncio-dest";
        await page.waitForSelector(selector, { timeout: 30000 });

        const jobs = await page.evaluate(() => {
            const jobElements = document.querySelectorAll("#anuncio-dest > div");
            return Array.from(jobElements).map(jobEl => {
                const title = jobEl.querySelector(".titulo-anuncio")?.innerText.trim() || "Título não disponível";
                const descriptionElement = jobEl.querySelector('[style*="line-height:20px"]');
                const description = descriptionElement?.innerText.trim() || "Descrição não disponível";

                return { title, description };
            });
        });

        logger.info(`Vagas encontradas: ${jobs.length}`);

        if (jobs.length > 0) {
            // Filtrar as vagas para remover as com descrição "Descrição não disponível"
            const filteredJobs = jobs.filter(job => job.description !== "Descrição não disponível");

            // Carregar vagas existentes do arquivo para evitar duplicatas
            let existingJobs = [];
            try {
                if (fs.existsSync(JOBS_FILE)) {
                    const data = fs.readFileSync(JOBS_FILE, "utf-8");
                    existingJobs = JSON.parse(data);
                }
            } catch (error) {
                logger.error("Erro ao ler o arquivo jobs.json: " + error.message);
            }

            // Filtrar as vagas duplicadas com base no título
            const updatedJobs = [...existingJobs, ...filteredJobs].filter((job, index, self) =>
                index === self.findIndex((t) => t.title === job.title)
            );

            // Escrever as vagas no arquivo jobs.json
            fs.writeFileSync(JOBS_FILE, JSON.stringify(updatedJobs, null, 2));
            logger.info("Vagas atualizadas com sucesso!");

            // Gerar o HTML estático
            generateStatic(); // Chama a função para gerar o HTML estático

        } else {
            logger.warn("Nenhuma vaga encontrada no site.");
        }

        await browser.close();
    } catch (error) {
        logger.error("Erro ao buscar vagas: " + error.message);
    }
}

// Agendamento diário para buscar vagas
fetchJobs(); // Executar ao iniciar o servidor

// Iniciar o servidor
const PORT = 8080;
app.listen(PORT, () => {
    logger.info(`Servidor rodando em http://localhost:${PORT}`);
});