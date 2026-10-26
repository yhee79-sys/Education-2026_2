import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_QUESTIONS } from './constants';
import { generateSeedBundle } from './mockData';
import {
  Answer,
  EnrichedAnswer,
  Question,
  ResponseRecord,
  SurveySubmissionData,
} from '../types/database';

const LOCAL_STORAGE_KEY_RESPONSES = 'ai_ethics_local_responses_v1';
const LOCAL_STORAGE_KEY_ANSWERS = 'ai_ethics_local_answers_v1';
const LOCAL_STORAGE_KEY_QUESTIONS = 'ai_ethics_local_questions_v1';
const LOCAL_STORAGE_KEY_CONFIG = 'ai_ethics_custom_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored Supabase config', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(config));
  currentSupabaseClient = null; // Reset cached client
}

let currentSupabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (currentSupabaseClient) return currentSupabaseClient;

  const { url, anonKey } = getStoredSupabaseConfig();
  if (url && anonKey && url.startsWith('http')) {
    try {
      currentSupabaseClient = createClient(url, anonKey);
      return currentSupabaseClient;
    } catch (err) {
      console.warn('Could not initialize Supabase client:', err);
      return null;
    }
  }
  return null;
}

// Check local storage initialization
function initializeLocalStoreIfNeeded(): {
  questions: Question[];
  responses: ResponseRecord[];
  answers: Answer[];
} {
  let questions: Question[] = [];
  let responses: ResponseRecord[] = [];
  let answers: Answer[] = [];

  try {
    const rawQ = localStorage.getItem(LOCAL_STORAGE_KEY_QUESTIONS);
    if (rawQ) {
      questions = JSON.parse(rawQ);
    }
  } catch {}

  if (!questions || questions.length === 0) {
    questions = [...DEFAULT_QUESTIONS];
    localStorage.setItem(LOCAL_STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
  }

  try {
    const rawR = localStorage.getItem(LOCAL_STORAGE_KEY_RESPONSES);
    const rawA = localStorage.getItem(LOCAL_STORAGE_KEY_ANSWERS);
    if (rawR && rawA) {
      responses = JSON.parse(rawR);
      answers = JSON.parse(rawA);
    }
  } catch {}

  if (!responses || responses.length === 0) {
    const seed = generateSeedBundle(questions[0].id, questions[1].id, questions[2].id);
    responses = seed.responses;
    answers = seed.answers;
    localStorage.setItem(LOCAL_STORAGE_KEY_RESPONSES, JSON.stringify(responses));
    localStorage.setItem(LOCAL_STORAGE_KEY_ANSWERS, JSON.stringify(answers));
  }

  return { questions, responses, answers };
}

/**
 * Loads questions from Supabase (is_active = true, ordered by order_num ASC)
 * Falls back to local store if Supabase is unavailable
 */
export async function loadActiveQuestions(): Promise<{
  questions: Question[];
  isLiveSupabase: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('order_num', { ascending: true });

      if (!error && data && data.length > 0) {
        return { questions: data as Question[], isLiveSupabase: true };
      }
      if (error) {
        console.warn('Supabase questions query error:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase questions fetch failed, falling back to local store', err);
    }
  }

  const { questions } = initializeLocalStoreIfNeeded();
  return {
    questions,
    isLiveSupabase: false,
    error: client ? 'Supabase 테이블 조회 실패 (로컬 데이터로 전환되었습니다)' : undefined,
  };
}

/**
 * Submits survey response & answers.
 * Attempts Supabase first, falls back to local storage.
 */
