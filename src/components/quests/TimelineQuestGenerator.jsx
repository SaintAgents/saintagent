import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, Clock, Map, Compass, Star, Zap, Eye, Crown,
  ChevronRight, Loader2, RefreshCw, Shield, Heart, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Timeline configurations with unique quest flavors
const TIMELINE_CONFIG = {
  atlantis: {
    name: 'Atlantis',
    icon: '🔱',
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    themes: ['crystal technology', 'oceanic wisdom', 'ancient healing arts', 'unity consciousness'],
    questModifiers: { reward_multiplier: 1.2, difficulty: 'moderate', focus: 'healing_technology' },
    objectives: ['Activate crystal grid meditation', 'Channel Atlantean healing frequencies', 'Connect with dolphin consciousness']
  },
  egypt: {
    name: 'Egypt',
    icon: '☥',
    color: 'from-amber-500 to-yellow-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    themes: ['mystery schools', 'pyramid power', 'sacred geometry', 'pharaonic wisdom'],
    questModifiers: { reward_multiplier: 1.15, difficulty: 'challenging', focus: 'sacred_knowledge' },
    objectives: ['Study the Book of Thoth', 'Align with pyramid frequencies', 'Invoke Isis/Osiris mysteries']
  },
  qumran: {
    name: 'Qumran',
    icon: '📜',
    color: 'from-amber-700 to-orange-800',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    themes: ['Essene teachings', 'Dead Sea wisdom', 'prophetic visions', 'covenant keeping'],
    questModifiers: { reward_multiplier: 1.1, difficulty: 'moderate', focus: 'spiritual_discipline' },
    objectives: ['Practice Essene purification', 'Study scroll teachings', 'Hold sacred covenant']
  },
  france: {
    name: 'France',
    icon: '⚜️',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    themes: ['Cathars', 'Knights Templar', 'Magdalene lineage', 'Holy Grail'],
    questModifiers: { reward_multiplier: 1.25, difficulty: 'challenging', focus: 'grail_mysteries' },
    objectives: ['Trace the Rose Line', 'Invoke Magdalene flame', 'Seek the Holy Grail within']
  },
  tibet: {
    name: 'Tibet',
    icon: '🏔️',
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    themes: ['Shambhala', 'rainbow body', 'Dzogchen', 'tulku wisdom'],
    questModifiers: { reward_multiplier: 1.3, difficulty: 'advanced', focus: 'consciousness_expansion' },
    objectives: ['Practice Dzogchen meditation', 'Invoke rainbow body teachings', 'Connect with Shambhala']
  },
  future: {
    name: 'Future Earth',
    icon: '🌍',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    themes: ['New Earth', '5D civilization', 'galactic councils', 'golden age'],
    questModifiers: { reward_multiplier: 1.35, difficulty: 'visionary', focus: 'new_earth_building' },
    objectives: ['Anchor New Earth frequencies', 'Co-create 5D templates', 'Connect with future self']
  },
  source: {
    name: 'Source',
    icon: '✨',
    color: 'from-white to-amber-100',
    bgColor: 'bg-gradient-to-br from-amber-50 to-white',
    borderColor: 'border-amber-300',
    themes: ['pure consciousness', 'I AM presence', 'cosmic origin', 'divine union'],
    questModifiers: { reward_multiplier: 1.5, difficulty: 'transcendent', focus: 'source_connection' },
    objectives: ['Rest in I AM presence', 'Dissolve into Source light', 'Embody pure consciousness']
  }
};

// Approach method configurations
const APPROACH_CONFIG = {
  reverence: {
    name: 'Reverence',
    icon: '🙏',
    color: 'from-violet-500 to-purple-600',
    questStyle: 'devotional',
    objectives: ['Practice sacred devotion', 'Honor the divine in all', 'Cultivate gratitude'],
    bonuses: { rp_bonus: 10, ggg_bonus: 5 }
  },
  recognition: {
    name: 'Recognition',
    icon: '👁️',
    color: 'from-amber-500 to-yellow-600',
    questStyle: 'awareness',
    objectives: ['Recognize divine patterns', 'See through illusion', 'Awaken to truth'],
    bonuses: { rp_bonus: 15, ggg_bonus: 3 }
  },
  surrender: {
    name: 'Surrender',
    icon: '🕊️',
    color: 'from-cyan-500 to-blue-600',
    questStyle: 'release',
    objectives: ['Release attachment', 'Surrender to divine will', 'Trust the process'],
    bonuses: { rp_bonus: 12, ggg_bonus: 7 }
  }
};

