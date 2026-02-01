import { Guide } from '../types';

export const guides: Guide[] = [
  {
    id: '1',
    title: 'Furnace Troubleshooting',
    progress: 60,
    totalSteps: 5,
    completedSteps: 3,
    timeEstimate: '45 min',
    category: 'HVAC',
  },
  {
    id: '2',
    title: 'Replace Furnace Filter',
    progress: 100,
    totalSteps: 3,
    completedSteps: 3,
    timeEstimate: '10 min',
    category: 'HVAC',
  },
  {
    id: '3',
    title: 'Sump Pump Maintenance',
    progress: 0,
    totalSteps: 4,
    completedSteps: 0,
    timeEstimate: '30 min',
    category: 'Plumbing',
  },
];

export type GuideSource = 'ifixit' | 'youtube' | 'family_handyman' | 'this_old_house' | 'bob_vila' | 'ai_generated';

export interface MixedGuide {
  id: string;
  title: string;
  description?: string;
  source: GuideSource;
  sourceUrl?: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate: string;
  totalSteps?: number;
  thumbnailUrl?: string;
  author?: string;
  viewCount?: number;
  rating?: number;
  isVideo?: boolean;
  isBookmarked?: boolean;
  progress?: number;
  completedSteps?: number;
}

export const mixedGuides: MixedGuide[] = [
  // iFixit guides
  {
    id: 'ifixit-1',
    title: 'Garbage Disposal Reset & Repair Guide',
    description: 'Step-by-step guide to diagnose and fix common garbage disposal issues including jams, resets, and motor problems.',
    source: 'ifixit',
    sourceUrl: 'https://www.ifixit.com/Guide/Garbage+Disposal/12345',
    category: 'Appliances',
    difficulty: 'beginner',
    timeEstimate: '20 min',
    totalSteps: 6,
    thumbnailUrl: '/placeholder-disposal.jpg',
    author: 'iFixit Community',
    viewCount: 45200,
    rating: 4.7,
    progress: 100,
    completedSteps: 6,
  },
  {
    id: 'ifixit-2',
    title: 'Toilet Flapper Replacement',
    description: 'Fix a running toilet by replacing the flapper valve. Works with Kohler, American Standard, and most brands.',
    source: 'ifixit',
    sourceUrl: 'https://www.ifixit.com/Guide/Toilet+Flapper/67890',
    category: 'Plumbing',
    difficulty: 'beginner',
    timeEstimate: '15 min',
    totalSteps: 5,
    author: 'iFixit Community',
    viewCount: 89400,
    rating: 4.8,
  },
  // YouTube video tutorials
  {
    id: 'youtube-1',
    title: 'Furnace Not Igniting - 5 Common Causes',
    description: 'Troubleshoot why your gas furnace won\'t ignite. Covers flame sensor, igniter, gas valve, and thermostat issues.',
    source: 'youtube',
    sourceUrl: 'https://www.youtube.com/watch?v=example1',
    category: 'HVAC',
    difficulty: 'intermediate',
    timeEstimate: '15 min',
    thumbnailUrl: '/placeholder-furnace.jpg',
    author: 'Word of Advice TV',
    viewCount: 3200000,
    rating: 4.9,
    isVideo: true,
    progress: 60,
    completedSteps: 3,
    totalSteps: 5,
  },
  {
    id: 'youtube-2',
    title: 'How to Clean a Furnace Flame Sensor',
    description: 'Quick fix for a furnace that starts then shuts off. 90% of the time it\'s a dirty flame sensor.',
    source: 'youtube',
    sourceUrl: 'https://www.youtube.com/watch?v=example2',
    category: 'HVAC',
    difficulty: 'beginner',
    timeEstimate: '12 min',
    author: 'HVAC School',
    viewCount: 1890000,
    rating: 4.8,
    isVideo: true,
    isBookmarked: true,
  },
  {
    id: 'youtube-3',
    title: 'Garage Door Opener Repair - LiftMaster/Chamberlain',
    description: 'Fix common issues with belt and chain drive openers. Covers gear replacement and limit switch adjustment.',
    source: 'youtube',
    sourceUrl: 'https://www.youtube.com/watch?v=example3',
    category: 'Garage',
    difficulty: 'intermediate',
    timeEstimate: '22 min',
    author: 'This Old House',
    viewCount: 1200000,
    rating: 4.7,
    isVideo: true,
  },
  // Family Handyman articles
  {
    id: 'fh-1',
    title: 'How to Maintain Your Sump Pump',
    description: 'Keep your basement dry with regular sump pump maintenance. Includes battery backup testing.',
    source: 'family_handyman',
    sourceUrl: 'https://www.familyhandyman.com/project/sump-pump-maintenance/',
    category: 'Plumbing',
    difficulty: 'beginner',
    timeEstimate: '30 min',
    totalSteps: 6,
    author: 'Family Handyman Editors',
    rating: 4.6,
    isBookmarked: true,
    progress: 0,
    completedSteps: 0,
  },
  {
    id: 'fh-2',
    title: 'Winterize Your Home Checklist',
    description: 'Prepare your home for cold Midwest winters. Covers insulation, pipes, furnace, and weatherstripping.',
    source: 'family_handyman',
    sourceUrl: 'https://www.familyhandyman.com/project/winterize-home/',
    category: 'Seasonal',
    difficulty: 'beginner',
    timeEstimate: '2 hours',
    totalSteps: 12,
    author: 'Family Handyman Editors',
    rating: 4.7,
  },
  // This Old House
  {
    id: 'toh-1',
    title: 'How to Install a Programmable Thermostat',
    description: 'Upgrade your old thermostat and start saving on heating bills. Compatible with most HVAC systems.',
    source: 'this_old_house',
    sourceUrl: 'https://www.thisoldhouse.com/hvac/how-to-install-programmable-thermostat',
    category: 'HVAC',
    difficulty: 'beginner',
    timeEstimate: '45 min',
    totalSteps: 7,
    author: 'This Old House',
    rating: 4.8,
  },
  // Bob Vila
  {
    id: 'bv-1',
    title: 'How to Insulate Pipes to Prevent Freezing',
    description: 'Protect pipes in unheated areas from freezing during cold snaps. Uses foam insulation and heat tape.',
    source: 'bob_vila',
    sourceUrl: 'https://www.bobvila.com/articles/how-to-insulate-pipes/',
    category: 'Plumbing',
    difficulty: 'beginner',
    timeEstimate: '1 hour',
    totalSteps: 5,
    author: 'Bob Vila',
    rating: 4.5,
  },
  // AI Generated
  {
    id: 'ai-1',
    title: 'Troubleshoot Your Carrier Furnace Error Codes',
    description: 'Guide generated for your specific Carrier 59SC5A furnace model. Covers common LED error codes and fixes.',
    source: 'ai_generated',
    category: 'HVAC',
    difficulty: 'intermediate',
    timeEstimate: '30 min',
    totalSteps: 8,
    rating: 4.3,
  },
];

