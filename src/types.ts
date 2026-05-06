export interface FamilyMember {
  name: string;
  age: number;
  weight: number;
  height: number;
  activity: 'low' | 'moderate' | 'high';
}

export interface IndividualRequirement {
  calories: string;
  protein_g: string;
  carbs_g: string;
  fats_g: string;
  water_liters: string;
}

export interface MemberWithRequirements {
  name: string;
  requirements: IndividualRequirement;
}

export interface MemberPortion {
  member: string;
  quantity: string;
  protein_g: string;
}

export interface Recipe {
  ingredients: string[];
  steps: string[];
}

export interface FamilyDishOption {
  name: string;
  prep_time_min: string;
  reason: string;
  portions: MemberPortion[];
  recipe: Recipe;
}

export interface FamilySummary {
  member: string;
  estimated_calories: string;
  protein_intake: string;
  protein_target: string;
  water_recommendation: string;
}

export interface FamilyMealPlanResponse {
  members: MemberWithRequirements[];
  meals: {
    breakfast: FamilyDishOption[];
    lunch: FamilyDishOption[];
    snack: FamilyDishOption[];
    dinner: FamilyDishOption[];
  };
  summary: FamilySummary[];
}
