// update.js
const fs = require("fs");

// Aqui você importa ou executa sua função que gera jobs.json
// Exemplo simples (substitua pela lógica real que já está no server.js)
const jobs = [
  { title: "Vaga Exemplo", company: "Empresa X", location: "Franca-SP" }
];

// Salva o arquivo atualizado
fs.writeFileSync("jobs.json", JSON.stringify(jobs, null, 2), "utf-8");

console.log("jobs.json atualizado com sucesso!");
