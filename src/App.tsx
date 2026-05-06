import { useState, ReactNode, useEffect, useRef, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Leaf, 
  User, 
  Activity, 
  ChefHat, 
  Clock, 
  ChevronRight, 
  ChevronDown,
  Droplets,
  Zap,
  Info,
  UtensilsCrossed,
  Plus,
  RefreshCw,
  ArrowLeft,
  Trash2,
  Users,
  Edit2,
  Heart,
  Key
} from 'lucide-react';
import { FamilyMember, FamilyMealPlanResponse, FamilyDishOption } from './types.ts';
import { generateFamilyMealPlan } from './services/geminiService.ts';

const INGREDIENT_POOL = {
  proteins: ['Moong Dal', 'Toor Dal', 'Chana', 'Rajma', 'Soy Chunks', 'Paneer', 'Dahi', 'Moongphali', 'Kabuli Chana', 'Masoor Dal', 'Urad Dal', 'Matar'],
  grains: ['Chawal', 'Atta', 'Oats', 'Dalia', 'Suoji', 'Bajra', 'Jowar'],
  veggies: ['Aloo', 'Tamatar', 'Pyaz', 'Palak', 'Bhindi', 'Phool Gobi', 'Simla Mirch', 'Lauki', 'Karela', 'Kaddu', 'Gajar', 'Adrak'],
  extras: ['Nariyal', 'Badam', 'Akhrot', 'Kasmis', 'Ghee']
};

