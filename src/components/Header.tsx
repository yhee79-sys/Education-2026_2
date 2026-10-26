import React, { useState } from 'react';
import {
  BarChart3,
  Bot,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'survey' | 'stats';
  onNavigate: (view: 'survey' | 'stats') => void;
  onResetParticipation: () => void;
  hasResponded: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onResetParticipation,
  hasResponded,
}) => {
  const [resetFeedback, setResetFeedback] = useState(false);

  const handleReset = () => {
    onResetParticipation();
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onNavigate('survey')}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  AI 윤리 딜레마
                </span>
                <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-150 hidden sm:inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> 대국민 여론조사
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                성별·연령별 교차 필터 통계 및 서술형 분석
              </p>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => onNavigate('survey')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'survey'
                ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>설문 참여</span>
            {hasResponded && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="참여 완료" />
            )}
          </button>
          <button
            onClick={() => onNavigate('stats')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'stats'
                ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>통계 분석 (/stats)</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Reset Participation flag */}
          <button
            onClick={handleReset}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              resetFeedback
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
            }`}
            title="로컬 참여 기록을 초기화하여 다시 설문에 참여합니다"
          >
            {resetFeedback ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">초기화 완료!</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">참여 초기화</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
