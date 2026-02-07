// TypeScript Version - Full type safety
// Catches errors at compile time, excellent IDE support

// Type definitions
export type Dimension = 'EI' | 'SN' | 'TF' | 'JP' | 'AT';
export type Direction = 1 | -1;
export type Response = 1 | 2 | 3 | 4 | 5;
export type PersonalityLetter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
export type Identity = 'A' | 'T';
export type BasePersonalityType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';
export type PersonalityType = `${BasePersonalityType}-${Identity}`;

export interface Question {
  text: string;
  dimension: Dimension;
  direction: Direction;
}

export interface Scores {
  EI: number;
  SN: number;
  TF: number;
  JP: number;
  AT: number;
}

export interface DimensionResult {
  name: string;
  percentage: number;
  score: number;
}

export interface PersonalityResult {
  baseDescription: string;
  identityDescription: string;
  fullType: PersonalityType;
}

// Questions data
export const QUESTIONS: Question[] = [
  // Extraversion (E) vs Introversion (I) - 11 questions
  { text: "You feel comfortable just walking up to someone you find interesting and striking up a conversation.", dimension: "EI", direction: 1 },
  { text: "You rarely worry about whether you make a good impression on people you meet.", dimension: "EI", direction: 1 },
  { text: "You enjoy participating in team-based activities.", dimension: "EI", direction: 1 },
  { text: "You enjoy solitary hobbies or activities more than group ones.", dimension: "EI", direction: -1 },
  { text: "You usually wait for others to introduce themselves first at social gatherings.", dimension: "EI", direction: -1 },
  { text: "You usually prefer to be around others rather than on your own.", dimension: "EI", direction: 1 },
  { text: "Your friends would describe you as lively and outgoing.", dimension: "EI", direction: 1 },
  { text: "You avoid making phone calls.", dimension: "EI", direction: -1 },
  { text: "You can easily connect with people you have just met.", dimension: "EI", direction: 1 },
  { text: "You would love a job that requires you to work alone most of the time.", dimension: "EI", direction: -1 },
  { text: "You feel more drawn to busy, bustling atmospheres than to quiet, intimate places.", dimension: "EI", direction: 1 },

  // Sensing (S) vs Intuition (N) - 11 questions
  { text: "You are not too interested in discussions about various interpretations of creative works.", dimension: "SN", direction: 1 },
  { text: "You enjoy experimenting with new and untested approaches.", dimension: "SN", direction: -1 },
  { text: "You actively seek out new experiences and knowledge areas to explore.", dimension: "SN", direction: -1 },
  { text: "You cannot imagine yourself writing fictional stories for a living.", dimension: "SN", direction: 1 },
  { text: "You become bored or lose interest when the discussion gets highly theoretical.", dimension: "SN", direction: 1 },
  { text: "You are drawn to various forms of creative expression, such as writing.", dimension: "SN", direction: -1 },
  { text: "You enjoy exploring unfamiliar ideas and viewpoints.", dimension: "SN", direction: -1 },
  { text: "You are not too interested in discussing theories on what the world could look like in the future.", dimension: "SN", direction: 1 },
  { text: "You believe that pondering abstract philosophical questions is a waste of time.", dimension: "SN", direction: 1 },
  { text: "You prefer tasks that require you to come up with creative solutions rather than follow concrete steps.", dimension: "SN", direction: -1 },
  { text: "You enjoy debating ethical dilemmas.", dimension: "SN", direction: -1 },

  // Thinking (T) vs Feeling (F) - 11 questions
  { text: "People's stories and emotions speak louder to you than numbers or data.", dimension: "TF", direction: -1 },
  { text: "You prioritize facts over people's feelings when determining a course of action.", dimension: "TF", direction: 1 },
  { text: "You prioritize being sensitive over being completely honest.", dimension: "TF", direction: -1 },
  { text: "You favor efficiency in decisions, even if it means disregarding some emotional aspects.", dimension: "TF", direction: 1 },
  { text: "In disagreements, you prioritize proving your point over preserving the feelings of others.", dimension: "TF", direction: 1 },
  { text: "You are not easily swayed by emotional arguments.", dimension: "TF", direction: 1 },
  { text: "When facts and feelings conflict, you usually find yourself following your heart.", dimension: "TF", direction: -1 },
  { text: "You usually base your choices on objective facts rather than emotional impressions.", dimension: "TF", direction: 1 },
  { text: "When making decisions, you focus more on how the affected people might feel than on what is most logical or efficient.", dimension: "TF", direction: -1 },
  { text: "If a decision feels right to you, you often act on it without needing further proof.", dimension: "TF", direction: -1 },
  { text: "You are more likely to rely on emotional intuition than logical reasoning when making a choice.", dimension: "TF", direction: -1 },

  // Judging (J) vs Perceiving (P) - 11 questions
  { text: "You prioritize and plan tasks effectively, often completing them well before the deadline.", dimension: "JP", direction: 1 },
  { text: "You like to use organizing tools like schedules and lists.", dimension: "JP", direction: 1 },
  { text: "You often allow the day to unfold without any schedule at all.", dimension: "JP", direction: -1 },
  { text: "You prefer to do your chores before allowing yourself to relax.", dimension: "JP", direction: 1 },
  { text: "You often end up doing things at the last possible moment.", dimension: "JP", direction: -1 },
  { text: "You find it challenging to maintain a consistent work or study schedule.", dimension: "JP", direction: -1 },
  { text: "You like to have a to-do list for each day.", dimension: "JP", direction: 1 },
  { text: "If your plans are interrupted, your top priority is to get back on track as soon as possible.", dimension: "JP", direction: 1 },
  { text: "Your personal work style is closer to spontaneous bursts of energy than organized and consistent efforts.", dimension: "JP", direction: -1 },
  { text: "You complete things methodically without skipping over any steps.", dimension: "JP", direction: 1 },
  { text: "You struggle with deadlines.", dimension: "JP", direction: -1 },

  // Assertive (A) vs Turbulent (T) - 10 questions
  { text: "Even a small mistake can cause you to doubt your overall abilities and knowledge.", dimension: "AT", direction: -1 },
  { text: "You are prone to worrying that things will take a turn for the worse.", dimension: "AT", direction: -1 },
  { text: "Your mood can change very quickly.", dimension: "AT", direction: -1 },
  { text: "You rarely second-guess the choices that you have made.", dimension: "AT", direction: 1 },
  { text: "You rarely feel insecure.", dimension: "AT", direction: 1 },
  { text: "You are still bothered by mistakes that you made a long time ago.", dimension: "AT", direction: -1 },
  { text: "Your emotions control you more than you control them.", dimension: "AT", direction: -1 },
  { text: "When someone thinks highly of you, you wonder how long it will take them to feel disappointed in you.", dimension: "AT", direction: -1 },
  { text: "You often feel overwhelmed.", dimension: "AT", direction: -1 },
  { text: "You feel confident that things will work out for you.", dimension: "AT", direction: 1 },
];

