require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:SunAgriPostgres%402026@vofb2ld2j4khsijglshhmzb9:5432/sun_agri_db'
});

const PACK_S = ["1 kg", "3 kg", "5 kg", "25 kg bag"];
const PACK_L = ["250 ml", "500 ml", "1 L", "5 L"];
const PACK_G = ["4 kg", "10 kg", "25 kg bag"];

const p = (o) => {
  const slug = o.name.toLowerCase().replace(/[%+.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return {
    id: slug,
    slug,
    name: o.name,
    category: o.category,
    formulation: o.formulation,
    activeIngredient: o.activeIngredient,
    description: o.description,
    packaging: o.packaging,
    dosage: o.dosage,
    crops: o.crops,
    specs: {
      "Formulation type": o.formulation,
      "Active ingredient": o.activeIngredient,
      ...(o.specs || {})
    },
    upcoming: o.upcoming || false
  };
};

const PRODUCTS = [
  // Sulphur Formulations
  p({ name: "Sulphur 80% WDG", category: "Sulphur Formulations", formulation: "Water Dispersible Granules", activeIngredient: "Sulphur 80% w/w", description: "Our flagship spray-dried granule, made in the 15,000 sq. m WDG unit. Disperses quickly, low dust, controls powdery mildew and mites, and supplies sulphur as a nutrient.", packaging: PACK_S, dosage: "750 g – 1 kg per acre in 200 L water", crops: ["Grapes", "Chilli", "Cumin", "Pea", "Mango"], specs: { "Plant capacity": "9,000 MT per annum", Process: "Sand mill + spray dryer" } }),
  p({ name: "Sulphur 90% Bentonite", category: "Sulphur Formulations", formulation: "Bentonite Granules", activeIngredient: "Sulphur 90% w/w", description: "Bentonite sulphur pastilles for soil application. Releases sulphur slowly for oilseeds, pulses and cereals.", packaging: ["10 kg", "25 kg bag", "50 kg bag"], dosage: "3 – 6 kg per acre as basal dose", crops: ["Mustard", "Groundnut", "Soybean", "Wheat"] }),
  p({ name: "Liquid Sulphur", category: "Sulphur Formulations", formulation: "Suspension Concentrate", activeIngredient: "Sulphur 40% / 55.16% SC", description: "Ready-to-mix liquid sulphur for foliar spray and fertigation. Even coverage with a low dose.", packaging: PACK_L, dosage: "500 ml – 1 L per acre", crops: ["Vegetables", "Cotton", "Onion", "Pulses"] }),
  p({ name: "Sulphur 85% Dusting Powder", category: "Sulphur Formulations", formulation: "Dusting Powder", activeIngredient: "Sulphur 85% w/w", description: "Fine dusting powder for direct application on crops. Made in our DP formulation area with 10,000 MT per year capacity.", packaging: ["1 kg", "5 kg", "25 kg bag"], dosage: "8 – 10 kg per acre", crops: ["Cumin", "Coriander", "Mango", "Vegetables"] }),
  p({ name: "Sulphur 80% WP", category: "Sulphur Formulations", formulation: "Wettable Powder", activeIngredient: "Sulphur 80% w/w", description: "A cost-effective wettable powder that works as a fungicide and miticide.", packaging: PACK_S, dosage: "1 – 1.25 kg per acre", crops: ["Grapes", "Apple", "Peas"] }),
  p({ name: "Sulphur 99% Technical (Imported)", category: "Sulphur Formulations", formulation: "Technical Grade", activeIngredient: "Sulphur 99.99% w/w", description: "Imported technical-grade sulphur for formulators and industrial buyers. We can store 1,500 MT at a time.", packaging: ["50 kg bag", "1 MT jumbo bag"], dosage: "For industrial / formulation use", crops: ["Industrial"] }),
  p({ name: "Lime Sulphur 22% SC", category: "Sulphur Formulations", formulation: "Suspension Concentrate", activeIngredient: "Calcium polysulphide 22%", description: "A classic dormant-season spray for orchards that controls scale, mites and fungal diseases.", packaging: PACK_L, dosage: "As per label recommendation", crops: ["Apple", "Citrus", "Grapes"] }),

  // Insecticides
  p({ name: "Chlorantraniliprole 18.5% SC", category: "Insecticides", formulation: "Suspension Concentrate", activeIngredient: "Chlorantraniliprole 18.5% w/w", description: "Diamide insecticide for lepidopteran pests: stem borer, fruit borer and leaf folder.", packaging: ["10 ml", "30 ml", "60 ml", "150 ml"], dosage: "60 ml per acre", crops: ["Paddy", "Sugarcane", "Tomato", "Cotton"] }),
  p({ name: "Chlorantraniliprole 0.4% GR", category: "Insecticides", formulation: "Granules", activeIngredient: "Chlorantraniliprole 0.4% w/w", description: "Granules for soil and paddy-water application. Protects against stem borer for a long period.", packaging: PACK_G, dosage: "4 kg per acre", crops: ["Paddy", "Sugarcane"] }),
  p({ name: "Imidacloprid 0.3% GR", category: "Insecticides", formulation: "Granules", activeIngredient: "Imidacloprid 0.3% w/w", description: "Systemic granules against sucking and soil pests.", packaging: PACK_G, dosage: "6 – 8 kg per acre", crops: ["Sugarcane", "Paddy", "Groundnut"] }),
  p({ name: "Carbofuran 3% CG", category: "Insecticides", formulation: "Coated Granules", activeIngredient: "Carbofuran 3% w/w", description: "Soil insecticide and nematicide granules.", packaging: PACK_G, dosage: "As per label recommendation", crops: ["Paddy", "Maize", "Sugarcane"] }),
  p({ name: "Chlorpyriphos 1.5% DP", category: "Insecticides", formulation: "Dusting Powder", activeIngredient: "Chlorpyriphos 1.5% w/w", description: "Dusting powder against termites and soil-dwelling pests.", packaging: ["1 kg", "5 kg", "25 kg bag"], dosage: "8 – 10 kg per acre", crops: ["Wheat", "Gram", "Groundnut"] }),
  p({ name: "Cypermethrin 0.25% DP", category: "Insecticides", formulation: "Dusting Powder", activeIngredient: "Cypermethrin 0.25% w/w", description: "Pyrethroid dust that knocks down chewing pests quickly.", packaging: ["1 kg", "5 kg", "25 kg bag"], dosage: "8 – 10 kg per acre", crops: ["Pulses", "Vegetables"] }),
  p({ name: "Fenvalerate 0.4% DP", category: "Insecticides", formulation: "Dusting Powder", activeIngredient: "Fenvalerate 0.4% w/w", description: "Contact and stomach-action dust for field crops.", packaging: ["1 kg", "5 kg", "25 kg bag"], dosage: "8 – 10 kg per acre", crops: ["Cotton", "Pulses"] }),
  p({ name: "Malathion 5% DP", category: "Insecticides", formulation: "Dusting Powder", activeIngredient: "Malathion 5% w/w", description: "Broad-spectrum organophosphate dust for crops and grain protection.", packaging: ["1 kg", "5 kg", "25 kg bag"], dosage: "8 – 10 kg per acre", crops: ["Pulses", "Cereals", "Vegetables"] }),
  p({ name: "Acephate 75% SP", category: "Insecticides", formulation: "Soluble Powder", activeIngredient: "Acephate 75% w/w", description: "Systemic and contact organophosphate insecticide for sucking and chewing pests in field crops.", packaging: ["250 g", "500 g", "1 kg"], dosage: "300 – 400 g per acre", crops: ["Cotton", "Paddy", "Vegetables"] }),
  p({ name: "Cartap Hydrochloride 4% GR", category: "Insecticides", formulation: "Granules", activeIngredient: "Cartap Hydrochloride 4% w/w", description: "Broad-spectrum systemic insecticide for leaf folders and stem borers in paddy.", packaging: PACK_G, dosage: "7.5 – 10 kg per acre", crops: ["Paddy"] }),
  p({ name: "Cartap Hydrochloride 50% SP", category: "Insecticides", formulation: "Soluble Powder", activeIngredient: "Cartap Hydrochloride 50% w/w", description: "Systemic, contact and stomach-acting insecticide for leaf miners and borers.", packaging: ["100 g", "250 g", "500 g", "1 kg"], dosage: "250 – 300 g per acre", crops: ["Paddy", "Vegetables"] }),
  p({ name: "Fipronil 5% SC", category: "Insecticides", formulation: "Suspension Concentrate", activeIngredient: "Fipronil 5% w/w", description: "Modern phenylpyrazole insecticide for diamond back moth, thrips and termites.", packaging: PACK_L, dosage: "400 – 500 ml per acre", crops: ["Paddy", "Cotton", "Chilli", "Sugarcane"] }),
  p({ name: "Fipronil 0.3% GR", category: "Insecticides", formulation: "Granules", activeIngredient: "Fipronil 0.3% w/w", description: "Granular insecticide controlling soil pests and stem borers with root growth stimulation.", packaging: PACK_G, dosage: "7 – 10 kg per acre", crops: ["Paddy", "Sugarcane"] }),
  p({ name: "Profenofos 40% + Cypermethrin 4% EC", category: "Insecticides", formulation: "Emulsifiable Concentrate", activeIngredient: "Profenofos 40% + Cypermethrin 4% EC", description: "Synergistic combination insecticide providing rapid knockdown of bollworms and sucking pests.", packaging: PACK_L, dosage: "400 – 600 ml per acre", crops: ["Cotton", "Soybean", "Vegetables"] }),
  p({ name: "Emamectin Benzoate 5% SG", category: "Insecticides", formulation: "Soluble Granules", activeIngredient: "Emamectin Benzoate 5% w/w", description: "Biological avermectin insecticide for tough caterpillar pests, helicoverpa and spodoptera.", packaging: ["50 g", "100 g", "250 g", "500 g"], dosage: "80 – 100 g per acre", crops: ["Cotton", "Okra", "Cabbage", "Chilli"] }),
  p({ name: "Lambda Cyhalothrin 5% EC", category: "Insecticides", formulation: "Emulsifiable Concentrate", activeIngredient: "Lambda Cyhalothrin 5% EC", description: "Quick-action pyrethroid insecticide for bollworms, leaf folders and borers.", packaging: PACK_L, dosage: "200 – 300 ml per acre", crops: ["Cotton", "Paddy", "Tomato", "Brinjal"] }),

  // Fungicides
  p({ name: "Tebuconazole 10% + Sulphur 65% WG", category: "Fungicides", formulation: "Water Dispersible Granules", activeIngredient: "Tebuconazole 10% + Sulphur 65% w/w", description: "Combination fungicide with systemic and contact action, for powdery mildew and leaf spots.", packaging: ["250 g", "500 g", "1 kg"], dosage: "500 g per acre", crops: ["Chilli", "Soybean", "Grapes"] }),
  p({ name: "Mancozeb 75% WP", category: "Fungicides", formulation: "Wettable Powder", activeIngredient: "Mancozeb 75% w/w", description: "Broad-spectrum protectant dithiocarbamate fungicide for early and late blight.", packaging: PACK_S, dosage: "600 – 800 g per acre", crops: ["Potato", "Tomato", "Wheat", "Grapes"] }),
  p({ name: "Carbendazim 12% + Mancozeb 63% WP", category: "Fungicides", formulation: "Wettable Powder", activeIngredient: "Carbendazim 12% + Mancozeb 63% WP", description: "Dual systemic and contact fungicide for seed treatment and blast, blight and spots control.", packaging: PACK_S, dosage: "500 – 700 g per acre", crops: ["Paddy", "Groundnut", "Chilli"] }),
  p({ name: "Hexaconazole 5% SC", category: "Fungicides", formulation: "Suspension Concentrate", activeIngredient: "Hexaconazole 5% w/w", description: "Systemic triazole fungicide with protective and curative action against sheath blight and powdery mildew.", packaging: PACK_L, dosage: "400 – 500 ml per acre", crops: ["Paddy", "Apple", "Mango", "Chilli"] }),
  p({ name: "Copper Oxychloride 50% WP", category: "Fungicides", formulation: "Wettable Powder", activeIngredient: "Copper Oxychloride 50% w/w", description: "Protective copper fungicide and bactericide for citrus canker, downy mildew and anthracnose.", packaging: PACK_S, dosage: "1 – 1.2 kg per acre", crops: ["Citrus", "Grape", "Cardamom", "Vegetables"] }),

  // Plant Growth Regulators
  p({ name: "Gibberellic Acid 40% WSG", category: "Plant Growth Regulators", formulation: "Water Soluble Granules", activeIngredient: "Gibberellic Acid 40% w/w", description: "Plant growth regulator that improves fruit size, cell elongation and uniform flowering.", packaging: ["1 g", "5 g", "10 g"], dosage: "As per crop schedule", crops: ["Grapes", "Paddy", "Vegetables"] }),
  p({ name: "Triacontanol 0.05% GR", category: "Plant Growth Regulators", formulation: "Granules", activeIngredient: "Triacontanol 0.05% min.", description: "Growth promoter granules that support tillering, root growth and higher yield.", packaging: PACK_G, dosage: "4 – 5 kg per acre", crops: ["Paddy", "Wheat", "Vegetables"] }),
  p({ name: "Triacontanol 0.1% EW", category: "Plant Growth Regulators", formulation: "Emulsion in Water", activeIngredient: "Triacontanol 0.1% min.", description: "Liquid growth regulator emulsion improving photosynthesis, flowering and crop vigor.", packaging: PACK_L, dosage: "200 – 250 ml per acre", crops: ["Cotton", "Chilli", "Tomato", "Paddy"] }),

  // Upcoming Products
  ...[
    "Pyriproxyfen 10% EC|Insecticides",
    "Thiamethoxam 25% WG|Insecticides",
    "Azoxystrobin 23% SC|Fungicides",
    "Tebuconazole 25.9% EC|Fungicides",
    "Captan 70% + Hexaconazole 5% WP|Fungicides",
    "Azoxystrobin 18.2% + Difenoconazole 11.4% SC|Fungicides",
    "Azoxystrobin 11% + Tebuconazole 18.3% SC|Fungicides"
  ].map((s) => {
    const [name, category] = s.split("|");
    return p({
      name,
      category,
      formulation: name.split(" ").pop(),
      activeIngredient: name,
      description: "Coming soon to the Sun Agri Science range. Contact us to book early dealer allocation.",
      packaging: ["To be announced"],
      dosage: "Label pending",
      crops: [],
      upcoming: true
    });
  })
];

async function seed() {
  console.log(`Starting database seed with ${PRODUCTS.length} products...`);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const query = `
      INSERT INTO products (
        id, slug, name, category, formulation, active_ingredient,
        description, packaging, dosage, crops, specs, upcoming
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        formulation = EXCLUDED.formulation,
        active_ingredient = EXCLUDED.active_ingredient,
        description = EXCLUDED.description,
        packaging = EXCLUDED.packaging,
        dosage = EXCLUDED.dosage,
        crops = EXCLUDED.crops,
        specs = EXCLUDED.specs,
        upcoming = EXCLUDED.upcoming;
    `;

    for (const prod of PRODUCTS) {
      await client.query(query, [
        prod.id,
        prod.slug,
        prod.name,
        prod.category,
        prod.formulation,
        prod.activeIngredient,
        prod.description,
        JSON.stringify(prod.packaging),
        prod.dosage,
        JSON.stringify(prod.crops),
        JSON.stringify(prod.specs),
        Boolean(prod.upcoming)
      ]);
      console.log(`✓ Seeded: ${prod.name} (${prod.slug})`);
    }

    await client.query('COMMIT');
    console.log(`\nSuccessfully seeded ${PRODUCTS.length} products into PostgreSQL.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during database seed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
