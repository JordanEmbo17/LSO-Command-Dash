/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Rocket, 
  Settings, 
  Layers, 
  Terminal, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  XOctagon, 
  AlertCircle, 
  Loader2, 
  History 
} from 'lucide-react';
import { ZoneDeployment, LsoZone } from '../types';

interface DeploymentsModuleProps {
  deployments: ZoneDeployment[];
  onTrigger: (zone: LsoZone, version: string) => Promise<void>;
  onConfirm: (id: string) => Promise<void>;
  onRollback: (id: string) => Promise<void>;
}

export default function DeploymentsModule({ deployments, onTrigger, onConfirm, onRollback }: DeploymentsModuleProps) {
  const [selectedDepId, setSelectedDepId] = useState<string | null>(deployments[0]?.id || null);
  const [showDeployInput, setShowDeployInput] = useState(false);
  const [newZone, setNewZone] = useState<LsoZone>('storefront-renderer');
  const [newVersion, setNewVersion] = useState('v1.0.0');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const activeDeployment = deployments.find(d => d.id === selectedDepId) || deployments[0];

  const handleManualTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersion.trim()) {
      setMessage('Version is required.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await onTrigger(newZone, newVersion);
      setMessage(`Rollout triggered successfully for ${newZone}`);
      setTimeout(() => {
        setShowDeployInput(false);
        setMessage('');
      }, 2000);
    } catch (err: any) {
      setMessage('Deployment failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'success':
        return { text: 'text-emerald-400 bg-emerald-950/40 border-emerald-800', label: 'Healthy & Fully Deployed' };
      case 'failed':
        return { text: 'text-red-400 bg-red-950/40 border-red-800', label: 'Failed' };
      case 'running':
        return { text: 'text-blue-400 bg-blue-950/40 border-blue-800', label: 'Rolling Out...' };
      case 'manual_confirmation':
        return { text: 'text-amber-400 bg-amber-950/40 border-amber-800 animate-pulse', label: 'Awaiting Gate Promotion' };
      case 'rolling_back':
        return { text: 'text-rose-400 bg-rose-950/40 border-rose-850 animate-pulse', label: 'Safety Rollback Active' };
      default:
        return { text: 'text-slate-400 bg-slate-900 border-slate-700', label: 'Queued' };
    }
  };

  const getZoneIcon = (zone: LsoZone) => {
    switch (zone) {
      case 'core': return <Settings className="h-4 w-4 text-orange-400" />;
      case 'storefront-renderer': return <Layers className="h-4 w-4 text-cyan-400" />;
      case 'checkout-web': return <Rocket className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md shadow-xl" id="deployments-module">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <Rocket className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold tracking-tight text-slate-100 font-sans">Zone Deployments & Canary Gates</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            // Suggest default increment
            const latestZone = deployments.find(d => d.zone === newZone);
            if (latestZone) {
              const regex = /(\d+)\.(\d+)\.(\d+)/;
              const matches = latestZone.version.match(regex);
              if (matches) {
                const updated = `v${matches[1]}.${matches[2]}.${parseInt(matches[3]) + 1}`;
                setNewVersion(updated);
              }
            }
            setShowDeployInput(!showDeployInput);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition-all duration-200"
        >
          <Play className="h-3.5 w-3.5" />
          New Rollout
        </button>
      </div>

      {showDeployInput && (
        <form onSubmit={handleManualTrigger} className="mb-6 p-4 rounded-lg bg-slate-900/80 border border-slate-800 animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Initiate Production Zone Canary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Zone Module</label>
              <select
                value={newZone}
                onChange={(e) => {
                  const zone = e.target.value as LsoZone;
                  setNewZone(zone);
                  const latestZone = deployments.find(d => d.zone === zone);
                  if (latestZone) {
                    const matches = latestZone.version.match(/(\d+)\.(\d+)\.(\d+)/);
                    if (matches) {
                      setNewVersion(`v${matches[1]}.${matches[2]}.${parseInt(matches[3]) + 1}`);
                    }
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 px-3 py-2 rounded focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="storefront-renderer">storefront-renderer (canary gate & logs)</option>
                <option value="checkout-web">checkout-web (e2e validation gate)</option>
                <option value="core">core (migrations checkout gate)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">SemVer Version Tag</label>
              <input
                type="text"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                placeholder="v5.12.1"
                className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 px-3 py-2 rounded focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          {message && (
            <p className="text-xs text-amber-300 bg-amber-950/30 p-2 border border-amber-900/60 rounded mb-3">{message}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowDeployInput(false)}
              className="text-xs text-slate-300 font-medium px-3 py-1.5 hover:bg-slate-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-medium px-4 py-1.5 rounded disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Initiating Deployment...' : 'Deploy Canary'}
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Left Side list, Right Side Output details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Zones */}
        <div className="lg:col-span-5 space-y-3">
          {deployments.map((dep) => {
            const isSelected = selectedDepId === dep.id;
            const statusConfig = getStatusStyle(dep.status);
            return (
              <div
                key={dep.id}
                onClick={() => setSelectedDepId(dep.id)}
                className={`relative flex flex-col rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-emerald-700 bg-emerald-950/10 shadow-lg shadow-emerald-950/20' 
                    : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getZoneIcon(dep.zone)}
                    <span className="font-mono text-xs font-semibold text-slate-100 uppercase tracking-tight">
                      {dep.zone}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {dep.version}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Status: {statusConfig.label}</span>
                    <span className="font-semibold text-slate-300">{dep.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        dep.status === 'failed' ? 'bg-red-500' :
                        dep.status === 'manual_confirmation' ? 'bg-amber-400' :
                        dep.status === 'rolling_back' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${dep.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Owner: {dep.deployedBy}</span>
                  <span>{new Date(dep.startedAt).toLocaleTimeString()}</span>
                </div>

                {isSelected && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Console Terminal Logs and Interactive Gates */}
        {activeDeployment ? (
          <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/80 p-5 shadow-inner">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-400 uppercase tracking-wide font-mono font-bold">
                      Deploy Event ID: {activeDeployment.id}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-200 mt-1">
                    Module '{activeDeployment.zone}' Rollout Sequence
                  </h3>
                </div>
                <span className={`text-xs px-2.5 py-1 roundedborder font-medium ${getStatusStyle(activeDeployment.status).text}`}>
                  {getStatusStyle(activeDeployment.status).label}
                </span>
              </div>

              {/* Execution Stages */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Workflow Execution Stages</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeDeployment.stages.map((stage, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      {stage.status === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                      {stage.status === 'failed' && <XOctagon className="h-3.5 w-3.5 text-red-400" />}
                      {stage.status === 'running' && <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />}
                      {stage.status === 'pending' && <div className="h-3.5 w-3.5 rounded-full border border-slate-700 bg-slate-950" />}
                      <span className="text-xs font-medium text-slate-300 truncate">{stage.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Pipeline Actions (Canary Gates & Rollbacks) */}
              <div className="flex flex-wrap gap-2.5 items-center bg-slate-900/40 border border-slate-850 p-4 rounded-xl mb-5">
                {activeDeployment.status === 'manual_confirmation' ? (
                  <div className="w-full">
                    <div className="flex items-start gap-2.5 text-xs text-amber-300 bg-amber-950/20 p-3 border border-amber-900/40 rounded-lg mb-3">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <p className="font-semibold">Canary Stage Completed Successfully</p>
                        <p className="text-slate-400 mt-1">Canary checks succeeded. Promoting this build will trigger global rollout to 100% production traffic.</p>
                      </div>
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => onConfirm(activeDeployment.id)}
                        className="flex-1 bg-amber-550 hover:bg-amber-500 text-xs font-semibold text-slate-950 py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Approve & Promote Canary
                      </button>
                      <button
                        type="button"
                        onClick={() => onRollback(activeDeployment.id)}
                        className="bg-red-950/80 hover:bg-red-900/60 text-xs font-semibold text-red-300 border border-red-800 py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <XOctagon className="h-4 w-4" /> Halt & Rollback
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="text-xs text-slate-400">
                      Active Version: <span className="font-mono text-slate-200">{activeDeployment.version}</span> ({activeDeployment.progress}% complete)
                    </div>
                    {activeDeployment.status !== 'success' && activeDeployment.status !== 'failed' ? (
                      <button
                        type="button"
                        onClick={() => onRollback(activeDeployment.id)}
                        className="bg-red-950/80 hover:bg-red-900/60 text-[11px] font-semibold text-red-300 border border-red-800 py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <AlertCircle className="h-3.5 w-3.5" /> Emergency Rollback
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRollback(activeDeployment.id)}
                        className="bg-slate-900/80 hover:bg-red-950/30 text-[11px] font-semibold text-slate-450 hover:text-red-300 border border-slate-800 hover:border-red-900/50 py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <AlertCircle className="h-3.5 w-3.5" /> Force Quick Rollback
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Terminal Logs */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-mono">
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" /> Deployment Console Output
                </div>
                <div className="h-48 overflow-y-auto rounded-lg bg-slate-950 border border-slate-900 p-3 font-mono text-[11px] text-emerald-300 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-850">
                  {activeDeployment.logs.map((log, lIdx) => (
                    <div key={lIdx} className="leading-5 whitespace-pre-wrap selection:bg-emerald-800 select-text">
                      {log}
                    </div>
                  ))}
                  {activeDeployment.status === 'running' && (
                    <div className="text-blue-400 animate-pulse flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" /> [STREAMING] Analyzing rolling core-vital aggregates on 5% servers...
                    </div>
                  )}
                  {activeDeployment.status === 'rolling_back' && (
                    <div className="text-rose-400 animate-pulse flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin"/> [ROLLBACK ACTIVE] Purging cache hashes and hot-swapping container IPs...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 flex h-96 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50 text-slate-500">
            Select a deployment zone to inspect.
          </div>
        )}
      </div>
    </div>
  );
}