// Coherence factor affects quest generation
const getCoherenceModifiers = (coherenceFactor) => {
  if (coherenceFactor <= 3) {
    return { difficulty: 0.7, rewards: 0.8, complexity: 'simple', branches: 1 };
  } else if (coherenceFactor <= 5) {
    return { difficulty: 1.0, rewards: 1.0, complexity: 'moderate', branches: 2 };
  } else if (coherenceFactor <= 7) {
    return { difficulty: 1.3, rewards: 1.3, complexity: 'complex', branches: 3 };
  } else {
    return { difficulty: 1.6, rewards: 1.6, complexity: 'transcendent', branches: 4 };
  }
};

export default function TimelineQuestGenerator({ userId, profile }) {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);

  // Fetch user's initiations to understand their choices
  const { data: initiations = [] } = useQuery({
    queryKey: ['userInitiations', userId],
    queryFn: () => base44.entities.Initiation.filter({ user_id: userId }, '-created_date', 20),
    enabled: !!userId
  });

  // Fetch existing timeline quests
  const { data: timelineQuests = [] } = useQuery({
    queryKey: ['timelineQuests', userId],
    queryFn: () => base44.entities.Quest.filter({ 
      user_id: userId, 
      category: 'meta_variance' 
    }, '-created_date', 50),
    enabled: !!userId
  });

  // Get the user's dominant timeline and approach from initiations
  const getUserChoices = () => {
    const completed = initiations.filter(i => i.status === 'completed' || i.status === 'integrated');
    
    // Aggregate timeline choices
    const timelineCounts = {};
    const approachCounts = {};
    let totalCoherence = 0;
    let coherenceCount = 0;

    completed.forEach(init => {
      if (init.timeline_alignment) {
        timelineCounts[init.timeline_alignment] = (timelineCounts[init.timeline_alignment] || 0) + 1;
      }
      if (init.approach_method) {
        approachCounts[init.approach_method] = (approachCounts[init.approach_method] || 0) + 1;
      }
      if (init.coherence_factor) {
        totalCoherence += init.coherence_factor;
        coherenceCount++;
      }
    });

    const dominantTimeline = Object.entries(timelineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'source';
    const dominantApproach = Object.entries(approachCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'reverence';
    const avgCoherence = coherenceCount > 0 ? Math.round(totalCoherence / coherenceCount) : 5;

    return { dominantTimeline, dominantApproach, avgCoherence, initiations: completed };
  };

  const userChoices = getUserChoices();
  const timelineConfig = TIMELINE_CONFIG[userChoices.dominantTimeline] || TIMELINE_CONFIG.source;
  const approachConfig = APPROACH_CONFIG[userChoices.dominantApproach] || APPROACH_CONFIG.reverence;
  const coherenceModifiers = getCoherenceModifiers(userChoices.avgCoherence);

  // Generate personalized quests using AI
  const generateQuestsMutation = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      
      const prompt = `Generate 3 personalized timeline quests for a spiritual seeker with these characteristics:

Timeline Resonance: ${userChoices.dominantTimeline} (${timelineConfig.name})
- Themes: ${timelineConfig.themes.join(', ')}
- Quest focus: ${timelineConfig.questModifiers.focus}

Approach Method: ${userChoices.dominantApproach} (${approachConfig.name})
- Style: ${approachConfig.questStyle}

Coherence Factor: ${userChoices.avgCoherence}/10 (${coherenceModifiers.complexity} complexity)
- Should have ${coherenceModifiers.branches} branching path options

Previous Initiations Completed:
${userChoices.initiations.slice(0, 5).map(i => `- ${i.title}: ${i.initiation_type}`).join('\n') || '- None yet'}

Create quests that:
1. Build on their timeline resonance themes
2. Match their approach method style
3. Have appropriate difficulty for their coherence level
4. Include branching choices that affect outcomes
5. Reference their initiation progress

Return an array of 3 quest objects.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            quests: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  quest_type: { type: "string" },
                  rarity: { type: "string" },
                  target_action: { type: "string" },
                  target_count: { type: "number" },
                  base_reward_rp: { type: "number" },
                  base_reward_ggg: { type: "number" },
                  timeline_objectives: { type: "array", items: { type: "string" } },
                  branch_options: { 
                    type: "array", 
                    items: { 
                      type: "object",
                      properties: {
                        choice: { type: "string" },
                        effect: { type: "string" },
                        reward_modifier: { type: "number" }
                      }
                    } 
                  },
                  initiation_connection: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Create the quests with full meta-variance data
      const createdQuests = [];
      for (const quest of response.quests || []) {
        const finalRP = Math.round(quest.base_reward_rp * coherenceModifiers.rewards * timelineConfig.questModifiers.reward_multiplier);
        const finalGGG = Math.round(quest.base_reward_ggg * coherenceModifiers.rewards * timelineConfig.questModifiers.reward_multiplier);

        const created = await base44.entities.Quest.create({
          user_id: userId,
          title: quest.title,
          description: quest.description,
          quest_type: quest.quest_type || 'pathway',
          category: 'meta_variance',
          target_action: quest.target_action,
          target_count: quest.target_count || 1,
          current_count: 0,
          reward_rp: finalRP + (approachConfig.bonuses.rp_bonus || 0),
          reward_ggg: finalGGG + (approachConfig.bonuses.ggg_bonus || 0),
          rarity: quest.rarity || 'uncommon',
          status: 'active',
          meta_variance: {
            coherence_factor: userChoices.avgCoherence,
            difficulty_multiplier: coherenceModifiers.difficulty,
            reward_multiplier: timelineConfig.questModifiers.reward_multiplier,
            timeline_alignment: userChoices.dominantTimeline,
            approach_method: userChoices.dominantApproach
          },
          initiation_data: {
            initiation_type: userChoices.initiations[0]?.initiation_type,
            choices_made: {
              timeline: userChoices.dominantTimeline,
              approach: userChoices.dominantApproach,
              branch_options: quest.branch_options
            },
            steps_completed: [],
            total_steps: quest.target_count
          },
          pathway_data: {
            pathway_name: `${timelineConfig.name} Path`,
            current_stage: 1,
            total_stages: quest.target_count,
            stages: quest.timeline_objectives?.map((obj, idx) => ({
              stage_num: idx + 1,
              title: obj,
              target_action: quest.target_action,
              target_count: 1,
              current_count: 0,
              completed: false
            })) || []
          },
          started_at: new Date().toISOString()
        });
        createdQuests.push(created);
      }

      return createdQuests;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timelineQuests', userId] });
      setGenerating(false);
    },
    onError: () => {
      setGenerating(false);
    }
  });

  const activeQuests = timelineQuests.filter(q => q.status === 'active');
  const completedQuests = timelineQuests.filter(q => q.status === 'completed' || q.status === 'claimed');

  return (
    <div className="space-y-6">
      {/* User's Timeline Profile */}
      <Card className={`${timelineConfig.bgColor} ${timelineConfig.borderColor} border-2`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${timelineConfig.color} flex items-center justify-center text-2xl`}>
                {timelineConfig.icon}
              </div>
              <div>
                <CardTitle className="text-lg">Your Timeline Resonance</CardTitle>
                <p className="text-sm text-slate-700 font-medium">
                  {timelineConfig.name} • {approachConfig.name} Approach • Coherence {userChoices.avgCoherence}/10
                </p>
              </div>
            </div>
            <Badge className={`bg-gradient-to-r ${timelineConfig.color} text-white`}>
              {coherenceModifiers.complexity}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-xl bg-white/60">
              <p className="text-2xl font-bold text-slate-900">{userChoices.initiations.length}</p>
              <p className="text-xs text-slate-600">Initiations</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/60">
              <p className="text-2xl font-bold text-slate-900">{activeQuests.length}</p>
              <p className="text-xs text-slate-600">Active Quests</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/60">
              <p className="text-2xl font-bold text-slate-900">{completedQuests.length}</p>
              <p className="text-xs text-slate-600">Completed</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {timelineConfig.themes.map((theme, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {theme}
              </Badge>
            ))}
          </div>

          <Button
            onClick={() => generateQuestsMutation.mutate()}
            disabled={generating}
            className={`w-full bg-gradient-to-r ${timelineConfig.color} text-white`}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Personalized Quests...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Timeline Quests
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Active Timeline Quests */}
      {activeQuests.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-violet-600" />
            Active Timeline Quests
          </h3>
          
          <div className="grid gap-3">
            {activeQuests.map(quest => (
              <TimelineQuestCard 
                key={quest.id} 
                quest={quest} 
                timelineConfig={TIMELINE_CONFIG[quest.meta_variance?.timeline_alignment] || timelineConfig}
                onSelect={() => setSelectedQuest(quest)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quest Detail Modal */}
      <AnimatePresence>
        {selectedQuest && (
          <TimelineQuestDetailModal
            quest={selectedQuest}
            timelineConfig={TIMELINE_CONFIG[selectedQuest.meta_variance?.timeline_alignment] || timelineConfig}
            approachConfig={APPROACH_CONFIG[selectedQuest.meta_variance?.approach_method] || approachConfig}
            onClose={() => setSelectedQuest(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TimelineQuestCard({ quest, timelineConfig, onSelect }) {
  const progress = quest.target_count > 0 
    ? Math.min(100, (quest.current_count / quest.target_count) * 100) 
    : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 ${timelineConfig.borderColor} ${timelineConfig.bgColor} cursor-pointer transition-all hover:shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${timelineConfig.color} flex items-center justify-center text-lg shrink-0`}>
          {timelineConfig.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-slate-900 truncate">{quest.title}</h4>
            <Badge variant="outline" className="text-xs shrink-0 ml-2">
              {quest.rarity}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 line-clamp-2 mb-2">{quest.description}</p>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Star className="w-3 h-3 text-amber-500" />
              +{quest.reward_rp} RP
            </div>
            {quest.reward_ggg > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Zap className="w-3 h-3 text-emerald-500" />
                +{quest.reward_ggg} GGG
              </div>
            )}
            {quest.meta_variance?.coherence_factor && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Eye className="w-3 h-3 text-violet-500" />
                Coherence {quest.meta_variance.coherence_factor}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span>
              <span>{quest.current_count}/{quest.target_count}</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
      </div>
    </motion.div>
  );
}

function TimelineQuestDetailModal({ quest, timelineConfig, approachConfig, onClose }) {
  const queryClient = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState(null);

  const branchOptions = quest.initiation_data?.choices_made?.branch_options || [];
  const stages = quest.pathway_data?.stages || [];

  const selectBranchMutation = useMutation({
    mutationFn: async (branch) => {
      const updatedChoices = {
        ...quest.initiation_data?.choices_made,
        selected_branch: branch
      };
      
      // Apply branch reward modifier
      const newRewardRP = Math.round(quest.reward_rp * (branch.reward_modifier || 1));
      const newRewardGGG = Math.round(quest.reward_ggg * (branch.reward_modifier || 1));

      await base44.entities.Quest.update(quest.id, {
        initiation_data: {
          ...quest.initiation_data,
          choices_made: updatedChoices
        },
        reward_rp: newRewardRP,
        reward_ggg: newRewardGGG
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timelineQuests'] });
      setSelectedBranch(null);
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className={`p-6 bg-gradient-to-br ${timelineConfig.color} text-white`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{timelineConfig.icon}</span>
            <div>
              <h2 className="text-xl font-bold">{quest.title}</h2>
              <p className="text-white/80 text-sm">{timelineConfig.name} Timeline Quest</p>
            </div>
          </div>
          <p className="text-white/90">{quest.description}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Meta-Variance Info */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <Eye className="w-5 h-5 mx-auto text-violet-600 mb-1" />
              <p className="text-lg font-bold text-slate-900">{quest.meta_variance?.coherence_factor || 5}</p>
              <p className="text-xs text-slate-500">Coherence</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <span className="text-xl">{approachConfig.icon}</span>
              <p className="text-sm font-medium text-slate-900 mt-1">{approachConfig.name}</p>
              <p className="text-xs text-slate-500">Approach</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-50">
              <Crown className="w-5 h-5 mx-auto text-amber-600 mb-1" />
              <p className="text-lg font-bold text-slate-900">{quest.rarity}</p>
              <p className="text-xs text-slate-500">Rarity</p>
            </div>
          </div>

          {/* Rewards */}
          <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-emerald-50">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-amber-700">+{quest.reward_rp} RP</span>
            </div>
            {quest.reward_ggg > 0 && (
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-emerald-700">+{quest.reward_ggg} GGG</span>
              </div>
            )}
          </div>

          {/* Stages/Objectives */}
          {stages.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Map className="w-4 h-4 text-violet-600" />
                Quest Stages
              </h3>
              <div className="space-y-2">
                {stages.map((stage, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      stage.completed ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      stage.completed 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {stage.completed ? '✓' : stage.stage_num}
                    </div>
                    <span className={stage.completed ? 'text-emerald-700' : 'text-slate-700'}>
                      {stage.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Branch Options */}
          {branchOptions.length > 0 && !quest.initiation_data?.choices_made?.selected_branch && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-violet-600" />
                Choose Your Path
              </h3>
              <div className="space-y-2">
                {branchOptions.map((branch, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectBranchMutation.mutate(branch)}
                    className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900">{branch.choice}</span>
                      <Badge className="bg-violet-100 text-violet-700">
                        {branch.reward_modifier > 1 ? `+${Math.round((branch.reward_modifier - 1) * 100)}%` : 'Standard'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{branch.effect}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Branch */}
          {quest.initiation_data?.choices_made?.selected_branch && (
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <p className="text-sm text-violet-700">
                <strong>Path Chosen:</strong> {quest.initiation_data.choices_made.selected_branch.choice}
              </p>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}