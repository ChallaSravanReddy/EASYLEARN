import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  FileCode,
  Music,
  RotateCw,
  X,
  Share2,
  Cpu,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { ScrimManifest } from '../types/scrim';
import { compressScrimManifest, formatBytes } from '../utils/scrimCompressor';
import { uploadScrimSession, ScrimRecord, UploadProgress } from '../services/scrimUploadService';
import { useAuth } from '../context/AuthContext';

export interface ScrimPublishModalProps {
  audioBlob: Blob;
  scrimManifest: ScrimManifest;
  onClose: () => void;
  onSuccess?: (record: ScrimRecord) => void;
}

export default function ScrimPublishModal({
  audioBlob,
  scrimManifest,
  onClose,
  onSuccess,
}: ScrimPublishModalProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Form State
  const [title, setTitle] = useState<string>(scrimManifest.metadata.title || 'Untitled Scrim Session');
  const [description, setDescription] = useState<string>(scrimManifest.metadata.description || '');

  // Upload & Progress State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [publishedRecord, setPublishedRecord] = useState<ScrimRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // 1. Run compression pass on manifest (strip static/redundant pointer telemetry)
  const { compressedManifest, stats } = useMemo(() => {
    return compressScrimManifest(scrimManifest);
  }, [scrimManifest]);

  const audioSizeBytes = audioBlob.size;
  const totalPayloadBytes = audioSizeBytes + stats.compressedSizeBytes;

  const handleStartUpload = async () => {
    if (!title.trim()) {
      setErrorMessage('Please provide a title for the scrim session.');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);

    try {
      const record = await uploadScrimSession({
        title: title.trim(),
        description: description.trim(),
        instructorId: currentUser?.id || null,
        audioBlob,
        manifest: compressedManifest,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      setPublishedRecord(record);
      setIsUploading(false);
      if (onSuccess) {
        onSuccess(record);
      }
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Direct-to-storage upload failed. Please try again.');
    }
  };

  const shareableUrl = useMemo(() => {
    if (!publishedRecord) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/player?scrimId=${publishedRecord.id}`;
  }, [publishedRecord]);

  const copyShareableLink = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-600/10">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {publishedRecord ? 'Scrim Published Successfully' : 'Publish Scrim Session'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Direct-to-storage pipeline with presigned URLs & telemetry compression
              </p>
            </div>
          </div>

          {!isUploading && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
          {/* ── Stage 1: Configure & Optimization Review ── */}
          {!isUploading && !publishedRecord && (
            <>
              {/* Telemetry Compression Pass Banner */}
              <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3.5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-indigo-300 flex items-center gap-2">
                    <span>Telemetry Optimization Pass</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                      -{stats.reductionPercentage}% Payload Size
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                    Stripped <span className="text-white font-semibold">{stats.strippedPointerCount}</span> redundant stationary pointer events. Reduced manifest from{' '}
                    <span className="text-slate-300">{formatBytes(stats.originalSizeBytes)}</span> down to{' '}
                    <span className="text-emerald-400 font-semibold">{formatBytes(stats.compressedSizeBytes)}</span>.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lesson Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Building an Interactive Counter in React"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief summary of concepts taught in this scrim..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Direct-to-Storage Asset Summary */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <Music className="w-3.5 h-3.5 text-indigo-400" /> Audio Stream
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{formatBytes(audioSizeBytes)}</div>
                  <div className="text-[10px] text-slate-500">audio.webm (Opus)</div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <FileCode className="w-3.5 h-3.5 text-emerald-400" /> Manifest
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{formatBytes(stats.compressedSizeBytes)}</div>
                  <div className="text-[10px] text-slate-500">{stats.compressedEventCount} events</div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Duration
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {Math.round(scrimManifest.metadata.duration / 1000)}s
                  </div>
                  <div className="text-[10px] text-slate-500">{scrimManifest.keyframes.length} keyframes</div>
                </div>
              </div>

              {/* Storage security note */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Files are uploaded in parallel directly to Supabase Storage bucket <code>scrim-assets</code>.</span>
              </div>
            </>
          )}

          {/* ── Stage 2: Direct Uploading with Live Progress Bar ── */}
          {isUploading && (
            <div className="flex flex-col items-center py-6 gap-6">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin" />
                <div className="absolute font-mono text-xs font-bold text-white">
                  {uploadProgress?.overallProgress || 0}%
                </div>
              </div>

              <div className="w-full flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-white">{uploadProgress?.message || 'Uploading...'}</span>
                  <span className="font-mono text-indigo-400">{uploadProgress?.overallProgress || 0}%</span>
                </div>

                {/* Main Progress Bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-150"
                    style={{ width: `${uploadProgress?.overallProgress || 0}%` }}
                  />
                </div>

                {/* Sub-streams progress */}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><Music className="w-3 h-3 text-indigo-400" /> audio.webm</span>
                      <span className="font-mono text-slate-300">{uploadProgress?.audioProgress || 0}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-150"
                        style={{ width: `${uploadProgress?.audioProgress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><FileCode className="w-3 h-3 text-emerald-400" /> manifest.json</span>
                      <span className="font-mono text-slate-300">{uploadProgress?.manifestProgress || 0}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-150"
                        style={{ width: `${uploadProgress?.manifestProgress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Stage 3: Publish Complete & Shareable Link ── */}
          {publishedRecord && (
            <div className="flex flex-col items-center py-4 gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xl shadow-emerald-500/10 animate-in zoom-in-75">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-white tracking-tight">Your Scrim is Live!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Audio telemetry and code snapshots have been published directly to Supabase storage.
                </p>
              </div>

              {/* Shareable Link Box */}
              <div className="w-full flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" /> Shareable Player Link
                </label>
                <div className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                  <input
                    type="text"
                    readOnly
                    value={shareableUrl}
                    className="flex-1 bg-transparent text-xs font-mono text-indigo-300 px-2 select-all focus:outline-none truncate"
                  />
                  <button
                    onClick={copyShareableLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Player Launch Button */}
              <div className="w-full flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/player?scrimId=${publishedRecord.id}`);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <span>Open in Scrim Player</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            {publishedRecord ? 'Close' : 'Cancel'}
          </button>

          {!publishedRecord && (
            <button
              onClick={handleStartUpload}
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Publishing Directly...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Publish to Cloud</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
