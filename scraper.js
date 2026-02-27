const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const generateStatic = require("./generateStatic");

const JOBS_FILE = path.join(__dirname, "public", "jobs.json");

async function atualizarVagas() {

  console.log("Buscando vagas...");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://hardfranca.com.br/anuncios.php", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  const jobs = await page.evaluate(() => {

    const jobElements = document.querySelectorAll("#anuncio-dest > div");
    const today = new Date().toISOString();

    return Array.from(jobElements).map((jobEl) => {

      const title =
        jobEl.querySelector(".titulo-anuncio")?.innerText.trim()
        || "Título não disponível";

      const descriptionElement =
        jobEl.querySelector('[style*="line-height:20px"]');

      const description = descriptionElement
        ? descriptionElement.innerText.trim()
        : "Descrição não disponível";

      let email = "";
      let phone = "";

      const emailMatch =
        description.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/);

      if (emailMatch) email = emailMatch[0];

      const phoneMatch =
        description.match(/(\(?\d{2}\)?\s?\d{4,5}-?\d{4})/);

      if (phoneMatch) phone = phoneMatch[0].replace(/\D/g, "");

      return { title, description, email, phone, dateCollected: today };
    });

  });

  await browser.close();

  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
  generateStatic();

  console.log("✅ Vagas atualizadas e site gerado!");
}

atualizarVagas();