export const guideSourceInfo: Record<GuideSource, { name: string; color: string; bgColor: string; icon: string }> = {
  ifixit: { name: 'iFixit', color: 'text-emerald-700', bgColor: 'bg-emerald-50', icon: '🔧' },
  youtube: { name: 'YouTube', color: 'text-red-700', bgColor: 'bg-red-50', icon: '▶️' },
  family_handyman: { name: 'Family Handyman', color: 'text-orange-700', bgColor: 'bg-orange-50', icon: '🏠' },
  this_old_house: { name: 'This Old House', color: 'text-emerald-700', bgColor: 'bg-emerald-50', icon: '🏡' },
  bob_vila: { name: 'Bob Vila', color: 'text-amber-700', bgColor: 'bg-amber-50', icon: '👷' },
  ai_generated: { name: 'AI Generated', color: 'text-emerald-700', bgColor: 'bg-emerald-50', icon: '✨' },
};

export const activeGuides = [
  { id: '1', title: 'Furnace Troubleshooting', progress: 60, totalSteps: 5, completedSteps: 3 },
];

export const guideAnalytics = {
  totalCompleted: 8,
  totalInProgress: 2,
  totalNotStarted: 5,
  averageTime: '28 min',
  timeSaved: '5.2 hours',
  categoryBreakdown: [
    { category: 'HVAC', completed: 4, inProgress: 1, notStarted: 1 },
    { category: 'Plumbing', completed: 2, inProgress: 1, notStarted: 2 },
    { category: 'Electrical', completed: 1, inProgress: 0, notStarted: 1 },
    { category: 'Garage', completed: 1, inProgress: 0, notStarted: 1 },
  ],
};
