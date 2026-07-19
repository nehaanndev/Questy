import type { QuestionPack } from "./types";

export const demoPack: QuestionPack = {
  title: "The Watershed Archive",
  summary:
    "A six-question quest grounded in handwritten environmental science notes about toxicology, irrigation, aquifers, and water quality.",
  sourceName: "duenonjan12.pdf",
  topics: ["Toxicology", "Irrigation", "Groundwater", "Water quality"],
  generatedBy: "demo",
  questions: [
    {
      id: "demo-ld50",
      prompt: "What does LD50 describe?",
      choices: [
        "The dose lethal to 50% of a test population",
        "The safe daily dose for 50 years",
        "The dose that affects exactly 50 organs",
        "The amount of toxin removed after 50 minutes"
      ],
      correctIndex: 0,
      explanation:
        "LD50 is the amount of a substance that is lethal to half of a tested population.",
      evidence: {
        pageLabel: "page 1",
        quote: "LD50: amount of substance that is lethal to 50% of a population of animals."
      },
      difficulty: "recall",
      topic: "Toxicology"
    },
    {
      id: "demo-biomagnification",
      prompt: "Why can toxins become more dangerous higher in a food chain?",
      choices: [
        "They become diluted at every trophic level",
        "They accumulate and biomagnify through feeding",
        "Predators convert every toxin into oxygen",
        "Only plants can retain toxic substances"
      ],
      correctIndex: 1,
      explanation:
        "Persistent contaminants accumulate in organisms and can reach higher concentrations in predators.",
      evidence: {
        pageLabel: "page 1",
        quote: "Adverse effects are only seen later because the LD50 is accumulated but only reached here."
      },
      difficulty: "apply",
      topic: "Toxicology"
    },
    {
      id: "demo-irrigation",
      prompt: "Which irrigation method is ranked as the most efficient in the notes?",
      choices: ["Flood", "Furrow", "Spray", "Drip"],
      correctIndex: 3,
      explanation:
        "The notes rank drip irrigation first because it applies water precisely and limits evaporation.",
      evidence: {
        pageLabel: "page 2",
        quote: "Drip (1st): 5% evap. rate, reduced nutrient leaching, no land grading."
      },
      difficulty: "recall",
      topic: "Irrigation"
    },
    {
      id: "demo-flood",
      prompt: "What is one advantage of flood irrigation listed in the notes?",
      choices: [
        "It needs no water source",
        "It is easy and inexpensive",
        "It prevents all soil erosion",
        "It has the lowest evaporation rate"
      ],
      correctIndex: 1,
      explanation:
        "Flood irrigation is simple and inexpensive, but it can waste water and contribute to waterlogging.",
      evidence: {
        pageLabel: "page 2",
        quote: "Flood irrigation pros: easy, $$$, mechanisation required."
      },
      difficulty: "recall",
      topic: "Irrigation"
    },
    {
      id: "demo-ogallala",
      prompt: "What problem does the note associate with the Ogallala Aquifer?",
      choices: [
        "It replenishes faster than it is used",
        "It is used faster than it replenishes",
        "It contains only salt water",
        "It cannot support irrigation"
      ],
      correctIndex: 1,
      explanation:
        "Groundwater depletion occurs when withdrawals exceed the aquifer's recharge rate.",
      evidence: {
        pageLabel: "page 2",
        quote: "Ogallala Aquifer is used faster than replenished."
      },
      difficulty: "apply",
      topic: "Groundwater"
    },
    {
      id: "demo-saltwater",
      prompt: "How can excessive groundwater pumping promote saltwater intrusion?",
      choices: [
        "It raises freshwater pressure at the coast",
        "It lowers freshwater pressure and draws salt water inland",
        "It removes all dissolved salts from seawater",
        "It permanently seals coastal aquifers"
      ],
      correctIndex: 1,
      explanation:
        "Removing too much freshwater lowers its pressure, allowing denser salt water to move into the aquifer.",
      evidence: {
        pageLabel: "page 2",
        quote: "Saltwater intrusion: transition zone seeps salt water through pressure; fresh H2O decrease, injection/smart water usage."
      },
      difficulty: "challenge",
      topic: "Water quality"
    }
  ]
};
