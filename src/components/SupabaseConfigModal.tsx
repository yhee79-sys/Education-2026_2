import React, { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Loader2,
  Save,
  Server,
  X,
  XCircle,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const current = getStoredSupabaseConfig();
  const [url, setUrl] = useState(current.url);
  const [anonKey, setAnonKey] = useState(current.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Supabase URL과 Anon Key를 모두 입력해주세요.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const client = createClient(url.trim(), anonKey.trim());
      const { data, error } = await client
        .from('questions')
        .select('id, title')
        .limit(1);

      if (error) {
        setTestResult({
          success: false,
          message: `연결 실패: ${error.message} (테이블이 생성되었는지 확인해주세요)`,
        });
      } else {
        setTestResult({
          success: true,
          message: `연결 성공! questions 테이블에 접근 가능합니다. (가져온 문항: ${data?.length ?? 0}건)`,
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: `연결 오류: ${e?.message || '네트워크 오류가 발생했습니다.'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    saveStoredSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
    });
    onConfigUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">
                Supabase 연결 설정
              </h3>
              <p className="text-xs text-slate-500">
                실제 Supabase 프로젝트의 URL 및 anon public key를 연동합니다.
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

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 leading-relaxed">
            <p className="font-semibold mb-1">💡 Vercel 배포 시 설정 팁:</p>
            <p>
              Vercel 대시보드 &gt; Project Settings &gt; Environment Variables에{' '}
              <code className="bg-blue-100/80 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code>과{' '}
              <code className="bg-blue-100/80 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_ANON_KEY</code>를 등록하시면 무설정 자동 배포됩니다.
            </p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                placeholder="https://your-project-id.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Project Anon Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex-1 py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  연결 테스트 중...
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  연결 테스트
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-3 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              설정 저장 및 적용
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>설정은 브라우저에 안전하게 저장됩니다.</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800 font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
