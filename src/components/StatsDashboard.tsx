import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart2,
  CheckCircle,
  Filter,
  Flame,
  Hash,
  Heart,
  Layers,
  MessageSquare,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react';
import { AGE_GROUPS, GENDERS } from '../lib/constants';
import { extractTopKeywords } from '../lib/nlp';
import {
  AgeGroup,
  ChoiceType,
  EnrichedAnswer,
  FilterState,
  Gender,
  Question,
  ResponseRecord,
} from '../types/database';

interface StatsDashboardProps {
  questions: Question[];
  responses: ResponseRecord[];
  answers: EnrichedAnswer[];
  isLiveSupabase: boolean;
  onRefreshData: () => Promise<void>;
  onAddSampleData: () => void;
  onRetakeSurvey: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  questions,
  responses,
  answers,
  isLiveSupabase,
  onRefreshData,
  onAddSampleData,
  onRetakeSurvey,
}) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    questions[0]?.id || ''
  );
  const [filters, setFilters] = useState<FilterState>({
    gender: '전체',
    age_group: '전체',
  });
  const [feedChoiceFilter, setFeedChoiceFilter] = useState<'ALL' | 'A' | 'B'>('ALL');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [likedAnswers, setLikedAnswers] = useState<Set<string>>(new Set());
  const [sampleSuccessNotice, setSampleSuccessNotice] = useState<string | null>(null);

  // Active Question
  const activeQuestion = useMemo(() => {
    return questions.find((q) => q.id === selectedQuestionId) || questions[0];
  }, [questions, selectedQuestionId]);

  // Handle data refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshData();
    setIsRefreshing(false);
  };

  const handleAddSample = () => {
    onAddSampleData();
    setSampleSuccessNotice('다양한 인구통계학적 표본 응답이 추가되었습니다!');
    setTimeout(() => setSampleSuccessNotice(null), 3000);
  };

  const handleToggleLike = (id: string) => {
    setLikedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered answers for the current question
  const filteredQuestionAnswers = useMemo(() => {
    if (!activeQuestion) return [];

    return answers.filter((ans) => {
      if (ans.question_id !== activeQuestion.id) return false;
      if (filters.gender !== '전체' && ans.gender !== filters.gender) return false;
      if (filters.age_group !== '전체' && ans.age_group !== filters.age_group) return false;
      return true;
    });
  }, [answers, activeQuestion, filters]);

  // Metrics calculation
  const totalN = filteredQuestionAnswers.length;
  const countA = filteredQuestionAnswers.filter((a) => a.choice === 'A').length;
  const countB = filteredQuestionAnswers.filter((a) => a.choice === 'B').length;

  const percentA = totalN > 0 ? Math.round((countA / totalN) * 1000) / 10 : 50;
  const percentB = totalN > 0 ? Math.round((countB / totalN) * 1000) / 10 : 50;

  // Demographic subgroup analysis (Gender breakdown)
  const genderBreakdown = useMemo(() => {
    const maleAnswers = answers.filter(
      (a) => a.question_id === activeQuestion?.id && a.gender === '남성'
    );
    const femaleAnswers = answers.filter(
      (a) => a.question_id === activeQuestion?.id && a.gender === '여성'
    );

    const calc = (list: EnrichedAnswer[]) => {
      const n = list.length;
      if (n === 0) return { n: 0, aPct: 0, bPct: 0 };
      const aCount = list.filter((x) => x.choice === 'A').length;
      return {
        n,
        aPct: Math.round((aCount / n) * 100),
        bPct: Math.round(((n - aCount) / n) * 100),
      };
    };

    return {
      male: calc(maleAnswers),
      female: calc(femaleAnswers),
    };
  }, [answers, activeQuestion]);

  // Demographic subgroup analysis (Age breakdown)
  const ageBreakdown = useMemo(() => {
    return AGE_GROUPS.map((ag) => {
      const agAnswers = answers.filter(
        (a) => a.question_id === activeQuestion?.id && a.age_group === ag
      );
      const n = agAnswers.length;
      const aCount = agAnswers.filter((x) => x.choice === 'A').length;
      return {
        ageGroup: ag,
        n,
        aPct: n > 0 ? Math.round((aCount / n) * 100) : 0,
        bPct: n > 0 ? Math.round(((n - aCount) / n) * 100) : 0,
      };
    });
  }, [answers, activeQuestion]);

  // Top Word Frequencies (워드 카운트 유목화)
  const topKeywords = useMemo(() => {
    const reasons = filteredQuestionAnswers.map((a) => a.reason);
    return extractTopKeywords(reasons, 8);
  }, [filteredQuestionAnswers]);

  // Filtered Subjective Feed
  const feedItems = useMemo(() => {
    return filteredQuestionAnswers
      .filter((ans) => {
        // Choice filter
        if (feedChoiceFilter === 'A' && ans.choice !== 'A') return false;
        if (feedChoiceFilter === 'B' && ans.choice !== 'B') return false;

        // Keyword filter
        if (selectedKeyword && (!ans.reason || !ans.reason.includes(selectedKeyword))) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchReason = ans.reason?.toLowerCase().includes(q);
          const matchGender = ans.gender.includes(q);
          const matchAge = ans.age_group.includes(q);
          return matchReason || matchGender || matchAge;
        }

        return true;
      })
      .filter((ans) => Boolean(ans.reason && ans.reason.trim().length > 0));
  }, [filteredQuestionAnswers, feedChoiceFilter, selectedKeyword, searchQuery]);

  const hasActiveFilters = filters.gender !== '전체' || filters.age_group !== '전체';

  const resetFilters = () => {
    setFilters({ gender: '전체', age_group: '전체' });
    setSelectedKeyword(null);
    setSearchQuery('');
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg shadow-slate-200/40 border border-slate-150">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <BarChart2 className="w-3.5 h-3.5" /> 실시간 분석 대시보드
              </span>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                전체 유효 응답자: <strong className="text-slate-900">{responses.length}명</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI 윤리 딜레마 교차 통계 분석
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              성별·연령대별 인구통계학적 교차 필터링 및 서술형 자연어 유목화 분석
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              title="데이터 새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>

            <button
              onClick={handleAddSample}
              className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              title="통계 분석용 샘플 데이터 추가"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>샘플 응답 추가 (+12)</span>
            </button>

            <button
              onClick={onRetakeSurvey}
              className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>초기화 후 재참여</span>
            </button>
          </div>
        </div>

        {sampleSuccessNotice && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sampleSuccessNotice}</span>
          </div>
        )}

        {/* Question Switcher Tabs */}
        <div className="mt-5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            분석 대상 문항 선택
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {questions.map((q) => {
              const isSelected = q.id === activeQuestion?.id;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestionId(q.id);
                    setSelectedKeyword(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-xs ring-2 ring-indigo-500/15'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      문항 0{q.order_num}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold truncate">
                    {q.title}
                  </h4>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Question Context Banner */}
      {activeQuestion && (
        <div className="bg-indigo-900 text-white rounded-3xl p-5 sm:p-6 shadow-md shadow-indigo-950/10">
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold mb-1">
            <span className="bg-indigo-700/80 px-2 py-0.5 rounded text-[11px]">
              문항 0{activeQuestion.order_num} 시나리오
            </span>
            <span>{activeQuestion.title}</span>
          </div>
          <p className="text-sm sm:text-base text-indigo-50 font-medium leading-relaxed mt-2">
            "{activeQuestion.scenario}"
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-indigo-800/80 text-xs">
            <div className="bg-indigo-950/50 p-2.5 rounded-xl border border-indigo-800/50">
              <span className="font-bold text-indigo-300 block mb-0.5">선택 A</span>
              <span className="text-indigo-100">{activeQuestion.choice_a_label}</span>
            </div>
            <div className="bg-indigo-950/50 p-2.5 rounded-xl border border-indigo-800/50">
              <span className="font-bold text-indigo-300 block mb-0.5">선택 B</span>
              <span className="text-indigo-100">{activeQuestion.choice_b_label}</span>
            </div>
          </div>
        </div>
      )}

      {/* CROSS-FILTER CONTROLLER */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-lg shadow-slate-200/40 border border-slate-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                교차 필터 컨트롤러 (Cross-Filter)
              </h3>
              <p className="text-xs text-slate-500">
                원하는 인구통계학적 세부 집단을 선택하여 통계와 의견을 즉시 재계산합니다.
              </p>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>필터 초기화</span>
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Gender Filter */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              성별 필터
            </label>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(['전체', '남성', '여성'] as const).map((g) => {
                const active = filters.gender === g;
                return (
                  <button
                    key={g}
                    onClick={() => setFilters((prev) => ({ ...prev, gender: g }))}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      active
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age Group Filter */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              연령대 필터
            </label>
            <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
              {(['전체', ...AGE_GROUPS] as const).map((ag) => {
                const active = filters.age_group === ag;
                return (
                  <button
                    key={ag}
                    onClick={() => setFilters((prev) => ({ ...prev, age_group: ag }))}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      active
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {ag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Filter Status Badge */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">현재 적용된 조건:</span>
            <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
              성별: {filters.gender}
            </span>
            <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
              연령: {filters.age_group}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-150">
            <Users className="w-3.5 h-3.5" />
            <span>필터링된 표본 모수 (N = {totalN}명)</span>
          </div>
        </div>
      </div>

      {/* STATISTICAL VISUALIZATION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Ratio Card (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/40 border border-slate-150 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <span>A / B 선택 비율 통계</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              모수 N = {totalN}명 기준
            </span>
          </div>

          {totalN === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">선택하신 필터 조건에 부합하는 응답 데이터가 없습니다.</p>
              <button
                onClick={resetFilters}
                className="mt-3 text-xs text-indigo-600 font-bold hover:underline"
              >
                필터 초기화하기
              </button>
            </div>
          ) : (
            <>
              {/* Custom Split Gauge Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-indigo-700 flex items-center gap-1">
                    선택 A ({countA}명 · {percentA}%)
                  </span>
                  <span className="text-violet-700 flex items-center gap-1">
                    선택 B ({countB}명 · {percentB}%)
                  </span>
                </div>

                <div className="h-7 w-full bg-slate-100 rounded-2xl overflow-hidden flex p-1 shadow-inner border border-slate-200/80">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-l-xl transition-all duration-500 ease-out flex items-center justify-start pl-3 text-white text-[11px] font-bold overflow-hidden"
                    style={{ width: `${percentA}%` }}
                  >
                    {percentA >= 15 && `A ${percentA}%`}
                  </div>
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-r-xl transition-all duration-500 ease-out flex items-center justify-end pr-3 text-white text-[11px] font-bold overflow-hidden"
                    style={{ width: `${percentB}%` }}
                  >
                    {percentB >= 15 && `B ${percentB}%`}
                  </div>
                </div>
              </div>

              {/* Cards for Choice A & B */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-150">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-700 px-2 py-0.5 rounded bg-indigo-100">
                      선택지 A
                    </span>
                    <span className="text-2xl font-black text-indigo-900">
                      {percentA}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {activeQuestion?.choice_a_label}
                  </p>
                  <p className="text-[11px] text-indigo-600 font-bold mt-2">
                    총 {countA}명 선택
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-150">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-violet-700 px-2 py-0.5 rounded bg-violet-100">
                      선택지 B
                    </span>
                    <span className="text-2xl font-black text-violet-900">
                      {percentB}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {activeQuestion?.choice_b_label}
                  </p>
                  <p className="text-[11px] text-violet-600 font-bold mt-2">
                    총 {countB}명 선택
                  </p>
                </div>
              </div>

              {/* Gender Comparison Sub-analysis */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  성별 응답 비교 (전체 표본 기준)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                      <span>남성 (N={genderBreakdown.male.n})</span>
                      <span className="text-indigo-600">A {genderBreakdown.male.aPct}% : B {genderBreakdown.male.bPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden flex">
                      <div className="bg-indigo-600 h-full" style={{ width: `${genderBreakdown.male.aPct}%` }} />
                      <div className="bg-violet-500 h-full" style={{ width: `${genderBreakdown.male.bPct}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                      <span>여성 (N={genderBreakdown.female.n})</span>
                      <span className="text-indigo-600">A {genderBreakdown.female.aPct}% : B {genderBreakdown.female.bPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden flex">
                      <div className="bg-indigo-600 h-full" style={{ width: `${genderBreakdown.female.aPct}%` }} />
                      <div className="bg-violet-500 h-full" style={{ width: `${genderBreakdown.female.bPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Age Breakdown Chart (1 col) */}
        <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/40 border border-slate-150 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>연령대별 선택 분포</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              연령대별 A/B 선택 비율 비교
            </p>

            <div className="space-y-3">
              {ageBreakdown.map((item) => (
                <div key={item.ageGroup} className="text-xs">
                  <div className="flex justify-between items-center mb-1 text-slate-700">
                    <span className="font-semibold">{item.ageGroup}</span>
                    <span className="text-[11px] text-slate-500">
                      N={item.n} ({item.aPct}% vs {item.bPct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex border border-slate-200/60">
                    {item.n > 0 ? (
                      <>
                        <div
                          className="bg-indigo-600 h-full"
                          style={{ width: `${item.aPct}%` }}
                        />
                        <div
                          className="bg-violet-500 h-full"
                          style={{ width: `${item.bPct}%` }}
                        />
                      </>
                    ) : (
                      <div className="w-full bg-slate-200 text-transparent" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" /> 선택 A
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" /> 선택 B
            </span>
          </div>
        </div>
      </div>

      {/* WORD COUNT CLUSTERING (워드 카운트 유목화) */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/40 border border-slate-150">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <Flame className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                서술형 키워드 유목화 분석 (Word Frequency Top 8)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              한국어 불용어 및 조사를 제거하고 빈도수가 가장 높은 핵심 어휘를 추출했습니다. 키워드를 클릭하면 해당 피드가 필터링됩니다.
            </p>
          </div>

          {selectedKeyword && (
            <button
              onClick={() => setSelectedKeyword(null)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg self-start sm:self-auto"
            >
              키워드 필터 해제 ('{selectedKeyword}')
            </button>
          )}
        </div>

        <div className="mt-4">
          {topKeywords.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              현재 필터 조건에 작성된 서술형 이유가 충분하지 않습니다.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {topKeywords.map((kw, idx) => {
                const isSelected = selectedKeyword === kw.word;
                return (
                  <button
                    key={kw.word}
                    onClick={() =>
                      setSelectedKeyword(isSelected ? null : kw.word)
                    }
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-600'
                        : 'bg-slate-50 text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isSelected
                          ? 'bg-white text-indigo-700'
                          : idx < 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold">{kw.word}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {kw.count}회
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SUBJECTIVE REASON FEED (서술형 피드) */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/40 border border-slate-150 space-y-4">
        {/* Header & Feed Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                응답자 서술형 피드
              </h3>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                {feedItems.length}건
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              응답자들이 직접 작성한 생생한 윤리적 고뇌와 선택의 이유
            </p>
          </div>

          {/* Sub-filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Choice Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFeedChoiceFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  feedChoiceFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFeedChoiceFilter('A')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  feedChoiceFilter === 'A'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                선택 A
              </button>
              <button
                onClick={() => setFeedChoiceFilter('B')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  feedChoiceFilter === 'B'
                    ? 'bg-white text-violet-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                선택 B
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="의견 내용 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Feed Cards */}
        {feedItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">해당 조건에 만족하는 서술형 피드가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedItems.map((item) => {
              const isLiked = likedAnswers.has(item.id);
              const isChoiceA = item.choice === 'A';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between ${
                    isChoiceA
                      ? 'bg-indigo-50/20 border-indigo-100 hover:border-indigo-300'
                      : 'bg-violet-50/20 border-violet-100 hover:border-violet-300'
                  }`}
                >
                  <div>
                    {/* Top Demographic & Choice Meta */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isChoiceA
                              ? 'bg-indigo-600 text-white'
                              : 'bg-violet-600 text-white'
                          }`}
                        >
                          선택지 {item.choice}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                          {item.gender} · {item.age_group}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('ko-KR') : '최근'}
                      </span>
                    </div>

                    {/* Reason Text */}
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                      "{item.reason}"
                    </p>
                  </div>

                  {/* Card Bottom like button */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px] text-slate-500">
                      {isChoiceA ? activeQuestion?.choice_a_label.slice(0, 22) + '...' : activeQuestion?.choice_b_label.slice(0, 22) + '...'}
                    </span>
                    <button
                      onClick={() => handleToggleLike(item.id)}
                      className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                        isLiked ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>공감 {isLiked ? 1 : 0}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
