import { db } from "./db";
import { signos, mensagensSemanais } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";

const signosData = [
  { nome: "Aries", diaInicio: 21, mesInicio: 3, diaFim: 19, mesFim: 4, emoji: "♈" },
  { nome: "Touro", diaInicio: 20, mesInicio: 4, diaFim: 20, mesFim: 5, emoji: "♉" },
  { nome: "Gemeos", diaInicio: 21, mesInicio: 5, diaFim: 20, mesFim: 6, emoji: "♊" },
  { nome: "Cancer", diaInicio: 21, mesInicio: 6, diaFim: 22, mesFim: 7, emoji: "♋" },
  { nome: "Leao", diaInicio: 23, mesInicio: 7, diaFim: 22, mesFim: 8, emoji: "♌" },
  { nome: "Virgem", diaInicio: 23, mesInicio: 8, diaFim: 22, mesFim: 9, emoji: "♍" },
  { nome: "Libra", diaInicio: 23, mesInicio: 9, diaFim: 22, mesFim: 10, emoji: "♎" },
  { nome: "Escorpiao", diaInicio: 23, mesInicio: 10, diaFim: 21, mesFim: 11, emoji: "♏" },
  { nome: "Sagitario", diaInicio: 22, mesInicio: 11, diaFim: 21, mesFim: 12, emoji: "♐" },
  { nome: "Capricornio", diaInicio: 22, mesInicio: 12, diaFim: 19, mesFim: 1, emoji: "♑" },
  { nome: "Aquario", diaInicio: 20, mesInicio: 1, diaFim: 18, mesFim: 2, emoji: "♒" },
  { nome: "Peixes", diaInicio: 19, mesInicio: 2, diaFim: 20, mesFim: 3, emoji: "♓" },
];

function normalizeSignoName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function seedSignos() {
  console.log("Seeding signos...");
  
  const insertedSignos: Record<string, string> = {};
  
  for (const signo of signosData) {
    const [inserted] = await db
      .insert(signos)
      .values(signo)
      .onConflictDoUpdate({
        target: signos.nome,
        set: {
          diaInicio: signo.diaInicio,
          mesInicio: signo.mesInicio,
          diaFim: signo.diaFim,
          mesFim: signo.mesFim,
          emoji: signo.emoji,
        },
      })
      .returning();
    
    insertedSignos[normalizeSignoName(signo.nome)] = inserted.id;
    console.log(`Inserted/Updated signo: ${signo.nome} (${inserted.id})`);
  }
  
  return insertedSignos;
}

async function importMensagens(signoIdMap: Record<string, string>) {
  console.log("Importing mensagens semanais...");
  
  const csvPath = path.join(process.cwd(), "attached_assets", "signos_mensagens_1765463465912.csv");
  
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found at:", csvPath);
    return;
  }
  
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n").slice(1);
  
  let imported = 0;
  let errors = 0;
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const parts = line.split(";");
    if (parts.length < 3) {
      console.warn("Skipping invalid line:", line);
      errors++;
      continue;
    }
    
    const signoNome = normalizeSignoName(parts[0]);
    const numeroSemana = parseInt(parts[1], 10);
    const mensagem = parts.slice(2).join(";").trim();
    
    const signoId = signoIdMap[signoNome];
    
    if (!signoId) {
      console.warn(`Signo not found: "${parts[0]}" (normalized: "${signoNome}")`);
      errors++;
      continue;
    }
    
    if (isNaN(numeroSemana) || numeroSemana < 1 || numeroSemana > 52) {
      console.warn(`Invalid week number: ${parts[1]}`);
      errors++;
      continue;
    }
    
    try {
      await db
        .insert(mensagensSemanais)
        .values({
          signoId,
          numeroSemana,
          mensagem,
        })
        .onConflictDoNothing();
      
      imported++;
    } catch (error) {
      console.error("Error inserting message:", error);
      errors++;
    }
  }
  
  console.log(`Imported ${imported} messages, ${errors} errors`);
}

async function main() {
  try {
    const signoIdMap = await seedSignos();
    await importMensagens(signoIdMap);
    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

main();
