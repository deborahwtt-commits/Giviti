import { db } from "./db";
import { googleProductCategories, giftCategories } from "@shared/schema";
import { eq } from "drizzle-orm";

const googleCategories = [
  { id: 1, nameEn: "Animals & Pet Supplies", namePtBr: "Animais e Suprimentos para Pets" },
  { id: 166, nameEn: "Apparel & Accessories", namePtBr: "Roupas e Acessórios" },
  { id: 8, nameEn: "Arts & Entertainment", namePtBr: "Artes e Entretenimento" },
  { id: 537, nameEn: "Baby & Toddler", namePtBr: "Bebê e Infantil" },
  { id: 111, nameEn: "Business & Industrial", namePtBr: "Negócios e Indústria" },
  { id: 141, nameEn: "Cameras & Optics", namePtBr: "Câmeras e Óptica" },
  { id: 222, nameEn: "Electronics", namePtBr: "Eletrônicos" },
  { id: 412, nameEn: "Food, Beverages & Tobacco", namePtBr: "Alimentos, Bebidas e Tabaco" },
  { id: 436, nameEn: "Furniture", namePtBr: "Móveis" },
  { id: 632, nameEn: "Hardware", namePtBr: "Ferramentas e Hardware" },
  { id: 469, nameEn: "Health & Beauty", namePtBr: "Saúde e Beleza" },
  { id: 536, nameEn: "Home & Garden", namePtBr: "Casa e Jardim" },
  { id: 5181, nameEn: "Luggage & Bags", namePtBr: "Malas e Bolsas" },
  { id: 772, nameEn: "Mature", namePtBr: "Conteúdo Adulto" },
  { id: 783, nameEn: "Media", namePtBr: "Mídia" },
  { id: 922, nameEn: "Office Supplies", namePtBr: "Material de Escritório" },
  { id: 5605, nameEn: "Religious & Ceremonial", namePtBr: "Religioso e Cerimonial" },
  { id: 2092, nameEn: "Software", namePtBr: "Software" },
  { id: 988, nameEn: "Sporting Goods", namePtBr: "Esportes e Lazer" },
  { id: 1239, nameEn: "Toys & Games", namePtBr: "Brinquedos e Jogos" },
  { id: 888, nameEn: "Vehicles & Parts", namePtBr: "Veículos e Peças" },
];

const categoryMappings: { [key: string]: number } = {
  "Beleza": 469,
  "Casa": 536,
  "Livros": 783,
  "Tecnologia": 222,
  "Vestuário": 166,
  "Casa & Cozinha": 536,
  "Casa & Jardim": 536,
  "Eletrônicos": 222,
  "Arte": 8,
  "Brinquedos": 1239,
  "Esportes": 988,
  "Jogos": 1239,
  "Gastronomia": 412,
  "Bebidas": 412,
  "Perfumaria": 469,
  "Decoração": 536,
  "Experiências": 8,
  "Fotografia": 141,
};

async function seedGoogleCategories() {
  try {
    console.log("Seeding Google Product Categories...");
    
    for (const category of googleCategories) {
      await db.insert(googleProductCategories)
        .values(category)
        .onConflictDoNothing();
    }
    
    console.log(`✓ Successfully seeded ${googleCategories.length} Google categories!`);
    
    console.log("Updating existing gift categories with Google category IDs...");
    
    const existingCategories = await db.select().from(giftCategories);
    let updatedCount = 0;
    
    for (const cat of existingCategories) {
      const googleId = categoryMappings[cat.name];
      if (googleId) {
        await db.update(giftCategories)
          .set({ googleCategoryId: googleId })
          .where(eq(giftCategories.id, cat.id));
        updatedCount++;
        console.log(`  - Updated "${cat.name}" → Google ID ${googleId}`);
      }
    }
    
    console.log(`✓ Updated ${updatedCount} gift categories with Google IDs!`);
    
  } catch (error) {
    console.error("Error seeding Google categories:", error);
    throw error;
  }
}

seedGoogleCategories();
