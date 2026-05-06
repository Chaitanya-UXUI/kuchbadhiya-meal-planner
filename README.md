# KuchBadhiya 🥣

KuchBadhiya (meaning "Something Good" in Hindi) is a personalized, high-protein Indian family meal planner. It leverages Google's Gemini AI to craft nutrient-dense, vegetarian/plant-based meal plans tailored to your family's specific health metrics and the ingredients you have on hand.

## ✨ Features

- **👨‍👩‍👧‍👦 Family Profiles:** Add multiple family members with their age, weight, height, and activity levels to ensure nutrition scales correctly.
- **🧺 Smart Pantry:** Select from common Indian kitchen staples or add your own custom ingredients to guide the AI.
- **🍱 Full-Day Planning:** Generates a complete daily menu including Breakfast, Lunch, and Dinner.
- **⚖️ Nutritional Audits:** Every meal comes with a breakdown of its nutritional benefits for the whole family.
- **⚡ Real-time Customization:** Regenerate specific meals or the entire plan instantly with a single tap.
- **🔑 Privacy First:** Uses your own Google Gemini API key; your data stays local to your device.

## 🚀 Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS (Fluid & Responsive Design)
- **Animation:** Motion (framer-motion)
- **AI Engine:** Google Gemini Pro via `@google/genai`
- **Icons:** Lucide React

## 🛠️ Getting Started

### Prerequisites

You will need a **Gemini API Key**.
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create a new API key.
3. Paste it into the app's onboarding screen or the **Kitchen Setup** (Key icon) tab in the bottom navigation.

### Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## 🎨 Design Philosophy

The app uses a **Bold Neo-Brutalist** design system:
- High-contrast ink borders (2px-4px).
- Vibrant brand colors: **Pink** (#FF2D8B), **Yellow** (#FFD600), and **Blue** (#4D77FF).
- "Rotated" UI elements for a playful, hand-crafted feel.
- Mobile-first optimization with a dedicated bottom navigation bar.

---
*Built with ❤️ for healthier Indian kitchens.*