export const PERSONALITY_DESCRIPTIONS: Record<BasePersonalityType, string> = {
  INTJ: "The Architect - Strategic, innovative, and independent thinkers with a plan for everything.",
  INTP: "The Logician - Innovative inventors with an unquenchable thirst for knowledge.",
  ENTJ: "The Commander - Bold, imaginative, and strong-willed leaders who find a way or make one.",
  ENTP: "The Debater - Smart and curious thinkers who love intellectual challenges.",
  INFJ: "The Advocate - Quiet and mystical, yet inspiring and idealistic.",
  INFP: "The Mediator - Poetic, kind, and altruistic, always eager to help a good cause.",
  ENFJ: "The Protagonist - Charismatic and inspiring leaders, able to mesmerize their listeners.",
  ENFP: "The Campaigner - Enthusiastic, creative, and sociable free spirits.",
  ISTJ: "The Logistician - Practical and fact-minded, reliable and dependable.",
  ISFJ: "The Defender - Dedicated and warm protectors, always ready to defend loved ones.",
  ESTJ: "The Executive - Excellent administrators, unsurpassed at managing things and people.",
  ESFJ: "The Consul - Extraordinarily caring, social, and popular people, always eager to help.",
  ISTP: "The Virtuoso - Bold and practical experimenters, masters of all kinds of tools.",
  ISFP: "The Adventurer - Flexible and charming artists, always ready to explore and experience something new.",
  ESTP: "The Entrepreneur - Smart, energetic, and perceptive, living on the edge.",
  ESFP: "The Entertainer - Spontaneous, energetic, and enthusiastic people who love life around them.",
};

export const IDENTITY_DESCRIPTIONS: Record<Identity, string> = {
  A: "Assertive: Confident, emotionally stable, and resistant to stress.",
  T: "Turbulent: Self-conscious, sensitive to stress, and success-driven.",
};

// Calculate score from response (1-5 scale)
export function calculateScore(response: Response, direction: Direction): number {
  // Convert 1-5 to -10 to +10
  return (response - 3) * 5 * direction;
}

// Initialize empty scores object
export function initializeScores(): Scores {
  return {
    EI: 0,
    SN: 0,
    TF: 0,
    JP: 0,
    AT: 0,
  };
}

// Calculate personality type from scores
export function calculatePersonalityType(scores: Scores): PersonalityType {
  let type = "";

  type += scores.EI >= 0 ? "E" : "I";
  type += scores.SN >= 0 ? "S" : "N";
  type += scores.TF >= 0 ? "T" : "F";
  type += scores.JP >= 0 ? "J" : "P";
  type += scores.AT >= 0 ? "-A" : "-T";

  return type as PersonalityType;
}

// Calculate percentage strength for a dimension
export function calculatePercentage(score: number, numQuestions: number): number {
  const maxScore = numQuestions * 10;
  return Math.min(100, Math.max(0, Math.floor((Math.abs(score) / maxScore) * 100)));
}

// Get dimension breakdown with percentages
export function getDimensionBreakdown(scores: Scores): DimensionResult[] {
  return [
    {
      name: scores.EI >= 0 ? "Extraversion (E)" : "Introversion (I)",
      percentage: calculatePercentage(scores.EI, 11),
      score: scores.EI,
    },
    {
      name: scores.SN >= 0 ? "Sensing (S)" : "Intuition (N)",
      percentage: calculatePercentage(scores.SN, 11),
      score: scores.SN,
    },
    {
      name: scores.TF >= 0 ? "Thinking (T)" : "Feeling (F)",
      percentage: calculatePercentage(scores.TF, 11),
      score: scores.TF,
    },
    {
      name: scores.JP >= 0 ? "Judging (J)" : "Perceiving (P)",
      percentage: calculatePercentage(scores.JP, 11),
      score: scores.JP,
    },
    {
      name: scores.AT >= 0 ? "Assertive (A)" : "Turbulent (T)",
      percentage: calculatePercentage(scores.AT, 10),
      score: scores.AT,
    },
  ];
}

// Get personality description
export function getPersonalityDescription(personalityType: PersonalityType): PersonalityResult {
  const baseType = personalityType.split("-")[0] as BasePersonalityType;
  const identity = personalityType.endsWith("-A") ? "A" : "T";

  return {
    baseDescription: PERSONALITY_DESCRIPTIONS[baseType],
    identityDescription: IDENTITY_DESCRIPTIONS[identity],
    fullType: personalityType,
  };
}