const getRandomPantry = () => {
  const shuffle = (array: string[]) => [...array].sort(() => Math.random() - 0.5);
  return [
    ...shuffle(INGREDIENT_POOL.proteins).slice(0, 7),
    ...shuffle(INGREDIENT_POOL.grains).slice(0, 3),
    ...shuffle(INGREDIENT_POOL.veggies).slice(0, 6),
    ...shuffle(INGREDIENT_POOL.extras).slice(0, 2)
  ].sort();
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'family' | 'kitchen' | 'setup'>(() => {
    const hasVisited = localStorage.getItem('has_visited');
    const savedPlan = localStorage.getItem('current_meal_plan');
    const savedTime = localStorage.getItem('plan_timestamp');
    
    if (savedPlan && savedTime) {
      const elapsed = Date.now() - Number(savedTime);
      if (elapsed < 24 * 60 * 60 * 1000) return 'kitchen';
    }
    
    return hasVisited ? 'kitchen' : 'family';
  });

  const [members, setMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('family_members');
    return saved ? JSON.parse(saved) : [{ name: 'Me', age: 25, weight: 70, height: 170, activity: 'moderate' }];
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  const [showApiKeySetup, setShowApiKeySetup] = useState(() => {
    return !process.env.GEMINI_API_KEY && !localStorage.getItem('gemini_api_key');
  });

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(['Atta', 'Moong Dal', 'Chawal', 'Pyaz', 'Tamatar', 'Sarson ka tel', 'Paneer']);
  const [suggestedIngredients, setSuggestedIngredients] = useState<string[]>(getRandomPantry());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [customIngredient, setCustomIngredient] = useState('');
  const [mealPlan, setMealPlan] = useState<FamilyMealPlanResponse | null>(() => {
    const saved = localStorage.getItem('current_meal_plan');
    const savedTime = localStorage.getItem('plan_timestamp');
    if (saved && savedTime) {
      const elapsed = Date.now() - Number(savedTime);
      if (elapsed < 24 * 60 * 60 * 1000) return JSON.parse(saved);
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [kitchenView, setKitchenView] = useState<'pantry' | 'menu'>('pantry');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const [newMember, setNewMember] = useState<FamilyMember>({
    name: '',
    age: 30,
    weight: 65,
    height: 165,
    activity: 'moderate'
  });

  useEffect(() => {
    localStorage.setItem('family_members', JSON.stringify(members));
    localStorage.setItem('has_visited', 'true');
  }, [members]);

  useEffect(() => {
    if (showMemberForm && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showMemberForm]);

  useEffect(() => {
    if (mealPlan) {
      setKitchenView('menu');
    } else {
      setKitchenView('pantry');
    }
  }, [mealPlan]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const plan = await generateFamilyMealPlan(members, selectedIngredients, apiKey);
      setMealPlan(plan);
      localStorage.setItem('current_meal_plan', JSON.stringify(plan));
      localStorage.setItem('plan_timestamp', Date.now().toString());
      setActiveTab('kitchen');
    } catch (error) {
      console.error('Failed to generate plan:', error);
      // If unauthorized, show setup again
      if (error instanceof Error && error.message.includes('API_KEY_INVALID')) {
        setShowApiKeySetup(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowApiKeySetup(false);
  };

  const addMember = () => {
    if (newMember.name.trim()) {
      if (editingIndex !== null) {
        const updated = [...members];
        updated[editingIndex] = newMember;
        setMembers(updated);
        setEditingIndex(null);
      } else {
        setMembers([...members, newMember]);
      }
      setNewMember({ name: '', age: 30, weight: 65, height: 165, activity: 'moderate' });
      setShowMemberForm(false);
    }
  };

  const startEdit = (idx: number) => {
    setNewMember(members[idx]);
    setEditingIndex(idx);
    setShowMemberForm(true);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  const addCustomIngredient = () => {
    const trimmed = customIngredient.trim();
    if (trimmed && !selectedIngredients.includes(trimmed)) {
      setSelectedIngredients(prev => [...prev, trimmed]);
      // Also add to suggested so it's visible as a button/chip
      if (!suggestedIngredients.includes(trimmed)) {
        setSuggestedIngredients(prev => [trimmed, ...prev]);
      }
      setCustomIngredient('');
    }
  };

  const refreshPantry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSuggestedIngredients(getRandomPantry());
      setIsRefreshing(false);
    }, 600);
  };

  const [likedMeals, setLikedMeals] = useState<Set<string>>(new Set());

  const toggleLike = (mealName: string) => {
    setLikedMeals(prev => {
      const next = new Set(prev);
      if (next.has(mealName)) next.delete(mealName);
      else next.add(mealName);
      return next;
    });
  };

  const [expandedMember, setExpandedMember] = useState<number | null>(null);

  const calculateMetrics = (member: FamilyMember) => {
    // Mifflin-St Jeor Equation simplified (using neutral s = -80)
    const bmr = (10 * member.weight) + (6.25 * member.height) - (5 * member.age) - 80;
    const multipliers = { low: 1.2, moderate: 1.5, high: 1.8 };
    const tdee = Math.round(bmr * multipliers[member.activity]);
    const protein = Math.round(member.weight * (member.activity === 'high' ? 1.8 : 1.4));
    const carbs = Math.round((tdee * 0.5) / 4);
    const fats = Math.round((tdee * 0.25) / 9);
    const water = (member.weight * 0.035).toFixed(1);
    return { calories: tdee, protein, carbs, fats, water };
  };

  return (
    <div className="min-h-screen bg-paper pt-0 pb-32">
      <div className="max-w-2xl mx-auto px-4 py-8 md:px-6 md:py-12 lg:py-20 lg:pr-24">
        <div className="stripe-accent" />
        
        <AnimatePresence mode="wait">
          {showApiKeySetup && (
            <motion.div
              key="api-key-setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <header className="text-center md:text-left">
                <h1 className="font-display text-4xl text-ink leading-tight mb-4">Activate KuchBadhiya</h1>
                <p className="text-stone-500 font-medium text-lg max-w-md">
                  To give you personalized meal plans, this app needs to connect to Google's "AI Brain." It's free and takes just a minute to set up.
                </p>
              </header>

              <div className="pairing-box">
                <div className="pairing-header flex items-center justify-between">
                  <h2 className="font-display text-lg text-white">Quick Start Guide</h2>
                  <span className="px-2 py-1 bg-white/20 rounded text-[10px] font-black uppercase text-white">100% Free</span>
                </div>
                <div className="pairing-body space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-pink text-white flex items-center justify-center font-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">1</div>
                    <div>
                        <p className="text-ink font-bold text-sm">Open Google AI Studio</p>
                        <p className="text-stone-500 text-xs mt-1">
                          Click <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-pink underline font-bold">this link</a> and sign in with your Google account.
                        </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">2</div>
                    <div>
                        <p className="text-ink font-bold text-sm">Create & Copy Key</p>
                        <p className="text-stone-500 text-xs mt-1">Tap "Create API key" and copy the long code that appears.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-yellow text-ink flex items-center justify-center font-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">3</div>
                    <div>
                        <p className="text-ink font-bold text-sm">Paste Below</p>
                        <p className="text-stone-500 text-xs mt-1">Paste it here and you're ready to cook!</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white border-t-2 border-ink">
                  <div className="space-y-4">
                    <input 
                      type="password"
                      placeholder="Paste your key (e.g. AIzaSy...)"
                      className="w-full px-5 py-4 bg-paper border-2 border-ink rounded-xl font-bold focus:ring-0 focus:border-brand-pink"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <button 
                      onClick={() => saveApiKey(apiKey)}
                      disabled={!apiKey.trim()}
                      className="w-full py-4 bg-brand-pink text-white border-2 border-ink rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-none transition-all uppercase text-sm tracking-widest disabled:opacity-30 disabled:shadow-none"
                    >
                      Start Planning
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-paper-dim border-2 border-ink rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-brand-blue">
                  <Info size={18} strokeWidth={3} />
                  <h3 className="font-display text-sm">Why do I need this?</h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Google provides this service for free up to a generous limit. By using your own key, your meal plans stay private to you and the app stays free for everyone to use!
                </p>
              </div>
            </motion.div>
          )}

          {!showApiKeySetup && activeTab === 'setup' && (
            <motion.div
              key="setup-tab"
              transition={{ duration: 0 }}
              className="space-y-10"
            >
              <header>
                <h1 className="font-display text-4xl text-ink leading-tight mb-4">Kitchen Setup</h1>
                <p className="text-stone-500 font-medium text-sm">Manage your Gemini API key to keep the kitchen running smooth.</p>
              </header>

              <div className="pairing-box">
                <div className="pairing-header">
                  <h2 className="font-display text-lg text-white">Gemini API Key</h2>
                </div>
                <div className="p-6 bg-white border-t-2 border-ink">
                  <div className="space-y-4">
                    <input 
                      type="password"
                      placeholder="Enter your API Key..."
                      className="w-full px-5 py-4 bg-paper border-2 border-ink rounded-xl font-bold focus:ring-0 focus:border-brand-pink"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <button 
                      onClick={() => saveApiKey(apiKey)}
                      disabled={!apiKey.trim()}
                      className="w-full py-4 bg-ink text-white border-2 border-ink rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-none transition-all uppercase text-xs tracking-widest disabled:opacity-30"
                    >
                      Update Key
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-stone-100 border-2 border-dashed border-stone-300 rounded-xl flex gap-3 italic text-xs text-stone-500">
                <Info size={16} className="shrink-0" />
                <p>Lost your key? Get a new one for free from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-pink underline font-bold">Google AI Studio</a>.</p>
              </div>
            </motion.div>
          )}

          {/* STEP 1: FAMILY METRICS */}
          {!showApiKeySetup && activeTab === 'family' && (
            <motion.div
              key="family-tab"
              transition={{ duration: 0 }}
              className="space-y-10"
            >
              <header>
                <h1 className="font-display text-4xl text-brand-pink leading-none mb-6">Family Metrics</h1>
              </header>

              <section>
                <div className="section-label-dashed">Active Table Profiles</div>
                <div className="type-row-container mb-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,0.05)]">
                  {members.map((m, idx) => {
                    const metrics = calculateMetrics(m);
                    const isExpanded = expandedMember === idx;
                    
                    return (
                      <div key={idx} className="bg-white border-b-2 border-ink last:border-b-0">
                        <div 
                          className={`type-row-item cursor-pointer transition-colors ${isExpanded ? 'bg-paper-dim' : 'hover:bg-paper-dim'}`}
                          onClick={() => setExpandedMember(isExpanded ? null : idx)}
                        >
                          <div className="flex-1">
                            <p className="font-display text-2xl text-ink leading-tight">{m.name}</p>
                            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
                              {m.weight}kg · {m.height}cm · {m.activity}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); startEdit(idx); }}
                              className="text-ink hover:text-brand-pink transition-all p-1 border-0 border-white"
                            >
                              <Edit2 size={16} strokeWidth={2.5} />
                            </button>
                            {members.length > 1 && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeMember(idx); }}
                                className="text-stone-300 hover:text-brand-pink transition-colors p-1"
                              >
                                <Trash2 size={16} strokeWidth={2.5} />
                              </button>
                            )}
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              className="text-ink ml-2"
                            >
                              <ChevronDown size={20} strokeWidth={3} />
                            </motion.div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-5 bg-paper-dim grid grid-cols-2 sm:grid-cols-4 gap-3 border-t-2 border-ink">
                                <MetricSmall label="KCAL" value={metrics.calories.toString()} icon={<Zap size={10} className="text-brand-orange" />} />
                                <MetricSmall label="PRO" value={`${metrics.protein}g`} icon={<Leaf size={10} className="text-brand-blue" />} />
                                <MetricSmall label="CARBS" value={`${metrics.carbs}g`} icon={<Activity size={10} className="text-ink" />} />
                                <MetricSmall label="WATER" value={`${metrics.water}L`} icon={<Droplets size={10} className="text-brand-blue" />} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                   <button 
                    onClick={() => setShowMemberForm(true)}
                    className="flex-1 py-4 bg-white border-3 border-ink rounded-xl font-black text-ink rotated-btn shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-none transition-all flex items-center justify-center gap-2 uppercase text-xs"
                  >
                    <Plus size={16} strokeWidth={3} />
                    Add Member
                  </button>
                  <button 
                    onClick={() => setActiveTab('kitchen')}
                    className="flex-1 py-4 bg-brand-pink text-white border-3 border-ink rounded-xl font-black rotated-btn shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-none transition-all flex items-center justify-center gap-2 uppercase text-xs"
                  >
                    Continue
                    <ChevronRight size={16} strokeWidth={3} />
                  </button>
                </div>
              </section>

              <AnimatePresence>
                {showMemberForm && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink/40 backdrop-blur-sm"
                    onClick={() => setShowMemberForm(false)}
                  >
                    <motion.div 
                      className="w-full max-w-sm pairing-box"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="pairing-header">
                        <div className="text-xs font-bold tracking-[0.18em] uppercase text-brand-yellow mb-1">Settings Profile</div>
                        <h2 className="font-display text-2xl text-white">Update Profile</h2>
                      </div>
                      <div className="pairing-body space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Name</label>
                          <input 
                            ref={nameInputRef}
                            type="text" 
                            value={newMember.name}
                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                            className="w-full px-5 py-3 bg-white border-2 border-ink rounded-xl font-bold"
                            placeholder="e.g. Grandma, Me, Brother"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="number" value={newMember.age || ''} onChange={(e) => setNewMember({ ...newMember, age: Number(e.target.value) })} className="w-full px-4 py-3 bg-white border-2 border-ink rounded-xl font-bold" placeholder="Age" />
                          <input type="number" value={newMember.weight || ''} onChange={(e) => setNewMember({ ...newMember, weight: Number(e.target.value) })} className="w-full px-4 py-3 bg-white border-2 border-ink rounded-xl font-bold" placeholder="Weight" />
                        </div>
                        <select value={newMember.activity} onChange={(e) => setNewMember({ ...newMember, activity: e.target.value as any })} className="w-full px-4 py-3 bg-white border-2 border-ink rounded-xl font-bold">
                          <option value="low">Low Activity</option>
                          <option value="moderate">Moderate Activity</option>
                          <option value="high">High Activity</option>
                        </select>
                      </div>
                      <div className="pairing-footer">
                        <button onClick={() => setShowMemberForm(false)} className="text-stone-400 font-bold uppercase text-xs">Cancel</button>
                        <button 
                          onClick={addMember}
                          className="px-6 py-2 bg-brand-pink text-white border-2 border-ink rounded-xl font-black rotated-btn text-sm"
                        >
                          {editingIndex !== null ? 'UPDATE' : 'SAVE'}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* KITCHEN TAB: PANTRY + MENU */}
          {!showApiKeySetup && activeTab === 'kitchen' && (
            <motion.div
              key="kitchen-tab"
              transition={{ duration: 0 }}
              className="space-y-12"
            >
              <header className="space-y-8">
                <div className="flex items-center justify-between gap-4">
                  <h1 className="font-display text-4xl text-brand-pink leading-none">KuchBadhiya</h1>
                  {kitchenView === 'menu' ? (
                    mealPlan && (
                      <button 
                        onClick={handleGenerate}
                        disabled={loading}
                        className={`text-brand-pink active:text-ink transition-all p-2 flex items-center justify-center shrink-0 ${loading ? 'animate-spin' : ''}`}
                        title="Regenerate with same ingredients"
                      >
                        <RefreshCw size={24} strokeWidth={3} />
                      </button>
                    )
                  ) : (
                    <button 
                      onClick={refreshPantry}
                      disabled={isRefreshing}
                      className={`text-brand-pink active:text-ink transition-all p-2 flex items-center justify-center shrink-0 ${isRefreshing ? 'animate-spin' : ''}`}
                      title="Shuffle Pantry"
                    >
                      <RefreshCw size={24} strokeWidth={3} />
                    </button>
                  )}
                </div>

                {mealPlan && (
                  <div className="flex p-1 bg-white border-b border-stone-100 w-full">
                    <button 
                      onClick={() => setKitchenView('pantry')}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border-2 ${
                        kitchenView === 'pantry' 
                          ? 'border-ink text-ink' 
                          : 'border-transparent text-stone-400 hover:text-ink'
                      }`}
                    >
                      Pantry
                    </button>
                    <button 
                      onClick={() => setKitchenView('menu')}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border-2 ${
                        kitchenView === 'menu' 
                          ? 'border-ink text-ink' 
                          : 'border-transparent text-stone-400 hover:text-ink'
                      }`}
                    >
                      Menu
                    </button>
                  </div>
                )}
              </header>

              {kitchenView === 'pantry' ? (
                <div className="space-y-10">
                  <section className="space-y-8">
                    <div>
                      <h2 className="section-label-dashed">Today's Pantry Selection</h2>
                      <div className="flex flex-wrap gap-2 min-h-[120px]">
                        {suggestedIngredients.map(ing => (
                          <button
                            key={ing}
                            onClick={() => toggleIngredient(ing)}
                            className={`px-4 py-2 border-2 border-ink rounded-lg text-sm font-black transition-all ${
                              selectedIngredients.includes(ing)
                                ? 'bg-brand-yellow text-ink shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] -translate-x-0.5 -translate-y-0.5'
                                : 'bg-white text-stone-400 border-stone-200 hover:border-ink hover:text-ink'
                            }`}
                          >
                            {ing.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h2 className="section-label-dashed">Naya Saman (Custom)</h2>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                          type="text" 
                          placeholder="e.g. Paneer, Kela..."
                          value={customIngredient}
                          onChange={(e) => setCustomIngredient(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addCustomIngredient()}
                          className="flex-1 px-5 py-4 bg-white border-2 border-ink rounded-xl focus:ring-0 focus:border-brand-pink text-ink font-bold"
                        />
                        <button 
                          onClick={addCustomIngredient}
                          className="px-8 py-4 bg-ink text-white rounded-xl font-black rotated-btn flex items-center justify-center gap-2 text-xs"
                        >
                          <Plus size={16} strokeWidth={3} />
                          ADD
                        </button>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        onClick={handleGenerate}
                        disabled={loading || selectedIngredients.length === 0}
                        className="w-full py-5 bg-brand-pink text-white border-4 border-ink rounded-[20px] font-display text-2xl rotated-btn shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:shadow-none transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:shadow-none"
                      >
                        {loading ? (
                          <div className="flex items-center gap-4">
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            PLANNING...
                          </div>
                        ) : (
                          <>
                            GENERATE MENU
                            <ChefHat size={28} strokeWidth={3} />
                          </>
                        )}
                      </button>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="space-y-16">
                  {/* Meal Sections */}
                  <div className="space-y-12">
                    <FamilyMealSection title="Breakfast" options={mealPlan.meals.breakfast} expanded={expandedRecipe} setExpanded={setExpandedRecipe} likedMeals={likedMeals} toggleLike={toggleLike} />
                    <FamilyMealSection title="Lunch" options={mealPlan.meals.lunch} expanded={expandedRecipe} setExpanded={setExpandedRecipe} likedMeals={likedMeals} toggleLike={toggleLike} />
                    <FamilyMealSection title="Evening" options={mealPlan.meals.snack} expanded={expandedRecipe} setExpanded={setExpandedRecipe} likedMeals={likedMeals} toggleLike={toggleLike} />
                    <FamilyMealSection title="Dinner" options={mealPlan.meals.dinner} expanded={expandedRecipe} setExpanded={setExpandedRecipe} likedMeals={likedMeals} toggleLike={toggleLike} />
                  </div>

                  {/* Detailed Summary Table */}
                  <div className="space-y-6">
                    <div className="section-label-dashed">Dietary Summary Index</div>
                    <div className="pairing-box overflow-hidden">
                       <div className="pairing-header">
                         <h3 className="font-display text-xl text-white">Nutritional Audit</h3>
                       </div>
                       <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead>
                            <tr className="bg-paper-dim border-b-2 border-ink">
                              <th className="p-4 py-3 text-xs uppercase tracking-widest font-black text-stone-400">Member</th>
                              <th className="p-4 py-3 text-xs uppercase tracking-widest font-black text-stone-400">Calories</th>
                              <th className="p-4 py-3 text-xs uppercase tracking-widest font-black text-stone-400">Protein</th>
                              <th className="p-4 py-3 text-xs uppercase tracking-widest font-black text-stone-400">Hydration</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mealPlan.summary.map((s, idx) => (
                              <tr key={idx} className="border-b border-stone-100 last:border-0 hover:bg-paper-dim/30 transition-colors">
                                <td className="p-4 font-bold text-ink text-base">{s.member}</td>
                                <td className="p-4 text-stone-500 font-medium text-base">{s.estimated_calories} kcal</td>
                                <td className="p-4">
                                  <span className="font-black text-brand-pink text-base">{s.protein_intake}</span>
                                  <span className="text-stone-300 text-xs mx-1">/</span>
                                  <span className="text-stone-400 text-sm font-bold">{s.protein_target}</span>
                                </td>
                                <td className="p-4">
                                   <span className="stamp text-brand-blue border-brand-blue">{s.water_recommendation}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                       </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pb-12">
                    <button 
                      onClick={() => setMealPlan(null)}
                      className="px-8 py-3 bg-white border-2 border-ink rounded-xl font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-none transition-all"
                    >
                      Reset Kitchen
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {!showApiKeySetup && (
        <nav className="fixed bottom-0 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:right-[calc(50%-23rem)] left-0 lg:left-auto right-0 z-50 px-0 lg:px-0">
          <div className="flex lg:flex-col items-center justify-around lg:justify-center lg:gap-12 h-16 lg:h-auto lg:w-16 w-full lg:py-10 bg-ink border-t-2 lg:border-2 border-white/10 lg:rounded-full shadow-[0_-10px_40px_rgba(0,0,0,0.3)] lg:shadow-none">
            <NavButton 
              active={activeTab === 'family'} 
              onClick={() => setActiveTab('family')}
              icon={<Users size={28} strokeWidth={2.5} />}
            />
            <NavButton 
              active={activeTab === 'kitchen'} 
              onClick={() => setActiveTab('kitchen')}
              icon={<ChefHat size={28} strokeWidth={2.5} />}
            />
            <NavButton 
              active={activeTab === 'setup'} 
              onClick={() => setActiveTab('setup')}
              icon={<Key size={28} strokeWidth={2.5} />}
            />
          </div>
        </nav>
      )}
    </div>
  );
}

function MetricSmall({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center p-2 border-2 border-ink/10 rounded-xl bg-white shadow-sm hover:border-ink/30 transition-colors">
      <div className="mb-1">{icon}</div>
      <p className="text-xs font-black uppercase tracking-tighter text-stone-400 mb-0.5">{label}</p>
      <p className="text-sm font-black text-ink leading-none">{value}</p>
    </div>
  );
}

function NavButton({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex-1 flex items-center justify-center h-full transition-all duration-300 ${
        active ? 'text-brand-pink' : 'text-stone-500 hover:text-stone-300'
      }`}
    >
      <div className="z-10">{icon}</div>
    </button>
  );
}

function MinStatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/5 rounded-xl border border-white/5">{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase text-brand-cream/30 tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-black text-brand-cream">{value}</p>
      </div>
    </div>
  );
}

function FamilyMealSection({ 
  title, 
  options, 
  expanded, 
  setExpanded,
  likedMeals,
  toggleLike
}: { 
  title: string; 
  options: FamilyDishOption[]; 
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  likedMeals: Set<string>;
  toggleLike: (name: string) => void;
}) {
  return (
    <section>
      <div className="section-label-dashed mb-6">{title} Options</div>
      <div className="space-y-8">
        {options.map((option, idx) => (
          <MealOptionCard 
            key={`${title}-${idx}`}
            option={option}
            idx={idx}
            isExpanded={expanded === `${title}-${idx}`}
            onToggle={() => setExpanded(expanded === `${title}-${idx}` ? null : `${title}-${idx}`)}
            likedMeals={likedMeals}
            toggleLike={toggleLike}
          />
        ))}
      </div>
    </section>
  );
}

interface MealOptionCardProps {
  key?: string | number;
  option: FamilyDishOption;
  idx: number;
  isExpanded: boolean;
  onToggle: () => void;
  likedMeals: Set<string>;
  toggleLike: (name: string) => void;
}

function MealOptionCard({ 
  option, 
  idx, 
  isExpanded, 
  onToggle, 
  likedMeals, 
  toggleLike 
}: MealOptionCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiInstance = useRef<any>(null);

  useEffect(() => {
    if (canvasRef.current && !confettiInstance.current) {
      confettiInstance.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true
      });
    }
  }, []);

  const handleLike = (e: MouseEvent) => {
    e.stopPropagation();
    if (!likedMeals.has(option.name) && confettiInstance.current) {
      const config = {
        particleCount: 25,
        gravity: 0.8,
        scalar: 1.5,
        colors: ['#ef4444', '#FF2D8B', '#FFD700'],
        spread: 70,
        startVelocity: 20,
      };
      
      // Launch from left
      confettiInstance.current({
        ...config,
        origin: { x: 0, y: 0.7 },
        angle: 45
      });
      
      // Launch from right
      confettiInstance.current({
        ...config,
        origin: { x: 1, y: 0.7 },
        angle: 135
      });
    }
    toggleLike(option.name);
  };

  return (
    <motion.div className="pairing-box relative overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20 w-full h-full"
      />
      
      <div 
        className="pairing-header cursor-pointer group"
        onClick={onToggle}
      >
         <div style={{fontSize:'11px', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#FF2D8B', marginBottom:'4px'}}>Choice {idx + 1}</div>
         <div className="flex items-center justify-between gap-4">
            <h4 className="font-display text-2xl text-white leading-tight">{option.name}</h4>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="text-brand-yellow flex-shrink-0"
            >
              <ChevronDown size={28} strokeWidth={3} />
            </motion.div>
         </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pairing-body space-y-8">
              <div className="space-y-2">
                <h5 className="section-label-dashed">NUTRITIONAL INTENT</h5>
                <p className="text-lg text-stone-500 font-medium leading-relaxed">{option.reason}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h5 className="section-label-dashed text-brand-orange">CONSTITUENTS</h5>
                  <div className="flex flex-wrap gap-2">
                    {option.recipe.ingredients.map((ing, i) => (
                      <span key={i} className="px-3 py-1 bg-white border-2 border-ink rounded-lg text-sm text-ink font-black uppercase tracking-wider">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="section-label-dashed">PREPARATION</h5>
                  <ul className="space-y-3">
                    {option.recipe.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-base text-stone-600 leading-relaxed font-medium">
                        <span className="flex-shrink-0 w-8 h-8 border-2 border-ink text-ink rounded-lg flex items-center justify-center font-black text-sm">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-ink/5">
                <h5 className="section-label-dashed">TABLE PORTIONS</h5>
                <div className="grid grid-cols-2 gap-3">
                  {option.portions.map((p, i) => (
                    <div key={i} className="flex flex-col items-center text-center p-3 border-2 border-ink/10 rounded-xl bg-white shadow-sm hover:border-ink/30 transition-colors w-full">
                      <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-1">{p.member}</p>
                      <p className="text-base font-black text-ink mb-1">{p.quantity}</p>
                      <span className="text-sm font-bold text-brand-blue uppercase">{p.protein_g}g Pro</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pairing-footer">
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2">
              <Clock size={24} className="text-ink" strokeWidth={2.5} />
              <span className="font-display text-base text-ink leading-tight">{option.prep_time_min}min</span>
           </div>
        </div>
        <button 
          onClick={handleLike}
          className="p-1 transition-all active:scale-95 z-30 relative"
        >
          <Heart 
            size={24} 
            className={likedMeals.has(option.name) ? "text-red-500" : "text-ink"} 
            fill={likedMeals.has(option.name) ? "currentColor" : "none"} 
            strokeWidth={2.5} 
          />
        </button>
      </div>
    </motion.div>
  );
}
