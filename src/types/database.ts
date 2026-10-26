export type Gender = '남성' | '여성';

export type AgeGroup =
  | '10대 미만'
  | '10대'
  | '20대'
  | '30대'
  | '40대'
  | '50대'
  | '60대 이상';

export type ChoiceType = 'A' | 'B';

export interface Question {
  id: string;
  order_num: number;
  title: string;
  scenario: string;
  choice_a_label: string;
  choice_b_label: string;
  is_active: boolean;
  created_at?: string;
}

export interface ResponseRecord {
  id: string;
  session_id: string;
  gender: Gender;
  age_group: AgeGroup;
  created_at: string;
}

export interface Answer {
  id: string;
  response_id: string;
  question_id: string;
  choice: ChoiceType;
  reason: string | null;
  created_at: string;
}

export interface SurveySubmissionData {
  gender: Gender;
  age_group: AgeGroup;
  answers: {
    question_id: string;
    choice: ChoiceType;
    reason?: string;
  }[];
}

export interface EnrichedAnswer extends Answer {
  gender: Gender;
  age_group: AgeGroup;
  session_id: string;
}

export interface FilterState {
  gender: '전체' | Gender;
  age_group: '전체' | AgeGroup;
}

export interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
}