export async function submitSurveyAnswers(
  submission: SurveySubmissionData,
  sessionId: string
): Promise<{ success: boolean; responseId: string; isLiveSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();
  const now = new Date().toISOString();

  if (client) {
    try {
      // 1. Insert into responses
      const { data: respData, error: respError } = await client
        .from('responses')
        .insert({
          session_id: sessionId,
          gender: submission.gender,
          age_group: submission.age_group,
        })
        .select('id')
        .single();

      if (respError || !respData) {
        throw new Error(respError?.message || 'Failed to insert response');
      }

      const responseId = respData.id;

      // 2. Insert into answers
      const answersPayload = submission.answers.map((ans) => ({
        response_id: responseId,
        question_id: ans.question_id,
        choice: ans.choice,
        reason: ans.reason?.trim() || null,
      }));

      const { error: ansError } = await client.from('answers').insert(answersPayload);

      if (ansError) {
        throw new Error(ansError.message || 'Failed to insert answers');
      }

      // Also mirror locally so offline stats are up to date
      mirrorLocalSubmission(responseId, sessionId, submission, now);

      return { success: true, responseId, isLiveSupabase: true };
    } catch (err: any) {
      console.warn('Supabase submission failed, writing locally instead:', err);
    }
  }

  // Local storage submission fallback
  const localResponseId = `resp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  mirrorLocalSubmission(localResponseId, sessionId, submission, now);

  return { success: true, responseId: localResponseId, isLiveSupabase: false };
}

function mirrorLocalSubmission(
  responseId: string,
  sessionId: string,
  submission: SurveySubmissionData,
  timestamp: string
) {
  const { responses, answers } = initializeLocalStoreIfNeeded();

  const newResponse: ResponseRecord = {
    id: responseId,
    session_id: sessionId,
    gender: submission.gender,
    age_group: submission.age_group,
    created_at: timestamp,
  };

  const newAnswers: Answer[] = submission.answers.map((ans, idx) => ({
    id: `ans-${responseId}-${idx + 1}`,
    response_id: responseId,
    question_id: ans.question_id,
    choice: ans.choice,
    reason: ans.reason?.trim() || null,
    created_at: timestamp,
  }));

  const updatedResponses = [newResponse, ...responses];
  const updatedAnswers = [...newAnswers, ...answers];

  localStorage.setItem(LOCAL_STORAGE_KEY_RESPONSES, JSON.stringify(updatedResponses));
  localStorage.setItem(LOCAL_STORAGE_KEY_ANSWERS, JSON.stringify(updatedAnswers));
}

/**
 * Fetches all responses & answers enriched with demographics.
 */
export async function fetchAllEnrichedData(): Promise<{
  responses: ResponseRecord[];
  enrichedAnswers: EnrichedAnswer[];
  isLiveSupabase: boolean;
}> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const [respResult, ansResult] = await Promise.all([
        client.from('responses').select('*').order('created_at', { ascending: false }),
        client.from('answers').select('*').order('created_at', { ascending: false }),
      ]);

      if (!respResult.error && !ansResult.error && respResult.data && ansResult.data) {
        const responses = respResult.data as ResponseRecord[];
        const answers = ansResult.data as Answer[];

        const respMap = new Map<string, ResponseRecord>();
        responses.forEach((r) => respMap.set(r.id, r));

        const enriched: EnrichedAnswer[] = answers.map((ans) => {
          const resp = respMap.get(ans.response_id);
          return {
            ...ans,
            gender: resp?.gender || '남성',
            age_group: resp?.age_group || '20대',
            session_id: resp?.session_id || 'anonymous',
          };
        });

        return {
          responses,
          enrichedAnswers: enriched,
          isLiveSupabase: true,
        };
      }
    } catch (err) {
      console.warn('Supabase fetchAllEnrichedData failed, using local store', err);
    }
  }

  const { responses, answers } = initializeLocalStoreIfNeeded();
  const respMap = new Map<string, ResponseRecord>();
  responses.forEach((r) => respMap.set(r.id, r));

  const enriched: EnrichedAnswer[] = answers.map((ans) => {
    const resp = respMap.get(ans.response_id);
    return {
      ...ans,
      gender: resp?.gender || '남성',
      age_group: resp?.age_group || '20대',
      session_id: resp?.session_id || 'anonymous',
    };
  });

  return {
    responses,
    enrichedAnswers: enriched,
    isLiveSupabase: false,
  };
}

/**
 * Adds realistic sample batches (for live demonstration or rich local testing)
 */
export function addSampleDataBatch(questions: Question[]): number {
  if (questions.length < 3) return 0;
  const seed = generateSeedBundle(questions[0].id, questions[1].id, questions[2].id);
  const { responses, answers } = initializeLocalStoreIfNeeded();

  // Give new IDs so they don't collide
  const suffix = Date.now().toString(36);
  const newResponses = seed.responses.map((r, i) => ({
    ...r,
    id: `${r.id}-${suffix}-${i}`,
  }));

  const idMap = new Map<string, string>();
  seed.responses.forEach((r, i) => idMap.set(r.id, newResponses[i].id));

  const newAnswers = seed.answers.map((a, i) => ({
    ...a,
    id: `${a.id}-${suffix}-${i}`,
    response_id: idMap.get(a.response_id) || a.response_id,
  }));

  localStorage.setItem(
    LOCAL_STORAGE_KEY_RESPONSES,
    JSON.stringify([...newResponses, ...responses])
  );
  localStorage.setItem(
    LOCAL_STORAGE_KEY_ANSWERS,
    JSON.stringify([...newAnswers, ...answers])
  );

  return newResponses.length;
}

/**
 * Resets local test data
 */
export function resetLocalData(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY_RESPONSES);
  localStorage.removeItem(LOCAL_STORAGE_KEY_ANSWERS);
  localStorage.removeItem(LOCAL_STORAGE_KEY_QUESTIONS);
  initializeLocalStoreIfNeeded();
}
