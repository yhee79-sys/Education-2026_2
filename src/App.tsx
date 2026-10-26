import React, { useEffect, useState } from 'react';
import { DemographicsStep } from './components/DemographicsStep';
import { Header } from './components/Header';
import { StatsDashboard } from './components/StatsDashboard';
import { SurveyWizard } from './components/SurveyWizard';
import {
  addSampleDataBatch,
  fetchAllEnrichedData,
  loadActiveQuestions,
  submitSurveyAnswers,
} from './lib/supabase';
import {
  AgeGroup,
  ChoiceType,
  EnrichedAnswer,
  Gender,
  Question,
  ResponseRecord,
} from './types/database';
import { Loader2 } from 'lucide-react';

const LOCAL_STORAGE_KEY_HAS_RESPONDED = 'ai_ethics_has_responded_v1';
const LOCAL_STORAGE_KEY_SESSION_ID = 'ai_ethics_session_id_v1';

export default function App() {
  const [currentView, setCurrentView] = useState<'survey' | 'stats'>('survey');
  const [surveySubStep, setSurveySubStep] = useState<'demographics' | 'questions'>('demographics');

  // Questions and analytics data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<ResponseRecord[]>([]);
  const [answers, setAnswers] = useState<EnrichedAnswer[]>([]);
  const [isLiveSupabase, setIsLiveSupabase] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasResponded, setHasResponded] = useState<boolean>(false);

  // User demographic state
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | null>(null);

  // 1. Session ID & Has Responded Check
  useEffect(() => {
    let sessionId = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION_ID);
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(LOCAL_STORAGE_KEY_SESSION_ID, sessionId);
    }

    const responded = localStorage.getItem(LOCAL_STORAGE_KEY_HAS_RESPONDED) === 'true';
    setHasResponded(responded);

    // If URL hash is #stats or user has already responded, route to stats
    if (window.location.hash === '#stats' || responded) {
      setCurrentView('stats');
    }

    const handleHashChange = () => {
      if (window.location.hash === '#stats') {
        setCurrentView('stats');
      } else if (window.location.hash === '#survey') {
        setCurrentView('survey');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 2. Load Questions & Stats
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const qRes = await loadActiveQuestions();
      setQuestions(qRes.questions);
      setIsLiveSupabase(qRes.isLiveSupabase);

      const statsRes = await fetchAllEnrichedData();
      setResponses(statsRes.responses);
      setAnswers(statsRes.enrichedAnswers);
      if (statsRes.isLiveSupabase) {
        setIsLiveSupabase(true);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Navigation handlers
  const handleNavigate = (view: 'survey' | 'stats') => {
    setCurrentView(view);
    window.location.hash = view;
  };

  const handleStartSurveyQuestions = () => {
    if (!selectedGender || !selectedAgeGroup) return;
    setSurveySubStep('questions');
  };

  const handleBackToDemographics = () => {
    setSurveySubStep('demographics');
  };

  // Submit survey responses
  const handleSubmitSurvey = async (
    submittedAnswers: { question_id: string; choice: ChoiceType; reason: string }[]
  ) => {
    if (!selectedGender || !selectedAgeGroup) return;

    let sessionId = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION_ID) || 'anonymous-session';

    const result = await submitSurveyAnswers(
      {
        gender: selectedGender,
        age_group: selectedAgeGroup,
        answers: submittedAnswers,
      },
      sessionId
    );

    if (result.success) {
      localStorage.setItem(LOCAL_STORAGE_KEY_HAS_RESPONDED, 'true');
      setHasResponded(true);

      // Refresh data
      await loadAllData();

      // Navigate to /stats
      handleNavigate('stats');
      setSurveySubStep('demographics');
    }
  };

  // Reset participation
  const handleResetParticipation = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_HAS_RESPONDED);
    setHasResponded(false);
    setSelectedGender(null);
    setSelectedAgeGroup(null);
    setSurveySubStep('demographics');
    handleNavigate('survey');
  };

  // Add sample batch
  const handleAddSampleData = () => {
    addSampleDataBatch(questions);
    loadAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Global Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onResetParticipation={handleResetParticipation}
        hasResponded={hasResponded}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-600">
              {isLiveSupabase ? 'Supabase에서 문항과 통계를 조회하는 중...' : '데이터베이스 로딩 중...'}
            </p>
          </div>
        ) : currentView === 'survey' ? (
          surveySubStep === 'demographics' ? (
            <DemographicsStep
              gender={selectedGender}
              ageGroup={selectedAgeGroup}
              onSelectGender={setSelectedGender}
              onSelectAgeGroup={setSelectedAgeGroup}
              onStartSurvey={handleStartSurveyQuestions}
              onViewStats={() => handleNavigate('stats')}
            />
          ) : (
            <SurveyWizard
              questions={questions}
              gender={selectedGender || '남성'}
              ageGroup={selectedAgeGroup || '20대'}
              onSubmit={handleSubmitSurvey}
              onBackToDemographics={handleBackToDemographics}
            />
          )
        ) : (
          <StatsDashboard
            questions={questions}
            responses={responses}
            answers={answers}
            isLiveSupabase={isLiveSupabase}
            onRefreshData={loadAllData}
            onAddSampleData={handleAddSampleData}
            onRetakeSurvey={handleResetParticipation}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 AI 윤리 딜레마 대국민 여론조사 & 교차분석 플랫폼</p>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={handleResetParticipation}
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              설문 재참여 (초기화)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
