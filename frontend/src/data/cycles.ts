import { Atom, Leaf, Droplets, Flame, Wind, Zap } from "lucide-react";

export interface CycleData {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
  icon: React.ElementType;
  color: string;
  steps: {
    title: string;
    description: string;
    detail: string;
    memoryTrick?: string;
  }[];
  videoUrl?: string;
  quickFacts: { label: string; value: string }[];
}

export const categories = [
  "All",
  "Cellular",
  "Ecological",
  "Biochemical",
  "Environmental",
];

export const cyclesData: CycleData[] = [
  {
    id: "1",
    title: "Krebs Cycle",
    slug: "krebs-cycle",
    description:
      "The central metabolic pathway that oxidizes acetyl-CoA to CO₂ and generates energy carriers NADH, FADH₂, and GTP.",
    category: "Cellular",
    difficulty: "Advanced",
    tags: ["Metabolism", "Energy", "Mitochondria"],
    icon: Flame,
    color: "emerald",
    quickFacts: [
      { label: "Location", value: "Mitochondrial Matrix" },
      { label: "Inputs", value: "Acetyl-CoA, NAD⁺, FAD" },
      { label: "Outputs", value: "CO₂, NADH, FADH₂, GTP" },
      { label: "Discovered", value: "1937 by Hans Krebs" },
    ],
    videoUrl: "https://www.youtube.com/embed/juM2ROSLWfw",
    steps: [
      {
        title: "Acetyl-CoA + Oxaloacetate → Citrate",
        description: "The cycle begins when acetyl-CoA combines with oxaloacetate.",
        detail:
          "Citrate synthase catalyzes the condensation of the 2-carbon acetyl group with the 4-carbon oxaloacetate to form the 6-carbon citrate. This is an irreversible step and a key regulatory point of the cycle.",
      },
      {
        title: "Citrate → Isocitrate",
        description: "Citrate is isomerized to isocitrate via aconitase.",
        detail:
          "Aconitase catalyzes the reversible transformation of citrate to isocitrate through a dehydration/hydration reaction, with cis-aconitate as an intermediate.",
      },
      {
        title: "Isocitrate → α-Ketoglutarate",
        description: "First oxidative decarboxylation releases CO₂ and produces NADH.",
        detail:
          "Isocitrate dehydrogenase oxidizes isocitrate, producing the first NADH and releasing the first CO₂. This is another key regulatory step, activated by ADP and inhibited by ATP and NADH.",
      },
      {
        title: "α-Ketoglutarate → Succinyl-CoA",
        description: "Second oxidative decarboxylation releases another CO₂.",
        detail:
          "The α-ketoglutarate dehydrogenase complex catalyzes this reaction, producing the second NADH and CO₂. This multi-enzyme complex is similar to the pyruvate dehydrogenase complex.",
      },
      {
        title: "Succinyl-CoA → Succinate",
        description: "Substrate-level phosphorylation produces GTP.",
        detail:
          "Succinyl-CoA synthetase cleaves the high-energy thioester bond, using the released energy to phosphorylate GDP to GTP (or ADP to ATP in some organisms).",
      },
      {
        title: "Succinate → Fumarate",
        description: "FAD-linked oxidation produces FADH₂.",
        detail:
          "Succinate dehydrogenase (Complex II of the electron transport chain) oxidizes succinate to fumarate, reducing FAD to FADH₂. This is the only enzyme embedded in the inner mitochondrial membrane.",
      },
      {
        title: "Fumarate → Malate",
        description: "Hydration of fumarate forms malate.",
        detail:
          "Fumarase catalyzes the stereospecific hydration of the trans double bond of fumarate to form L-malate.",
      },
      {
        title: "Malate → Oxaloacetate",
        description: "Final oxidation regenerates oxaloacetate and produces NADH.",
        detail:
          "Malate dehydrogenase oxidizes malate to regenerate oxaloacetate, producing the third NADH. The cycle is now ready to accept another acetyl-CoA.",
      },
    ],
  },
  {
    id: "2",
    title: "Photosynthesis",
    slug: "photosynthesis",
    description:
      "The process by which green plants convert light energy into chemical energy, producing glucose and oxygen from CO₂ and water.",
    category: "Cellular",
    difficulty: "Intermediate",
    tags: ["Light", "Plants", "Chloroplast"],
    icon: Leaf,
    color: "emerald",
    quickFacts: [
      { label: "Location", value: "Chloroplast" },
      { label: "Inputs", value: "CO₂, H₂O, Light" },
      { label: "Outputs", value: "Glucose, O₂" },
      { label: "Type", value: "Anabolic" },
    ],
    videoUrl: "https://www.youtube.com/embed/sQK3Yr4Sc_k",
    steps: [
      {
        title: "Light Absorption",
        description: "Chlorophyll absorbs light energy in the thylakoid membrane.",
        detail: "Photosystem II absorbs light at 680nm, exciting electrons to a higher energy state.",
      },
      {
        title: "Water Splitting (Photolysis)",
        description: "Water molecules are split, releasing O₂ and H⁺ ions.",
        detail: "The oxygen-evolving complex splits 2H₂O into O₂, 4H⁺, and 4 electrons.",
      },
      {
        title: "Electron Transport Chain",
        description: "Excited electrons pass through carriers, generating ATP.",
        detail: "Electrons flow through plastoquinone, cytochrome b6f, and plastocyanin, pumping H⁺ for ATP synthesis.",
      },
      {
        title: "Calvin Cycle",
        description: "CO₂ is fixed into glucose using ATP and NADPH.",
        detail: "RuBisCO fixes CO₂ to RuBP, which is then reduced to G3P using ATP and NADPH from light reactions.",
      },
    ],
  },
  {
    id: "3",
    title: "Nitrogen Cycle",
    slug: "nitrogen-cycle",
    description:
      "The biogeochemical cycle that transforms nitrogen through fixation, nitrification, assimilation, ammonification, and denitrification.",
    category: "Ecological",
    difficulty: "Intermediate",
    tags: ["Ecosystem", "Bacteria", "Soil"],
    icon: Wind,
    color: "cyan",
    quickFacts: [
      { label: "Scope", value: "Global Biogeochemical" },
      { label: "Key Organisms", value: "Rhizobium, Nitrosomonas" },
      { label: "Atmosphere N₂", value: "78%" },
      { label: "Importance", value: "Protein Synthesis" },
    ],
    steps: [
      {
        title: "Nitrogen Fixation",
        description: "Atmospheric N₂ is converted to ammonia (NH₃) by bacteria.",
        detail: "Rhizobium bacteria in root nodules of legumes fix N₂ using nitrogenase enzyme.",
      },
      {
        title: "Nitrification",
        description: "Ammonia is oxidized to nitrites and then nitrates.",
        detail: "Nitrosomonas converts NH₃ to NO₂⁻, then Nitrobacter converts NO₂⁻ to NO₃⁻.",
      },
      {
        title: "Assimilation",
        description: "Plants absorb nitrates and incorporate nitrogen into organic molecules.",
        detail: "Plants take up NO₃⁻ through roots and use it to synthesize amino acids and nucleotides.",
      },
      {
        title: "Denitrification",
        description: "Bacteria convert nitrates back to atmospheric N₂.",
        detail: "Anaerobic bacteria like Pseudomonas reduce NO₃⁻ back to N₂ gas, completing the cycle.",
      },
    ],
  },
  {
    id: "4",
    title: "Water Cycle",
    slug: "water-cycle",
    description:
      "The continuous movement of water through evaporation, condensation, precipitation, and collection across Earth's systems.",
    category: "Environmental",
    difficulty: "Beginner",
    tags: ["Climate", "Evaporation", "Rain"],
    icon: Droplets,
    color: "cyan",
    quickFacts: [
      { label: "Scope", value: "Global" },
      { label: "Driven By", value: "Solar Energy" },
      { label: "Earth's Water", value: "97% Saltwater" },
      { label: "Freshwater", value: "3% Total" },
    ],
    steps: [
      {
        title: "Evaporation",
        description: "Water from oceans, lakes evaporates into the atmosphere.",
        detail: "Solar energy heats surface water, converting it to water vapor that rises into the atmosphere.",
      },
      {
        title: "Condensation",
        description: "Water vapor cools and forms clouds.",
        detail: "As water vapor rises and cools, it condenses around dust particles to form tiny droplets, creating clouds.",
      },
      {
        title: "Precipitation",
        description: "Water falls back to Earth as rain, snow, or hail.",
        detail: "When cloud droplets combine and become heavy enough, they fall as precipitation.",
      },
      {
        title: "Collection",
        description: "Water collects in oceans, rivers, and groundwater.",
        detail: "Precipitation either runs off into bodies of water or infiltrates into the ground, recharging aquifers.",
      },
    ],
  },
  {
    id: "5",
    title: "Carbon Cycle",
    slug: "carbon-cycle",
    description:
      "The biogeochemical cycle by which carbon is exchanged among the biosphere, atmosphere, oceans, and geosphere.",
    category: "Environmental",
    difficulty: "Intermediate",
    tags: ["CO₂", "Climate", "Fossil Fuels"],
    icon: Atom,
    color: "emerald",
    quickFacts: [
      { label: "Scope", value: "Global Biogeochemical" },
      { label: "Atmospheric CO₂", value: "~420 ppm" },
      { label: "Largest Reservoir", value: "Oceans" },
      { label: "Concern", value: "Climate Change" },
    ],
    steps: [
      {
        title: "Photosynthesis",
        description: "Plants absorb CO₂ and convert it to organic carbon.",
        detail: "Autotrophs use sunlight to fix atmospheric CO₂ into glucose and other organic compounds.",
      },
      {
        title: "Respiration",
        description: "Organisms release CO₂ back to the atmosphere.",
        detail: "All living organisms break down organic molecules through cellular respiration, releasing CO₂.",
      },
      {
        title: "Decomposition",
        description: "Dead organisms are broken down, releasing carbon.",
        detail: "Decomposers break down dead organic matter, returning carbon to soil and atmosphere.",
      },
      {
        title: "Combustion & Fossil Fuels",
        description: "Burning fossil fuels releases stored carbon as CO₂.",
        detail: "Human activities release ancient carbon stored in fossil fuels, contributing to atmospheric CO₂ increase.",
      },
    ],
  },
  {
    id: "6",
    title: "ATP Synthesis",
    slug: "atp-synthesis",
    description:
      "The process of generating ATP through oxidative phosphorylation in the electron transport chain of mitochondria.",
    category: "Biochemical",
    difficulty: "Advanced",
    tags: ["Energy", "ETC", "Mitochondria"],
    icon: Zap,
    color: "cyan",
    quickFacts: [
      { label: "Location", value: "Inner Mitochondrial Membrane" },
      { label: "Enzyme", value: "ATP Synthase" },
      { label: "Yield", value: "~34 ATP/glucose" },
      { label: "Process", value: "Chemiosmosis" },
    ],
    steps: [
      {
        title: "NADH/FADH₂ Donation",
        description: "Electron carriers donate electrons to Complex I/II.",
        detail: "NADH donates electrons at Complex I, FADH₂ at Complex II of the electron transport chain.",
      },
      {
        title: "Electron Transport",
        description: "Electrons flow through complexes, pumping H⁺ ions.",
        detail: "Electrons pass through Complexes I→III→IV, with each complex pumping H⁺ from matrix to intermembrane space.",
      },
      {
        title: "Proton Gradient",
        description: "A proton gradient builds across the inner membrane.",
        detail: "The accumulated H⁺ ions create an electrochemical gradient (proton-motive force) across the membrane.",
      },
      {
        title: "ATP Synthase",
        description: "H⁺ ions flow through ATP synthase, driving ATP production.",
        detail: "H⁺ flows down its gradient through ATP synthase, causing the rotor to spin and catalyze ADP + Pi → ATP.",
      },
    ],
  },
];

export const getCycleBySlug = (slug: string) =>
  cyclesData.find((c) => c.slug === slug);
