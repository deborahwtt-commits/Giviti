// Seed database with gift suggestions
import { db } from "./db";
import { giftSuggestions } from "@shared/schema";

const suggestions = [
  {
    name: "Kit Café Gourmet Premium",
    description:
      "Conjunto completo com café especial, moedor manual e xícara de porcelana. Perfeito para quem aprecia um bom café.",
    imageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400",
    priceMin: 80,
    priceMax: 150,
    category: "Gastronomia",
    tags: ["café", "gourmet", "cozinha", "adulto"],
  },
  {
    name: "Livro: O Hobbit (Edição Ilustrada)",
    description:
      "Edição especial com ilustrações de capa dura. Ideal para fãs de fantasia e literatura clássica.",
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    priceMin: 60,
    priceMax: 120,
    category: "Livros",
    tags: ["leitura", "fantasia", "literatura", "jovem", "adulto"],
  },
  {
    name: "Conjunto de Aquarela Profissional",
    description:
      "Kit completo com 36 cores, pincéis e papel especial. Ótimo para artistas iniciantes e intermediários.",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400",
    priceMin: 90,
    priceMax: 180,
    category: "Arte",
    tags: ["pintura", "arte", "criativo", "jovem", "adulto"],
  },
  {
    name: "Caixa de Som Bluetooth Portátil",
    description:
      "Som de alta qualidade, resistente à água, bateria de 12 horas. Ideal para festas e viagens.",
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
    priceMin: 150,
    priceMax: 300,
    category: "Eletrônicos",
    tags: ["música", "tecnologia", "portátil", "jovem", "adulto"],
  },
  {
    name: "Kit Skincare Completo",
    description:
      "Rotina completa de cuidados com a pele: limpador, tônico, sérum e hidratante. Produtos naturais.",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
    priceMin: 120,
    priceMax: 250,
    category: "Beleza",
    tags: ["beleza", "autocuidado", "cosméticos", "mulher", "adulto"],
  },
  {
    name: "Jogo de Tabuleiro: Ticket to Ride",
    description:
      "Jogo estratégico de trens para 2-5 jogadores. Diversão garantida para toda a família.",
    imageUrl: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400",
    priceMin: 180,
    priceMax: 280,
    category: "Jogos",
    tags: ["jogos", "estratégia", "família", "diversão", "jovem", "adulto"],
  },
  {
    name: "Kit Jardinagem Urbana",
    description:
      "Conjunto com vasos, sementes orgânicas, terra e ferramentas. Perfeito para quem quer cultivar em casa.",
    imageUrl: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400",
    priceMin: 70,
    priceMax: 150,
    category: "Casa & Jardim",
    tags: ["plantas", "jardinagem", "sustentável", "adulto"],
  },
  {
    name: "Fone de Ouvido com Cancelamento de Ruído",
    description:
      "Tecnologia premium de cancelamento de ruído, bluetooth 5.0, bateria de 30 horas.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    priceMin: 250,
    priceMax: 500,
    category: "Eletrônicos",
    tags: ["música", "tecnologia", "áudio", "jovem", "adulto"],
  },
  {
    name: "Voucher Experiência: Aula de Culinária",
    description:
      "Aula particular com chef profissional. Escolha entre massas italianas, sushi ou confeitaria.",
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400",
    priceMin: 200,
    priceMax: 400,
    category: "Experiências",
    tags: ["culinária", "experiência", "aprendizado", "adulto"],
  },
  {
    name: "Tênis de Corrida Profissional",
    description:
      "Tecnologia de amortecimento avançada, leve e respirável. Ideal para corredores sérios.",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    priceMin: 300,
    priceMax: 600,
    category: "Esportes",
    tags: ["corrida", "esporte", "fitness", "ativo", "jovem", "adulto"],
  },
  {
    name: "Kit LEGO Creator Expert",
    description:
      "Conjunto com 2000+ peças para construir modelos detalhados. Diversão e desafio para todas as idades.",
    imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400",
    priceMin: 350,
    priceMax: 700,
    category: "Brinquedos",
    tags: ["construção", "criativo", "hobby", "criança", "jovem", "adulto"],
  },
  {
    name: "Perfume Importado 100ml",
    description:
      "Fragrância sofisticada e duradoura. Embalagem premium, ideal para presentes especiais.",
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
    priceMin: 200,
    priceMax: 450,
    category: "Perfumaria",
    tags: ["perfume", "luxo", "elegância", "adulto"],
  },
  {
    name: "Mochila de Trilha 40L",
    description:
      "Resistente à água, compartimentos organizados, alças ergonômicas. Perfeita para aventureiros.",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    priceMin: 180,
    priceMax: 350,
    category: "Esportes",
    tags: ["aventura", "trilha", "viagem", "outdoor", "jovem", "adulto"],
  },
  {
    name: "Kit Churrasco Premium",
    description:
      "Conjunto com facas profissionais, espetos inox e avental personalizado. Para mestres churrasqueiros.",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
    priceMin: 150,
    priceMax: 300,
    category: "Casa & Cozinha",
    tags: ["churrasco", "culinária", "homem", "adulto"],
  },
  {
    name: "Relógio Smartwatch Fitness",
    description:
      "Monitor cardíaco, GPS, à prova d'água, bateria de 7 dias. Acompanha sua saúde 24/7.",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    priceMin: 400,
    priceMax: 800,
    category: "Tecnologia",
    tags: ["fitness", "tecnologia", "saúde", "esporte", "jovem", "adulto"],
  },
  {
    name: "Globo Terrestre Iluminado 30cm",
    description:
      "Decorativo e educativo, base de madeira, iluminação LED. Perfeito para curiosos e viajantes.",
    imageUrl: "https://images.unsplash.com/photo-1569163139394-de4798aa62b5?w=400",
    priceMin: 100,
    priceMax: 200,
    category: "Decoração",
    tags: ["decoração", "educação", "viagem", "geografia", "jovem", "adulto"],
  },
  {
    name: "Cesta de Chocolates Finos",
    description:
      "Seleção de chocolates belgas e suíços premium. Embalagem elegante, ideal para ocasiões especiais.",
    imageUrl: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400",
    priceMin: 80,
    priceMax: 200,
    category: "Gastronomia",
    tags: ["chocolate", "doce", "gourmet", "luxo", "adulto"],
  },
  {
    name: "Tapete de Yoga Premium + Bloco",
    description:
      "Antiderrapante, ecológico, extra confortável. Inclui bloco de apoio e bolsa de transporte.",
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
    priceMin: 120,
    priceMax: 250,
    category: "Esportes",
    tags: ["yoga", "fitness", "bem-estar", "meditação", "adulto"],
  },
  {
    name: "Kit Vinho + Taças Cristal",
    description:
      "Vinho tinto premium + par de taças de cristal. Apresentação elegante em caixa de madeira.",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400",
    priceMin: 150,
    priceMax: 350,
    category: "Bebidas",
    tags: ["vinho", "bebida", "elegante", "adulto", "luxo"],
  },
  {
    name: "Câmera Instantânea Polaroid",
    description:
      "Fotos instantâneas coloridas, modo selfie, flash automático. Diversão retrô garantida!",
    imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400",
    priceMin: 300,
    priceMax: 500,
    category: "Fotografia",
    tags: ["fotografia", "diversão", "criativo", "jovem", "adulto"],
  },
];

async function seed() {
  try {
    console.log("Seeding gift suggestions...");
    
    for (const suggestion of suggestions) {
      await db.insert(giftSuggestions).values(suggestion).onConflictDoNothing();
    }
    
    console.log(`✓ Successfully seeded ${suggestions.length} gift suggestions!`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed();
