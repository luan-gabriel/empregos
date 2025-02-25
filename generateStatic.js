const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const JOBS_FILE = path.join(__dirname, "jobs.json");
const OUTPUT_DIR = path.join(__dirname, "public");

// Função para gerar o HTML estático
async function generateStatic() {
    try {
        console.log("Gerando HTML estático...");

        // Ler o arquivo jobs.json
        let jobs = [];
        if (fs.existsSync(JOBS_FILE)) {
            const data = fs.readFileSync(JOBS_FILE, "utf-8");
            jobs = JSON.parse(data);
        }

        // Filtrar as vagas com a descrição "Descrição não disponível"
        jobs = jobs.filter(job => job.description !== "Descrição não disponível");

        // Definir o caminho do arquivo HTML gerado
        const outputFilePath = path.join(OUTPUT_DIR, "index.html");

        // Ler o template EJS
        const templatePath = path.join(__dirname, "views", "index.ejs");
        const template = fs.readFileSync(templatePath, "utf-8");

        // Renderizar o HTML com as vagas filtradas
        const html = ejs.render(template, { jobs });

        // Escrever o HTML no arquivo
        fs.writeFileSync(outputFilePath, html);

        console.log("HTML gerado com sucesso!");
    } catch (error) {
        console.error("Erro ao gerar o HTML:", error);
    }
}

module.exports = generateStatic;