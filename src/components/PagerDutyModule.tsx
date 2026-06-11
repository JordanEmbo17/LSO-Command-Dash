/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Phone, Mail, Clock, RefreshCw, UserCheck, AlertTriangle } from 'lucide-react';
import { PagerDutySchedule, OnDutyMember } from '../types';

interface PagerDutyModuleProps {
  schedule: PagerDutySchedule | null;
  onRefresh: () => void;
  onOverride: (member: Partial<OnDutyMember> & { role: 'Primary' | 'Secondary' | 'Manager' }) => Promise<void>;
}

export default function PagerDutyModule({ schedule, onRefresh, onOverride }: PagerDutyModuleProps) {
  const [showOverride, setShowOverride] = useState(false);
  const [overrideName, setOverrideName] = useState('');
  const [overrideRole, setOverrideRole] = useState<'Primary' | 'Secondary' | 'Manager'>('Primary');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  if (!schedule) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
        <span className="animate-pulse">Retrieving on-call roster...</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideName.trim()) {
      setMessage('Name is mandatory.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      await onOverride({
        name: overrideName,
        role: overrideRole
      });
      setMessage(`Success: Rota overridden for ${overrideRole}`);
      setOverrideName('');
      setTimeout(() => {
        setShowOverride(false);
        setMessage('');
      }, 2000);
    } catch (err: any) {
      setMessage('Error applying override rota: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Primary':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'Secondary':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 backdrop-blur-md shadow-xl" id="pagerduty-module">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold tracking-tight text-slate-100">PagerDuty Rotata & On-Call</h2>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={onRefresh}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-slate-250 transition-all duration-200"
            title="Force refresh schedule"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowOverride(!showOverride)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-all duration-200"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Override Shift
          </button>
        </div>
      </div>

      {showOverride && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg bg-slate-900/80 border border-slate-800 animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Specify Temporary On-Duty Override
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">FullName *</label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan Emberley"
                value={overrideName}
                onChange={(e) => setOverrideName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 px-3 py-2 rounded focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Duty Rotation Role</label>
              <select
                value={overrideRole}
                onChange={(e) => setOverrideRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 px-3 py-2 rounded focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Primary">Primary (1st Tier Escalation)</option>
                <option value="Secondary">Secondary (2nd Tier Escalation)</option>
                <option value="Manager">Manager (Leadership / Backup)</option>
              </select>
            </div>
          </div>
          {message && (
            <p className="text-xs text-amber-300 bg-amber-950/30 p-2 border border-amber-900/60 rounded mb-3">{message}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowOverride(false)}
              className="text-xs text-slate-300 font-medium px-3 py-1.5 hover:bg-slate-800 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium px-4 py-1.5 rounded disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Applying...' : 'Confirm Override'}
            </button>
          </div>
        </form>
      )}

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {schedule.currentOnCall.map((member) => (
          <div 
            key={member.role}
            className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all duration-200 hover:border-slate-700"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${getRoleBadgeColor(member.role)}`}>
                  {member.role}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Clock className="h-3 w-3" /> Active Since 8AM
                </span>
              </div>
              <div className="font-semibold text-slate-200 text-base mb-2">{member.name}</div>
            </div>

            <div className="border-t border-slate-800/60 pt-3 mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status:</span>
              <span className="flex items-center gap-1 font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span> Active Pager
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-900 pt-3">
        <div>
          Escalation Policy: <span className="font-mono text-indigo-400">{schedule.escalationPolicy}</span>
        </div>
        <div>
          Next Shift Flip: <span className="text-slate-450">{new Date(schedule.nextShiftChange).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
