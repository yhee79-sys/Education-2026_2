import React, { useState } from 'react';
import { Check, Copy, Database, ExternalLink, X } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../lib/constants';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">
                Supabase SQL DDL & 시드 데이터 스키마
              </h3>
              <p className="text-xs text-slate-500">
                Supabase Dashboard &gt; SQL Editor에 붙여넣고 Run을 실행하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 flex items-start gap-2.5">
            <span className="font-semibold shrink-0 bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[10px]">
              안내
            </span>
            <span>
              이 SQL은 <strong>questions</strong>, <strong>responses</strong>,{' '}
              <strong>answers</strong> 테이블과 비회원 익명 참여를 위한 RLS(Row Level Security) 정책 및 3대 핵심 딜레마 기본 데이터를 완벽히 생성합니다.
            </span>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-t-lg font-mono">
              <span>schema.sql</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>SQL 전체 복사</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-b-lg overflow-x-auto max-h-72 leading-relaxed selection:bg-emerald-800 selection:text-white">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-slate-600 hover:text-emerald-600 flex items-center gap-1 transition-colors"
          >
            Supabase 대시보드 바로가기 <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
