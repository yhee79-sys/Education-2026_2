import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react';
import { AgeGroup, ChoiceType, Gender, Question } from '../types/database';

interface SurveyWizardProps {
  questions: Question[];
  gender: Gender;
  ageGroup: AgeGroup;
  onSubmit: (answers: { question_id: string; choice: ChoiceType; reason: string }[]) => Promise<void>;
  onBackToDemographics: () => void;
}

export const SurveyWizard: React.FC<SurveyWizardProps> = ({
  questions,
  gender,
  ageGroup,
  onSubmit,
  onBackToDemographics,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { choice: ChoiceType | null; reason: string }>
  >(() => {
    const init: Record<string, { choice: ChoiceType | null; reason: string }> = {};
    questions.forEach((q) => {
      init[q.id] = { choice: null, reason: '' };
    });
    return init;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;
  const currentChoice = currentAnswer?.choice || null;
  const currentReason = currentAnswer?.reason || '';

  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleSelectChoice = (choice: ChoiceType) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        choice,
        reason: prev[currentQ.id]?.reason || '',
      },
    }));
  };

  const handleChangeReason = (text: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        choice: prev[currentQ.id]?.choice || null,
        reason: text,
      },
    }));
  };

  const handleNext = () => {
    if (!currentChoice) return;
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBackToDemographics();
    }
  };

  const handleSubmit = async () => {
    // Validate that all questions have a choice selected
    for (const q of questions) {
      if (!answers[q.id]?.choice) {
        setErrorMessage(`문항 ${q.order_num}번의 선택지를 골라주세요.`);
        return;
      }
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload = questions.map((q) => ({
        question_id: q.id,
        choice: answers[q.id].choice as ChoiceType,
        reason: answers[q.id].reason || '',
      }));

      await onSubmit(payload);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      setErrorMessage(err?.message || '답변 제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setIsSubmitting(false);
    }
  };

  if (!currentQ) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
        <p className="text-sm text-slate-500">문항 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4">
      {/* Top Header & Progress Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-full text-xs font-bold">
              단계 {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-slate-500 font-medium">
              진행률 {progressPercent}%
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full text-[11px]">
            <span>참여자 프로필:</span>
            <span className="font-semibold text-slate-800">
              {gender} · {ageGroup}
            </span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-150 transition-all">
        {/* Question Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            문항 {currentQ.order_num}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {currentQ.title}
          </h2>

          {/* Scenario Box */}
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm sm:text-base text-slate-700 leading-relaxed">
            <p className="font-medium text-slate-800 mb-1 flex items-center gap-1.5 text-xs text-indigo-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> 시나리오 배경
            </p>
            {currentQ.scenario}
          </div>
        </div>

        {/* Choice A & B Selection Section */}
        <div className="space-y-3.5 mb-6">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            당신의 선택은 무엇입니까? <span className="text-rose-500">*</span>
          </p>

          {/* Choice A Card */}
          <button
            type="button"
            onClick={() => handleSelectChoice('A')}
            className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
              currentChoice === 'A'
                ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                currentChoice === 'A'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {currentChoice === 'A' ? <Check className="w-4 h-4" /> : 'A'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-indigo-900">선택지 A</span>
                {currentChoice === 'A' && (
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                    선택 완료
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                {currentQ.choice_a_label}
              </p>
            </div>
          </button>

          {/* Choice B Card */}
          <button
            type="button"
            onClick={() => handleSelectChoice('B')}
            className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start gap-3.5 ${
              currentChoice === 'B'
                ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                currentChoice === 'B'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {currentChoice === 'B' ? <Check className="w-4 h-4" /> : 'B'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-indigo-900">선택지 B</span>
                {currentChoice === 'B' && (
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                    선택 완료
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                {currentQ.choice_b_label}
              </p>
            </div>
          </button>
        </div>

        {/* Subjective Reason Input (Optional) */}
        <div className="mt-6 pt-5 border-t border-slate-150">
          <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              선택하신 이유를 적어주세요 <span className="text-slate-400 font-normal">(선택 사항)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              {currentReason.length} / 500자
            </span>
          </label>
          <textarea
            rows={3}
            maxLength={500}
            value={currentReason}
            onChange={(e) => handleChangeReason(e.target.value)}
            placeholder="예: 다수의 생명 보호가 자율주행 알고리즘의 최우선 원칙이어야 한다고 생각합니다..."
            className="w-full text-sm p-3.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400 leading-relaxed resize-none"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            * 작성하신 서술형 의견은 분석 후 워드 클라우드 키워드 및 익명 피드에 반영됩니다.
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrev}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentIndex === 0 ? '인적사항 변경' : '이전 문항'}</span>
          </button>

          {isLastQuestion ? (
            <button
              type="button"
              disabled={!currentChoice || isSubmitting}
              onClick={handleSubmit}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md ${
                currentChoice && !isSubmitting
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25 active:scale-95 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>결과 저장 중...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>결과 제출하고 통계 보기</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={!currentChoice}
              onClick={handleNext}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md ${
                currentChoice
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 active:scale-95 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>다음 문항</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
