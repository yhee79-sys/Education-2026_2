import React from 'react';
import { ArrowRight, BarChart3, Check, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { AGE_GROUPS, GENDERS } from '../lib/constants';
import { AgeGroup, Gender } from '../types/database';

interface DemographicsStepProps {
  gender: Gender | null;
  ageGroup: AgeGroup | null;
  onSelectGender: (g: Gender) => void;
  onSelectAgeGroup: (a: AgeGroup) => void;
  onStartSurvey: () => void;
  onViewStats: () => void;
}

export const DemographicsStep: React.FC<DemographicsStepProps> = ({
  gender,
  ageGroup,
  onSelectGender,
  onSelectAgeGroup,
  onStartSurvey,
  onViewStats,
}) => {
  const isComplete = Boolean(gender && ageGroup);

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-150 text-center">
        {/* Intro Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>익명 참여 여론조사 (No-Auth)</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          AI 윤리 딜레마 <br className="sm:hidden" />
          대국민 여론조사
        </h1>
        <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          인공지능 기술의 급격한 발전 속에서 마주하는 세 가지 윤리적 난제,
          당신의 선택과 가치관을 공유해 주세요.
        </p>

        {/* Demographics Selection Form */}
        <div className="mt-8 text-left space-y-6">
          {/* Gender */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              <span>1. 성별을 선택해 주세요 <span className="text-rose-500">*</span></span>
              {gender && <span className="text-indigo-600 font-semibold">{gender} 선택됨</span>}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {GENDERS.map((g) => {
                const selected = gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onSelectGender(g)}
                    className={`relative p-3.5 rounded-2xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      selected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{g}</span>
                    {selected && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age Group */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              <span>2. 연령대를 선택해 주세요 <span className="text-rose-500">*</span></span>
              {ageGroup && <span className="text-indigo-600 font-semibold">{ageGroup} 선택됨</span>}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AGE_GROUPS.map((ag) => {
                const selected = ageGroup === ag;
                return (
                  <button
                    key={ag}
                    type="button"
                    onClick={() => onSelectAgeGroup(ag)}
                    className={`relative py-3 px-2 rounded-xl border text-xs sm:text-sm font-medium transition-all text-center ${
                      selected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-semibold shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {ag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              본 설문은 성명, 전화번호 등 개인식별정보를 일절 수집하지 않으며,
              오직 성별·연령별 통계 교차 분석에만 활용됩니다.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-2.5">
          <button
            type="button"
            disabled={!isComplete}
            onClick={onStartSurvey}
            className={`w-full py-3.5 px-6 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
              isComplete
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 active:scale-[0.99] cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>설문 시작하기 (3개 문항)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onViewStats}
            className="w-full py-2.5 px-4 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>설문 참여 없이 현재 통계 결과 먼저 확인하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
