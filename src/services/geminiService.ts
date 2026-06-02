import { GoogleGenAI, Type } from "@google/genai";
import { FamilyMealPlanResponse, FamilyMember } from "../types.ts";

export async function generateFamilyMealPlan(
  members: FamilyMember[],
  ingredients: string[],
  apiKey?: string
): Promise<FamilyMealPlanResponse> {
  const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
  
  if (!finalApiKey) {
    throw new Error("Gemini API Key is missing. Please provide one in the settings.");
  }

  const ai = new GoogleGenAI({ apiKey: finalApiKey });
  const prompt = `
    Generate a full-day high-protein Indian family meal plan based on the following members:
    ${members.map((m, i) => `${i + 1}. ${m.name} - Age: ${m.age}, Weight: ${m.weight}kg, Height: ${m.height}cm, Activity: ${m.activity}`).join("\n")}
    
    Diet Type: Vegetarian (High Protein Indian)

    AVAILABLE INGREDIENTS:
    ${ingredients.join(", ")}

    Logic Assumption: Presume that common Indian kitchen spices (Haldi, Meere, Jira, Dhaniya, etc.), vegetables (Aloo, Pyaz, Tamatar), oils/ghee, pulses (variety of Dals), and Atta (whole wheat flour) are ALWAYS available in an Indian kitchen. 
    Focus on creating balanced meals using these staples + the specific available ingredients listed above.
    You may introduce up to 2 additional ingredients ONLY if required for protein. Mark them as (extra).

    Follow these rules:
    - Prioritize high-protein vegan Indian foods (dal, chana, rajma, soy chunks, tofu, peanuts).
    - LANGUAGE: Always use HINGLISH for dish names, ingredients, reasons, and recipe steps.
    - INGREDIENTS: Use Romanized Hindi names for all dish names and ingredients (e.g., "Pyaz" instead of "Onion", "Aloo" instead of "Potato").
    - RECIPE STEPS: Write steps in clear Hinglish (e.g., "Kadhai mein tel garam karein", "Sare ingredients ko achhe se mix karein").
    - PORTIONS: Keep portions description in English for clarity (e.g., "1 piece", "50g").
    - Keep recipes SAME for the whole family, but adjust PORTIONS (quantities) individually for each member based on their needs.
    - Provide EXACTLY 3 dish options for each meal (breakfast, lunch, snack, dinner).
    - Provide simple recipe steps (max 5 steps).
    - Strictly return valid JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["members", "meals", "summary"],
        properties: {
          members: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["name", "requirements"],
              properties: {
                name: { type: Type.STRING },
                requirements: {
                  type: Type.OBJECT,
                  required: ["calories", "protein_g", "carbs_g", "fats_g", "water_liters"],
                  properties: {
                    calories: { type: Type.STRING },
                    protein_g: { type: Type.STRING },
                    carbs_g: { type: Type.STRING },
                    fats_g: { type: Type.STRING },
                    water_liters: { type: Type.STRING },
                  },
                },
              },
            },
          },
          meals: {
            type: Type.OBJECT,
            required: ["breakfast", "lunch", "snack", "dinner"],
            properties: {
              breakfast: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  required: ["name", "prep_time_min", "reason", "portions", "recipe"],
                  properties: {
                    name: { type: Type.STRING },
                    prep_time_min: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    portions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ["member", "quantity", "protein_g"],
                        properties: {
                          member: { type: Type.STRING },
                          quantity: { type: Type.STRING },
                          protein_g: { type: Type.STRING },
                        },
                      },
                    },
                    recipe: {
                      type: Type.OBJECT,
                      required: ["ingredients", "steps"],
                      properties: {
                        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                    },
                  },
                } 
              },
              lunch: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  required: ["name", "prep_time_min", "reason", "portions", "recipe"],
                  properties: {
                    name: { type: Type.STRING },
                    prep_time_min: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    portions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ["member", "quantity", "protein_g"],
                        properties: {
                          member: { type: Type.STRING },
                          quantity: { type: Type.STRING },
                          protein_g: { type: Type.STRING },
                        },
                      },
                    },
                    recipe: {
                      type: Type.OBJECT,
                      required: ["ingredients", "steps"],
                      properties: {
                        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                    },
                  },
                } 
              },
              snack: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  required: ["name", "prep_time_min", "reason", "portions", "recipe"],
                  properties: {
                    name: { type: Type.STRING },
                    prep_time_min: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    portions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ["member", "quantity", "protein_g"],
                        properties: {
                          member: { type: Type.STRING },
                          quantity: { type: Type.STRING },
                          protein_g: { type: Type.STRING },
                        },
                      },
                    },
                    recipe: {
                      type: Type.OBJECT,
                      required: ["ingredients", "steps"],
                      properties: {
                        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                    },
                  },
                } 
              },
              dinner: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  required: ["name", "prep_time_min", "reason", "portions", "recipe"],
                  properties: {
                    name: { type: Type.STRING },
                    prep_time_min: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    portions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ["member", "quantity", "protein_g"],
                        properties: {
                          member: { type: Type.STRING },
                          quantity: { type: Type.STRING },
                          protein_g: { type: Type.STRING },
                        },
                      },
                    },
                    recipe: {
                      type: Type.OBJECT,
                      required: ["ingredients", "steps"],
                      properties: {
                        ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                        steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                    },
                  },
                } 
              },
            },
          },
          summary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["member", "estimated_calories", "protein_intake", "protein_target", "water_recommendation"],
              properties: {
                member: { type: Type.STRING },
                estimated_calories: { type: Type.STRING },
                protein_intake: { type: Type.STRING },
                protein_target: { type: Type.STRING },
                water_recommendation: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });

  return JSON.parse(response.text || '{}');
}
