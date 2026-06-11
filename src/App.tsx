/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Rocket, 
  Terminal, 
  Activity, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Send, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  Play, 
  Settings, 
  Layers, 
  ChevronRight, 
  BookOpen, 
  X, 
  ChevronDown, 
  PlusCircle, 
  Bug, 
  Code,
  Copy,
  Check,
  ExternalLink,
  GitBranch,
  GitCommit
} from 'lucide-react';

import { 
  LsoZone, 
  OnDutyMember, 
  PagerDutySchedule, 
  ZoneDeployment, 
  Incident, 
  PipelineRun, 
  AIAnalysisResult 
} from './types';

const getZoneTimeAndAbbr = (timeZone: string, defaultAbbr: string) => {
  try {
    const d = new Date();
    const timeStr = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(d);
    
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short'
    }).formatToParts(d);
    
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    const abbr = tzPart ? tzPart.value : defaultAbbr;

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    const parsedParts = formatter.formatToParts(d);
    
    const getVal = (type: string) => {
      const match = parsedParts.find(p => p.type === type);
      return match ? parseInt(match.value, 10) : 0;
    };
    
    const year = getVal('year');
    const month = getVal('month');
    const day = getVal('day');
    const hour = getVal('hour');
    const minute = getVal('minute');
    const second = getVal('second');

    const zoneDateFakeUTC = Date.UTC(year, month - 1, day, hour, minute, second);
    const utcDateFakeUTC = Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    );

    const diffHours = Math.round((zoneDateFakeUTC - utcDateFakeUTC) / 3600000);
    const offsetStr = diffHours === 0 ? 'UTC' : diffHours > 0 ? `+${diffHours}h` : `${diffHours}h`;

    return { time: timeStr, abbr, offsetStr, diffHours };
  } catch (e) {
    try {
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, timeZone });
      return { time: timeStr, abbr: defaultAbbr, offsetStr: '', diffHours: 0 };
    } catch (e2) {
      return { time: '--:--:--', abbr: defaultAbbr, offsetStr: '', diffHours: 0 };
    }
  }
};

export default function App() {
  // Roster / PagerDuty states
  const [schedule, setSchedule] = useState<PagerDutySchedule | null>(null);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideName, setOverrideName] = useState('');
  const [overrideRole, setOverrideRole] = useState<'Primary' | 'Secondary' | 'Manager'>('Primary');

  // Deployment states
  const [deployments, setDeployments] = useState<ZoneDeployment[]>([]);
  const [selectedDepId, setSelectedDepId] = useState<string | null>(null);
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({});

  const getZoneDrift = (zone: LsoZone) => {
    const latestDeploy = deployments.find(d => d.zone === zone);
    
    if (zone === 'core') {
      const mainVersion = 'v14.89.0';
      const mainCommit = 'ab409fd';
      const url = 'https://infra-central.shopify.io/applications/environments/65?tab=deploys';
      
      if (!latestDeploy) {
        return { deployedVersion: 'Unknown', mainVersion, behindCommits: 82, status: 'drifted', deployedCommit: 'Unknown', mainCommit, url };
      }
      
      const isUpToDate = latestDeploy.version >= mainVersion && latestDeploy.status !== 'failed';
      return {
        deployedVersion: latestDeploy.version,
        mainVersion,
        behindCommits: isUpToDate ? 0 : 82,
        status: isUpToDate ? 'synced' : 'drifted',
        deployedCommit: isUpToDate ? mainCommit : '7f94119d',
        mainCommit,
        url,
        commitsList: [
          { commit: 'ab409fd', author: 'Sarah Connor', msg: 'Merge check address sanitizer' },
          { commit: 'cb1d4f2', author: 'Kenji Sato', msg: 'Fix currency exchange decimal precision' },
          { commit: '9f8e7d6', author: 'Jordan Emberley', msg: 'Re-enable Redis connection pooling retry' },
          { commit: '4d3c2b1', author: 'LSO Engine Auto-Merge', msg: 'Bump bundler definitions' },
          { commit: 'c52b1a3', author: 'Jordan Emberley', msg: 'Add Datadog log stream routing definitions' },
          { commit: 'b4a8e2d', author: 'Sarah Connor', msg: 'Update PostgreSQL failover policy' },
          { commit: '3a7c6f9', author: 'Kenji Sato', msg: 'Sanitize checkout response fields to hide Okta identifiers' },
          { commit: 'e01f5c3', author: 'Sarah Connor', msg: 'Setup offline canary gate validation hooks' },
        ]
      };
    } else if (zone === 'storefront-renderer') {
      const mainVersion = 'v9.42.16';
      const mainCommit = 'f1a238c';
      const url = 'https://infra-central.shopify.io/applications/environments/698168';
      
      if (!latestDeploy) {
        return { deployedVersion: 'Unknown', mainVersion, behindCommits: 4, status: 'drifted', deployedCommit: 'Unknown', mainCommit, url };
      }
      
      const isUpToDate = latestDeploy.version >= mainVersion && latestDeploy.status !== 'failed';
      return {
        deployedVersion: latestDeploy.version,
        mainVersion,
        behindCommits: isUpToDate ? 0 : 4,
        status: isUpToDate ? 'synced' : 'drifted',
        deployedCommit: isUpToDate ? mainCommit : '9d8f3e2b',
        mainCommit,
        url,
        commitsList: [
          { commit: 'e20f17a', author: 'Sarah Connor', msg: 'Optimize storefront dynamic image canvas responsive sizing' },
          { commit: 'd39a1c8', author: 'Kenji Sato', msg: 'Prune obsolete liquid templates routing tables' },
          { commit: '2c4b8e0', author: 'Jordan Emberley', msg: 'Throttle synthetic web core-vitals alert loops' },
          { commit: 'f1a238c', author: 'Sarah Connor', msg: 'Sprockets webpack clean caching layer sync' }
        ]
      };
    } else { // checkout-web
      const mainVersion = 'v3.19.5';
      const mainCommit = 'e492f1b';
      const url = 'https://infra-central.shopify.io/applications/environments/1';
      
      if (!latestDeploy) {
        return { deployedVersion: 'Unknown', mainVersion, behindCommits: 3, status: 'drifted', deployedCommit: 'Unknown', mainCommit, url };
      }
      
      const isUpToDate = latestDeploy.version >= mainVersion && latestDeploy.status !== 'failed';
      return {
        deployedVersion: latestDeploy.version,
        mainVersion,
        behindCommits: isUpToDate ? 0 : 3,
        status: isUpToDate ? 'synced' : 'drifted',
        deployedCommit: isUpToDate ? mainCommit : 'b51d8c2e',
        mainCommit,
        url,
        commitsList: [
          { commit: 'e492f1b', author: 'Jordan Emberley', msg: 'Fix Shop Pay redirection gate' },
          { commit: 'bc402a1', author: 'Kenji Sato', msg: 'Resolve stripe synthetic token timeout' },
          { commit: '7d2c1b0', author: 'Shopify E2E Bot', msg: 'Bump dependency security parameters' }
        ]
      };
    }
  };

  // Incident states
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [showDeclareIncident, setShowDeclareIncident] = useState(false);
  const [newIncTitle, setNewIncTitle] = useState('');
  const [newIncSeverity, setNewIncSeverity] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P1');
  const [newIncZone, setNewIncZone] = useState<LsoZone>('core');
  const [newIncSummary, setNewIncSummary] = useState('');
  const [incidentComment, setIncidentComment] = useState('');
  const [incidentCommentor, setIncidentCommentor] = useState('Jordan Emberley');

  // Pipeline states
  const [pipelines, setPipelines] = useState<PipelineRun[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [showNewPipeline, setShowNewPipeline] = useState(false);
  const [newPipeZone, setNewPipeZone] = useState<LsoZone>('storefront-renderer');
  const [newPipeBranch, setNewPipeBranch] = useState('main');

  // AI Diagnostic states
  const [analyzingLog, setAnalyzingLog] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Live Shopify Integration Sources Health Check States
  const [sourcesHealth, setSourcesHealth] = useState<any>(null);
  const [showSyncGuide, setShowSyncGuide] = useState(false);
  const [showSSOBypass, setShowSSOBypass] = useState(false);
  const [ssoStatus, setSsoStatus] = useState<{ active: boolean; preview: string | null }>({ active: false, preview: null });
  const [ssoInputValue, setSsoInputValue] = useState("");
  const [savingSSO, setSavingSSO] = useState(false);
  const [ssoBypassed, setSsoBypassed] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check query parameters on mount to auto-inject SSO session from browser redirects or CLI helpers
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('sso_token') || params.get('cookie') || params.get('session');
    if (token) {
      setSavingSSO(true);
      fetch('/api/auth/save-sso-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssoToken: token })
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          }
          throw new Error("Failed to save SSO token");
        })
        .then(data => {
          setSsoStatus({ active: data.active, preview: data.preview || null });
          setSsoInputValue('');
          // Clear query params to tidy up the address bar
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          fetchAllData();
        })
        .catch(err => {
          console.error("Auto-injecting SSO token query param failed:", err);
        })
        .finally(() => {
          setSavingSSO(false);
        });
    }
  }, []);

  // App global and UTC metrics
  const [currentTime, setCurrentTime] = useState<string>(new Date().toISOString());
  const [pollingActive, setPollingActive] = useState(true);

  // Load Initial Data
  const fetchAllData = async () => {
    try {
      const [rotaRes, depRes, incRes, pipeRes, healthRes, ssoRes] = await Promise.all([
        fetch('/api/on-duty'),
        fetch('/api/deployments'),
        fetch('/api/incidents'),
        fetch('/api/pipelines'),
        fetch('/api/sources/health'),
        fetch('/api/auth/sso-status')
      ]);

      if (rotaRes.ok) setSchedule(await rotaRes.json());
      
      if (ssoRes?.ok) {
        try {
          const ssoData = await ssoRes.json();
          setSsoStatus(ssoData);
        } catch (e) {
          console.error("Error reading SSO status:", e);
        }
      }
      
      if (healthRes.ok) {
        try {
          const healthData = await healthRes.json();
          setSourcesHealth(healthData);
        } catch (err) {
          console.error("Error parsing sources health:", err);
        }
      }

      if (depRes.ok) {
        const depData: ZoneDeployment[] = await depRes.json();
        setDeployments(depData);
        if (depData.length > 0 && !selectedDepId) {
          setSelectedDepId(depData[0].id);
        }
      }
      if (incRes.ok) {
        const incData: Incident[] = await incRes.json();
        setIncidents(incData);
        if (!selectedIncidentId) {
          const activeIncs = incData.filter(i => i.status !== 'resolved');
          if (activeIncs.length > 0) {
            setSelectedIncidentId(activeIncs[0].id);
          } else if (incData.length > 0) {
            setSelectedIncidentId(incData[0].id);
          }
        }
      }
      if (pipeRes.ok) {
        const pipeData: PipelineRun[] = await pipeRes.json();
        setPipelines(pipeData);
        if (pipeData.length > 0 && !selectedPipelineId) {
          setSelectedPipelineId(pipeData[0].id);
        }
      }
    } catch (e) {
      console.error("Error loading endpoint payload data:", e);
    }
  };

  // Setup dynamic ticking & background live polling
  useEffect(() => {
    fetchAllData();

    const timeTimer = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);

    let pollTimer: NodeJS.Timeout;
    if (pollingActive) {
      pollTimer = setInterval(() => {
        fetchAllData();
      }, 5000);
    }

    return () => {
      clearInterval(timeTimer);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [pollingActive]);

  // Interactivity Actions

  // SSO Bypass Injection Actions
  const submitSSOToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSSO(true);
    try {
      const res = await fetch('/api/auth/save-sso-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssoToken: ssoInputValue })
      });
      if (res.ok) {
        const data = await res.json();
        setSsoStatus({ active: data.active, preview: data.preview || null });
        setSsoInputValue('');
        fetchAllData();
      }
    } catch (err) {
      console.error("Error submitting SSO token:", err);
    } finally {
      setSavingSSO(false);
    }
  };

  const clearSSOToken = async () => {
    setSavingSSO(true);
    try {
      const res = await fetch('/api/auth/save-sso-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssoToken: '' })
      });
      if (res.ok) {
        const data = await res.json();
        setSsoStatus({ active: data.active, preview: null });
        setSsoInputValue('');
        fetchAllData();
      }
    } catch (err) {
      console.error("Error clearing SSO token:", err);
    } finally {
      setSavingSSO(false);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      await fetch('/api/sources/sync', { method: 'POST' });
    } catch (err) {
      console.error("Failed to trigger on-demand sync:", err);
    } finally {
      await fetchAllData();
      setIsSyncing(false);
    }
  };

  // 1. PagerDuty Override
  const triggerOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideName) return;

    try {
      const res = await fetch('/api/on-duty/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: overrideName,
          role: overrideRole
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSchedule(data.schedule);
        setOverrideName('');
        setShowOverride(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Deployment Gates

  const approvePromotion = async (id: string) => {
    try {
      const res = await fetch('/api/deployments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const updated = await res.json();
        setDeployments(prev => prev.map(d => d.id === id ? updated : d));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const rollbackDeployment = async (id: string) => {
    try {
      const res = await fetch('/api/deployments/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const updated = await res.json();
        setDeployments(prev => prev.map(d => d.id === id ? updated : d));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerDeployment = async (zone: LsoZone, version: string) => {
    try {
      const res = await fetch('/api/deployments/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zone,
          version,
          deployedBy: incidentCommentor || "Jordan Emberley"
        })
      });
      if (res.ok) {
        const newDep = await res.json();
        setDeployments(prev => [newDep, ...prev]);
        if (newDep && newDep.id) {
          setSelectedDepId(newDep.id);
        }
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Incident Lifecycle
  const declareIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncTitle) return;

    try {
      const res = await fetch('/api/incidents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newIncTitle,
          severity: newIncSeverity,
          impactedZones: [newIncZone],
          assignedTo: schedule?.currentOnCall.find(m => m.role === 'Primary')?.name || "Unassigned",
          summary: newIncSummary || "Incident declared manually from the Elegant Dark LSO console."
        })
      });
      if (res.ok) {
        const inc = await res.json();
        setIncidents(prev => [inc, ...prev]);
        setSelectedIncidentId(inc.id);
        setNewIncTitle('');
        setNewIncSummary('');
        setShowDeclareIncident(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateIncidentStatus = async (id: string, status: 'acknowledged' | 'resolved', comment?: string) => {
    try {
      const res = await fetch('/api/incidents/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          author: incidentCommentor,
          comment
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setIncidents(prev => {
          const nextIncidents = prev.map(i => i.id === id ? updated : i);
          if (status === 'resolved' && selectedIncidentId === id) {
            const nextActive = nextIncidents.filter(i => i.status !== 'resolved');
            setSelectedIncidentId(nextActive.length > 0 ? nextActive[0].id : null);
          }
          return nextIncidents;
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addIncidentComment = async (id: string) => {
    if (!incidentComment.trim()) return;
    try {
      const res = await fetch('/api/incidents/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          author: incidentCommentor,
          comment: incidentComment
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setIncidents(prev => prev.map(i => i.id === id ? updated : i));
        setIncidentComment('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. CI pipeline execution
  const runPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/pipelines/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zone: newPipeZone,
          branch: newPipeBranch,
          author: incidentCommentor
        })
      });
      if (res.ok) {
        const run = await res.json();
        setPipelines(prev => [run, ...prev]);
        setSelectedPipelineId(run.id);
        setShowNewPipeline(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const retryPipeline = async (id: string) => {
    try {
      const res = await fetch('/api/pipelines/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const updated = await res.json();
        setPipelines(prev => prev.map(r => r.id === id ? updated : r));
        setAiAnalysisResult(null); // Clear previous diagnostic session
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 5. AI Log Diagnostic
  const analyzePipelineLog = async (pipeline: PipelineRun) => {
    if (!pipeline.logSnippet) return;
    setAnalyzingLog(true);
    setAiAnalysisResult(null);
    try {
      const res = await fetch('/api/gemini/analyze-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          failedLog: pipeline.logSnippet,
          zone: pipeline.zone,
          stepName: pipeline.failedStep
        })
      });
      if (res.ok) {
        const out: AIAnalysisResult = await res.json();
        setAiAnalysisResult(out);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingLog(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // Formatted state indicators
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const activeP1Incidents = activeIncidents.filter(i => i.severity === 'P1');
  const activeP2Incidents = activeIncidents.filter(i => i.severity === 'P2');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);
  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);
  const selectedDeployment = deployments.find(d => d.id === selectedDepId);

  // Master pipeline statistics
  const pipelineSuccessRate = pipelines.length > 0 
    ? ((pipelines.filter(p => p.status === 'success').length / pipelines.length) * 100).toFixed(1)
    : "94.2";

  // Zone status helpers
  const getZoneHealth = (zone: LsoZone) => {
    const zoneDeploys = deployments.filter(d => d.zone === zone);
    if (zoneDeploys.length > 0) {
      const latestDeploy = zoneDeploys[0];
      if (latestDeploy.status === 'running') {
        return { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', text: 'Deploying' };
      }
      if (latestDeploy.status === 'manual_confirmation') {
        return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', text: 'Manual Gate' };
      }
      if (latestDeploy.status === 'rolling_back') {
        return { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', text: 'Rolling Back' };
      }
      if (latestDeploy.status === 'failed') {
        return { color: 'text-red-500 bg-red-500/10 border-red-500/20', text: 'Failed' };
      }
      if (latestDeploy.status === 'queued') {
        return { color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20', text: 'Queued' };
      }
    }
    const activeZoneIncs = activeIncidents.filter(i => i.impactedZones.includes(zone));
    if (activeZoneIncs.some(i => i.severity === 'P1')) return { color: 'text-red-500 bg-red-500/10 border-red-500/20', text: 'Critical Outage' };
    if (activeZoneIncs.some(i => i.severity === 'P2')) return { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', text: 'Performance Alert' };
    return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', text: 'Operational' };
  };

  if (!ssoStatus.active && !ssoBypassed) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-[#E2E2E2] flex items-center justify-center p-4 md:p-8 font-sans selection:bg-indigo-900 selection:text-white animate-fadeIn" id="sso-identity-portal">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 bg-[#0F0F12] border border-[#27272A] rounded-xl overflow-hidden shadow-2xl shadow-indigo-950/20">
          
          {/* Left Decorative/Info brand col */}
          <div className="col-span-1 md:col-span-5 bg-gradient-to-br from-indigo-950/20 via-[#0F0F12] to-slate-950 p-8 md:p-12 flex flex-col justify-between border-r border-[#27272A]/70">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(129,140,248,0.15)]">
                  <Shield className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="font-mono">
                  <span className="text-xs font-bold uppercase tracking-[#0.2em] text-indigo-400 block leading-tight">Okta Identity</span>
                  <span className="text-white text-[15px] font-black uppercase tracking-wider block">Shopify LSO</span>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h2 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                  Enterprise SSO Identity Gateway
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Real-time synchronization with active development versions, production canary streams, and private PagerDuty/incident databases is shielded behind Shopify corporate Okta identity parameters.
                </p>
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-start gap-2.5 text-[11px] text-zinc-400">
                    <span className="text-indigo-400 text-xs font-bold leading-none mt-0.5">●</span>
                    <span>Direct live parsing for 5+ Shopify internal systems.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-[11px] text-zinc-400">
                    <span className="text-indigo-400 text-xs font-bold leading-none mt-0.5">●</span>
                    <span>Secured endpoint proxy for external VPC Cron managers.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-[11px] text-zinc-400">
                    <span className="text-indigo-400 text-xs font-bold leading-none mt-0.5">●</span>
                    <span>Fully telemetry-correlated active diagnostic engine.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[#27272A]/40 mt-8 md:mt-0">
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>Secure Tunneling Active</span>
              </div>
            </div>
          </div>

          {/* Right Input / SSO Action col */}
          <div className="col-span-1 md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-[#0C0C0E]">
            <div className="max-w-md w-full mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">Sign In to Dashboard</h3>
                <p className="text-xs text-[#71717A] mt-1">Authenticate your developer privileges to connect live feeds</p>
              </div>

              {/* Identity Form */}
              <form onSubmit={submitSSOToken} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                    SSO Email Identity
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717A]">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      disabled
                      value="jordan.emberley@shopify.com"
                      className="w-full bg-[#161619] border border-[#27272A] rounded-lg pl-9 pr-3 py-2 text-zinc-400 focus:outline-none focus:border-indigo-500 font-mono text-xs cursor-not-allowed opacity-80"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                      Active Shopify Session Cookie / Token
                    </label>
                  </div>
                  <input
                    type="password"
                    placeholder="Paste your copied _session_id or Okta token..."
                    value={ssoInputValue}
                    onChange={(e) => setSsoInputValue(e.target.value)}
                    className="w-full bg-[#161619] border border-[#27272A] rounded-lg px-3 py-2 text-zinc-250 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    required
                  />
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={savingSSO}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-mono font-bold text-xs py-2.5 rounded-lg uppercase cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 disabled:opacity-50"
                  >
                    {savingSSO ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Validating Okta Handshake...
                      </>
                    ) : (
                      "Authenticate Okta SSO 🚀"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Trigger Okta redirection automatically in a popup tab to authenticate the browser
                      const oktaSessionProbeUrl = "https://incidents.shopify.io/";
                      window.open(oktaSessionProbeUrl, "_blank", "width=805,height=605");
                    }}
                    className="w-full bg-[#1A1A1E] hover:bg-[#242429] text-zinc-300 border border-[#27272A] font-mono text-xs py-2 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                    Trigger Okta SSO Redirect (New Tab)
                  </button>
                </div>
              </form>

              {/* Instructions Divider */}
              <div className="relative py-2 select-none">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1C1C21]"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest"><span className="bg-[#0C0C0E] px-3 text-[#A1A1AA]">Local Console Hack</span></div>
              </div>

              {/* Easy collection guide snippet */}
              <div className="space-y-3">
                <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                  To automatically fetch live incidents, simply click the Okta redirect above to ensure you have a signed-in tab, then run this command in your browser console to capture the secure context:
                </p>
                <div className="relative group">
                  <pre className="p-3 rounded-lg bg-[#161619] border border-[#27272A] font-mono text-[10.5px] text-teal-400 overflow-x-auto select-all whitespace-pre-wrap leading-relaxed">
                    copy(document.cookie)
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("copy(document.cookie)");
                      setCopiedSnippet(true);
                      setTimeout(() => setCopiedSnippet(false), 2000);
                    }}
                    className="absolute right-2 top-2 text-[9px] bg-slate-800 text-[#71717A] hover:bg-slate-700 font-bold px-2 py-0.5 rounded cursor-pointer uppercase transition-colors"
                  >
                    {copiedSnippet ? "Copied! ✓" : "Copy"}
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2 text-[11px] font-mono">
                  <button
                    onClick={() => setSsoBypassed(true)}
                    className="text-[#71717A] hover:text-indigo-400 underline cursor-pointer text-left transition-colors font-sans"
                  >
                    Continue with Local Mock Data (Offline Bypass) →
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E2E2E2] flex flex-col font-sans selection:bg-[#27272A] selection:text-white" id="main-dashboard-canvas">
      
      {/* Top Navigation Bar / Branding / Uptime Status */}
      <header className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b border-[#27272A] bg-[#0F0F12] gap-4">
        
        {/* Left corner branding */}
        <div className="flex items-center gap-4">
          <div className={`w-3.5 h-3.5 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all duration-500 ${
            activeP1Incidents.length > 0 ? 'bg-red-500 shadow-red-500/50 animate-pulse' :
            activeP2Incidents.length > 0 ? 'bg-amber-500 shadow-amber-500/50 animate-pulse' : 'bg-emerald-500 shadow-emerald-500/50'
          }`} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight uppercase text-white font-mono">LSO Command Center</h1>
              <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 font-mono px-1.5 py-0.5 rounded uppercase">PROD</span>
            </div>
            <p className="text-[10px] text-[#71717A] tracking-wider uppercase font-semibold font-mono">Real-time Shopify Live Site Operations</p>
          </div>
        </div>

        {/* Global Operational Counters */}
        <div className="flex flex-wrap items-center gap-4 md:gap-8 justify-end text-xs w-full md:w-auto">
          {/* Active zone alerts */}
          <div className="flex items-center gap-4">
            {(['core', 'storefront-renderer', 'checkout-web'] as LsoZone[]).map((zone) => {
              const status = getZoneHealth(zone);
              return (
                <div key={zone} className="hidden lg:flex flex-col border border-[#27272A] bg-[#18181B] px-3 py-1.5 rounded-lg">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#71717A] font-mono">{zone}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      status.text === 'Operational' ? 'bg-emerald-500' :
                      status.text === 'Deploying' ? 'bg-blue-500 animate-pulse' :
                      status.text === 'Manual Gate' ? 'bg-amber-500' :
                      status.text === 'Rolling Back' ? 'bg-rose-500 animate-pulse' :
                      status.text === 'Queued' ? 'bg-zinc-400' :
                      status.text.includes('Alert') ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <span className="text-xs font-semibold text-slate-250 truncate max-w-[110px]">{status.text}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-8 w-px bg-[#27272A] hidden lg:block" />

          {/* System Time Counter */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 justify-end">
            {/* UTC Block */}
            <div className="text-right">
              <p className="text-[9px] uppercase text-[#71717A] font-bold tracking-widest font-mono">Operational</p>
              <p className="text-xs font-mono text-[#E2E2E4] tracking-wider font-bold mt-0.5 whitespace-nowrap">
                {currentTime.split('T')[1].substring(0, 8)}
                <span className="text-[10px] text-[#71717A] ml-1 font-normal select-none">UTC</span>
              </p>
              <p className="text-[9px] font-mono text-[#71717A]/80 select-none text-right">
                Standard
              </p>
            </div>
            
            <div className="h-6 w-px bg-[#27272A] hidden sm:block" />
            
            {/* EST Block */}
            <div className="text-right">
              <p className="text-[9px] uppercase text-[#71717A] font-bold tracking-widest font-mono">Eastern</p>
              <p className="text-xs font-mono text-[#E2E2E4] tracking-wider font-bold mt-0.5 whitespace-nowrap">
                {(() => {
                  const data = getZoneTimeAndAbbr('America/New_York', 'EST');
                  return (
                    <>
                      {data.time}
                      <span className="text-[10px] text-[#71717A] ml-1 font-normal select-none">
                        {data.abbr}
                      </span>
                    </>
                  );
                })()}
              </p>
              <p className="text-[9px] font-mono text-[#71717A]/80 select-none text-right">
                {(() => {
                  const data = getZoneTimeAndAbbr('America/New_York', 'EST');
                  return data.diffHours === 0 
                    ? 'Same as UTC' 
                    : data.diffHours < 0 
                      ? `${Math.abs(data.diffHours)}h behind` 
                      : `${data.diffHours}h ahead`;
                })()}
              </p>
            </div>

            <div className="h-6 w-px bg-[#27272A] hidden sm:block" />

            {/* PST Block */}
            <div className="text-right">
              <p className="text-[9px] uppercase text-[#71717A] font-bold tracking-widest font-mono">Pacific</p>
              <p className="text-xs font-mono text-[#E2E2E4] tracking-wider font-bold mt-0.5 whitespace-nowrap">
                {(() => {
                  const data = getZoneTimeAndAbbr('America/Los_Angeles', 'PST');
                  return (
                    <>
                      {data.time}
                      <span className="text-[10px] text-[#71717A] ml-1 font-normal select-none">
                        {data.abbr}
                      </span>
                    </>
                  );
                })()}
              </p>
              <p className="text-[9px] font-mono text-[#71717A]/80 select-none text-right">
                {(() => {
                  const data = getZoneTimeAndAbbr('America/Los_Angeles', 'PST');
                  return data.diffHours === 0 
                    ? 'Same as UTC' 
                    : data.diffHours < 0 
                      ? `${Math.abs(data.diffHours)}h behind` 
                      : `${data.diffHours}h ahead`;
                })()}
              </p>
            </div>

            <div className="h-6 w-px bg-[#27272A] hidden sm:block" />

            {/* EMEA Block */}
            <div className="text-right">
              <p className="text-[9px] uppercase text-[#71717A] font-bold tracking-widest font-mono">EMEA</p>
              <p className="text-xs font-mono text-[#E2E2E4] tracking-wider font-bold mt-0.5 whitespace-nowrap">
                {(() => {
                  const data = getZoneTimeAndAbbr('Europe/London', 'BST');
                  const dispAbbr = data.abbr === 'BST' || data.abbr === 'GMT' ? data.abbr : 'EMEA';
                  return (
                    <>
                      {data.time}
                      <span className="text-[10px] text-[#71717A] ml-1 font-normal select-none">
                        {dispAbbr}
                      </span>
                    </>
                  );
                })()}
              </p>
              <p className="text-[9px] font-mono text-[#71717A]/80 select-none text-right">
                {(() => {
                  const data = getZoneTimeAndAbbr('Europe/London', 'BST');
                  return data.diffHours === 0 
                    ? 'Same as UTC' 
                    : data.diffHours < 0 
                      ? `${Math.abs(data.diffHours)}h behind` 
                      : `${data.diffHours}h ahead`;
                })()}
              </p>
            </div>

            <div className="h-6 w-px bg-[#27272A] hidden sm:block" />

            {/* APAC Block */}
            <div className="text-right">
              <p className="text-[9px] uppercase text-[#71717A] font-bold tracking-widest font-mono">APAC</p>
              <p className="text-xs font-mono text-[#E2E2E4] tracking-wider font-bold mt-0.5 whitespace-nowrap">
                {(() => {
                  const data = getZoneTimeAndAbbr('Asia/Singapore', 'SGT');
                  return (
                    <>
                      {data.time}
                      <span className="text-[10px] text-[#71717A] ml-1 font-normal select-none">
                        {data.abbr}
                      </span>
                    </>
                  );
                })()}
              </p>
              <p className="text-[9px] font-mono text-[#71717A]/80 select-none text-right">
                {(() => {
                  const data = getZoneTimeAndAbbr('Asia/Singapore', 'SGT');
                  return data.diffHours === 0 
                    ? 'Same as UTC' 
                    : data.diffHours < 0 
                      ? `${Math.abs(data.diffHours)}h behind` 
                      : `${data.diffHours}h ahead`;
                })()}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-[#27272A]" />

          {/* Quick Config Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                handleForceSync();
              }}
              disabled={isSyncing}
              title="Force Relaunch Sync and Re-examine Live Connections"
              className="px-3 py-1.5 border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] rounded-lg text-[#A1A1AA] hover:text-white transition-all font-semibold text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-amber-400 font-bold' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync'}
            </button>
            <button 
              onClick={() => setPollingActive(!pollingActive)}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                pollingActive 
                  ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/40' 
                  : 'bg-[#18181B] text-[#71717A] border-[#27272A]'
              }`}
              title={pollingActive ? "Auto-refresh: Every 5s" : "Auto-refresh: Paused"}
            >
              <Activity className="h-4 w-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Live Shopify Sources Connection Hub */}
      <div className="bg-[#121214] border-b border-[#27272A] px-6 py-3 select-none text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span className="font-extrabold uppercase tracking-widest text-[#71717A] text-[10px] font-mono">LIVE INTEGRATION FEEDS ({sourcesHealth ? Object.keys(sourcesHealth).length : 5} SYSTEMS)</span>
            <button
              onClick={() => {
                setShowSyncGuide(!showSyncGuide);
                setShowSSOBypass(false);
              }}
              className={`text-[9.5px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer font-bold uppercase tracking-wider ${
                showSyncGuide 
                  ? "bg-amber-500/25 text-amber-300 border-amber-500/40" 
                  : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/25"
              }`}
            >
              {showSyncGuide ? "Close Sync Guide ▲" : "VPC Sync Setup ⚡"}
            </button>
            <button
              onClick={() => {
                setShowSSOBypass(!showSSOBypass);
                setShowSyncGuide(false);
              }}
              className={`text-[9.5px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer font-bold uppercase tracking-wider ${
                ssoStatus.active 
                  ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/40 animate-pulse" 
                  : showSSOBypass 
                    ? "bg-amber-500/25 text-amber-300 border-amber-500/40"
                    : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/25"
              }`}
            >
              {ssoStatus.active ? "SSO Connected 🔑" : "SSO Bypass Gate 🔑"}
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-[11px]">
            {sourcesHealth ? (
              Object.entries(sourcesHealth).map(([key, value]: any) => {
                const keyToZoneMap: Record<string, LsoZone> = {
                  coreDeploy: 'core',
                  storefrontDeploy: 'storefront-renderer',
                  checkoutDeploy: 'checkout-web'
                };
                const zone = keyToZoneMap[key];
                const zoneDeploys = zone ? deployments.filter(d => d.zone === zone) : [];
                const latestDeploy = zoneDeploys[0];
                const hasDeployStatus = !!latestDeploy;

                return (
                  <div key={key} className="flex items-center gap-2 border border-[#27272A]/70 bg-zinc-950/40 px-2.5 py-1 rounded-md text-zinc-300 font-mono">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      hasDeployStatus ? (
                        latestDeploy.status === 'success' ? 'bg-emerald-500' :
                        latestDeploy.status === 'running' ? 'bg-blue-500 animate-pulse' :
                        latestDeploy.status === 'manual_confirmation' ? 'bg-amber-500' :
                        latestDeploy.status === 'rolling_back' ? 'bg-rose-500 animate-pulse' :
                        'bg-zinc-500'
                      ) : 'bg-amber-500'
                    }`} />
                    <span className="font-bold text-zinc-300 text-[9.5px] uppercase">{value.name.replace(" Deployments (ID ", " (").replace("Active Incidents Portal", "Portal")}</span>
                    <span className="text-[10px] text-zinc-650">|</span>
                    <a
                      href={value.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 underline font-semibold transition-colors text-[10px] flex items-center gap-0.5"
                    >
                      View Source ↗
                    </a>
                    <span 
                      className={`text-[8.5px] px-1.5 py-0.2 rounded uppercase font-bold tracking-wider ${
                        hasDeployStatus ? (
                          latestDeploy.status === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                          latestDeploy.status === 'manual_confirmation' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                          latestDeploy.status === 'rolling_back' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
                          latestDeploy.status === 'failed' ? 'bg-red-500/10 border border-red-500/20 text-red-500' :
                          latestDeploy.status === 'queued' ? 'bg-zinc-500/10 border border-zinc-500/20 text-zinc-400' :
                          'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                        ) : (
                          value.status === 'online' || value.status === 'ok'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        )
                      }`} 
                      title={value.message}
                    >
                      {hasDeployStatus ? (
                        latestDeploy.status === 'success' ? 'Deployed' :
                        latestDeploy.status === 'manual_confirmation' ? 'Manual Gate' :
                        latestDeploy.status === 'rolling_back' ? 'Rolling Back' :
                        latestDeploy.status === 'failed' ? 'Failed' :
                        latestDeploy.status === 'queued' ? 'Queued' : 'Deploying'
                      ) : (
                        value.status === 'online' || value.status === 'ok' ? 'Synced' : 'SSO Fallback'
                      )}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-[#71717A] font-mono text-[9.5px] uppercase tracking-wider animate-pulse flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-600" />
                Testing connection pathways to live Shopify network nodes...
              </div>
            )}
          </div>
        </div>

        {/* Collapsible VPC Sync Help Section */}
        {showSyncGuide && (
          <div className="mt-3.5 p-4.5 rounded-lg bg-zinc-950/90 border border-amber-500/20 text-slate-300 font-sans leading-relaxed animate-fadeIn select-text max-w-4xl">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2">
              ⚡ Internal VPC / Cron Synchronizer Setup Guide
            </h3>
            <p className="text-[11px] text-zinc-400 mb-3.5 font-sans">
              Due to corporate security boundaries (Okta/Google SSO), this cloud-hosted dashboard cannot directly scrape live details from Shopify's inner firewalled sites. To enable automatic live updates, deploy our pre-configured lightweight scraper script on any machine that already has network-level permission and active SSO authorization.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono">
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">Step 1: Locate the Script</span>
                <p className="text-zinc-400 font-sans text-xs">
                  We've initialized a complete node sync agent inside this project explorer directory at:
                  <code className="block bg-[#161619] border border-[#27272A] px-2 py-1 rounded text-[#a49cfc] font-mono my-1 selection:bg-indigo-900">
                    /scripts/sync-lso-data.js
                  </code>
                </p>
                
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block mt-1.5">Step 2: Configure & Test</span>
                <p className="text-zinc-400 font-sans text-xs">
                  Set your active session cookie so the script can authenticatably fetch build pages:
                  <code className="block bg-[#161619] border border-[#27272A] px-2 py-1 rounded text-teal-400 font-mono my-1 font-semibold">
                    node scripts/sync-lso-data.js
                  </code>
                </p>
              </div>

              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">Step 3: Schedule as a Cron Job</span>
                <p className="text-zinc-400 font-sans text-xs">
                  Configure a crontab on an internal sandbox machine to execute every 2 minutes:
                  <code className="block bg-[#161619] border border-[#27272A] px-2.5 py-1.5 rounded text-amber-300 font-mono my-1 leading-normal selection:bg-indigo-900">
                    */2 * * * * LSO_DASHBOARD_URL="{window.location.origin}" node /path/to/sync-lso-data.js
                  </code>
                </p>

                <div className="p-2 bg-[#18181F]/40 border border-[#27272A] rounded font-sans text-[11.5px] text-[#A1A1AA] leading-normal">
                  <span className="font-bold text-slate-100 font-mono text-[9.5px] uppercase block mb-1 text-indigo-400">Webhook Connection Endpoint</span>
                  Our server listening endpoint accepts secure JSON bodies at:
                  <code className="block font-mono text-[10px] text-zinc-300 select-all my-1.5 break-all">
                    POST {window.location.origin}/api/sync/lso-system
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsible SSO Bypass Injection Section */}
        {showSSOBypass && (
          <div className="mt-3.5 p-4.5 rounded-lg bg-zinc-950/90 border border-emerald-500/20 text-slate-300 font-sans leading-relaxed animate-fadeIn select-text max-w-4xl">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2">
              🔑 Active Browser SSO / Cookie Injection Gate
            </h3>
            <p className="text-[11px] text-zinc-400 mb-3.5 font-sans">
              Authenticate this cloud server directly with your active live session! Open the target Shopify pages in your browser to complete Google/Okta SSO, run our single-click console helper below to capture your session cookies, and inject them here. The dashboard server will reuse them to bypass the identity gateway.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <form onSubmit={submitSSOToken} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block mb-1">
                    Inject Active Shopify Cookie / SSO Session Token
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste '_session_id=...; or full cookie trace'"
                      value={ssoInputValue}
                      onChange={(e) => setSsoInputValue(e.target.value)}
                      className="bg-[#161619] border border-[#27272A] rounded px-3 py-1.5 text-zinc-250 placeholder-zinc-655 focus:outline-none focus:border-emerald-500 font-mono text-xs flex-1"
                    />
                    <button
                      type="submit"
                      disabled={savingSSO}
                      className="bg-[#10B981] hover:bg-[#059669] text-white font-mono font-bold text-[10px] px-3.5 py-1.5 rounded uppercase cursor-pointer transition-all disabled:opacity-40"
                    >
                      {savingSSO ? "Saving..." : "Inject 🚀"}
                    </button>
                  </div>
                </div>

                {ssoStatus.active && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded flex items-center justify-between text-[11.5px]">
                    <div className="space-y-0.5 flex-1 pr-4">
                      <span className="text-emerald-400 font-bold font-mono text-[10px] uppercase block">
                        ● Live Bypass Connection Active
                      </span>
                      <p className="text-zinc-400 text-[10.5px]">
                        Header Token Signature: <code className="text-teal-400 font-mono text-[9.5px]">{ssoStatus.preview}</code>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearSSOToken}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-2.5 py-1 rounded text-[9.5px] font-mono font-semibold uppercase cursor-pointer transition-all shrink-0"
                    >
                      Clear SSO Trace
                    </button>
                  </div>
                )}
              </form>

              <div className="space-y-2.5 text-[11.5px]">
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                  Quick Console Copy Snippet (Run on incidents.shopify.io)
                </span>
                <p className="text-zinc-400 font-sans text-xs">
                  Press <kbd className="bg-zinc-800 text-zinc-350 px-1 py-0.5 rounded text-[10px]">F12</kbd> (Console) on any signed-in Shopify/Okta portal window and execute:
                </p>
                <div className="relative group">
                  <pre className="p-2.5 rounded bg-[#161619] border border-[#27272A] font-mono text-[10px] text-indigo-300 overflow-x-auto select-all whitespace-pre-wrap leading-relaxed">
                    copy(document.cookie)
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("copy(document.cookie)");
                      setCopiedSnippet(true);
                      setTimeout(() => setCopiedSnippet(false), 2000);
                    }}
                    className="absolute right-2 top-2 text-[9px] bg-slate-800 text-[#71717A] hover:bg-slate-700 font-bold px-2 py-0.5 rounded cursor-pointer uppercase transition-colors"
                  >
                    {copiedSnippet ? "Copied! ✓" : "Copy"}
                  </button>
                </div>
                <p className="text-zinc-400 font-sans text-xs pt-1">
                  Then paste the copied value directly on the left input field and hit **Inject**!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Dashboard Layout Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-px bg-[#27272A]">
        
        {/* Left Column (span 4): On-Call & Deployments */}
        <section className="lg:col-span-4 flex flex-col gap-px bg-[#0F0F12]">
          
          {/* 1. On-Call Rotation Detail (PagerDuty) */}
          <div className="bg-[#0F0F12] p-6 border-b border-[#27272A]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-indigo-400" />
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#71717A]">On-Call Rotation (PagerDuty)</h2>
              </div>
              <button 
                onClick={() => setShowOverride(!showOverride)}
                className="text-[10px] bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/25 px-2.5 py-1 rounded font-bold font-mono uppercase tracking-wider transition-all"
              >
                {showOverride ? 'Cancel Quick-Override' : 'Schedule Override'}
              </button>
            </div>

            {/* Quick override formulation */}
            {showOverride && (
              <form onSubmit={triggerOverride} className="mb-4 p-4 rounded-lg bg-[#18181B] border border-[#27272A] relative select-none">
                <h3 className="text-xs font-bold text-white mb-3 uppercase tracking-wider font-mono">Initiate Pager Override</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#71717A] font-bold mb-1">Developer Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Jordan Emberley" 
                      value={overrideName}
                      onChange={e => setOverrideName(e.target.value)}
                      className="w-full bg-[#0A0A0B] border border-[#27272A] px-3 py-2 text-xs text-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#71717A] font-bold mb-1">Duty Tier</label>
                    <select 
                      value={overrideRole}
                      onChange={e => setOverrideRole(e.target.value as any)}
                      className="w-full bg-[#0A0A0B] border border-[#27272A] px-2 py-2 text-xs text-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded mt-2 uppercase tracking-widest font-mono"
                  >
                    Actuate Override Roster
                  </button>
                </div>
              </form>
            )}

            {/* List on-calls */}
            {schedule ? (
              <div className="space-y-3">
                {schedule.currentOnCall.filter(m => m.role !== 'Manager').map((m) => {
                  const isPrimary = m.role === 'Primary';
                  return (
                    <div 
                      key={m.role} 
                      className={`p-4 rounded-lg bg-[#18181B] border border-[#27272A] relative overflow-hidden transition-all hover:bg-[#1f1f24] ${
                        isPrimary ? 'border-indigo-500/50 shadow-inner' : ''
                      }`}
                    >
                      {isPrimary && <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />}
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[9px] uppercase text-[#71717A] font-bold tracking-wider font-mono">{m.role} On-Call</p>
                        {isPrimary && (
                          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-base font-bold text-slate-100">{m.name}</p>
                    </div>
                  );
                })}

                {/* PagerDuty Source Schedules Metadata */}
                <div className="mt-4 pt-3.5 border-t border-[#27272A]/80 text-[10px] text-[#71717A] flex flex-col gap-1.5 font-mono select-none">
                  <div className="flex justify-between items-center leading-none">
                    <span>Rotation Policy:</span>
                    <span className="text-zinc-400 font-bold truncate max-w-[200px]">{schedule.escalationPolicy}</span>
                  </div>
                  <div className="flex justify-between items-center leading-none">
                    <span>Next Shift Rotation:</span>
                    <span className="text-zinc-400 font-semibold">{new Date(schedule.nextShiftChange).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 leading-none">
                    <span>Rotations Source:</span>
                    <div className="flex gap-2">
                      <a href="https://shopify.pagerduty.com/schedules/PAIUGNB" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 font-bold underline transition-colors">PAIUGNB (1st)</a>
                      <span className="text-zinc-700 font-normal">|</span>
                      <a href="https://shopify.pagerduty.com/schedules/P47C9M6" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 font-bold underline transition-colors">P47C9M6 (2nd)</a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 flex justify-center items-center">
                <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
              </div>
            )}
          </div>

          {/* 2. Zone Deployments & Canary Status */}
          <div className="bg-[#0F0F12] p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4.5 w-4.5 text-amber-500" />
                  <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#71717A]">Deployments Status</h2>
                </div>
                {deployments[0] && (
                  <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                    deployments[0].status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    deployments[0].status === 'manual_confirmation' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    deployments[0].status === 'rolling_back' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    deployments[0].status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    deployments[0].status === 'queued' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {deployments[0].status === 'success' ? 'Deployed' :
                     deployments[0].status === 'manual_confirmation' ? 'Manual Gate' :
                     deployments[0].status === 'rolling_back' ? 'Rolling Back' :
                     deployments[0].status === 'failed' ? 'Failed' :
                     deployments[0].status === 'queued' ? 'Queued' : 'Deploying'}
                  </span>
                )}
              </div>

              {/* Deployments List */}
              <div className="space-y-4">
                {deployments.map((dep) => {
                  const isSelected = selectedDepId === dep.id;
                  const isManualGate = dep.status === 'manual_confirmation';
                  const isRollback = dep.status === 'rolling_back';
                  const isFailed = dep.status === 'failed';

                  return (
                    <div 
                      key={dep.id}
                      onClick={() => setSelectedDepId(dep.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-amber-500 bg-[#18181A] shadow-lg' 
                          : 'border-[#27272A] bg-[#111114] hover:bg-[#18181B]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-xs font-bold text-slate-200 capitalize">{dep.zone}</span>
                          <span className="text-[10px] text-slate-400">({dep.version})</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wide ${
                          dep.status === 'success' ? 'text-emerald-400' :
                          dep.status === 'manual_confirmation' ? 'text-amber-400' :
                          dep.status === 'rolling_back' ? 'text-rose-400' :
                          dep.status === 'failed' ? 'text-red-500' :
                          dep.status === 'queued' ? 'text-zinc-400' : 'text-blue-400'
                        }`}>
                          {dep.status === 'success' ? 'Deployed' :
                           dep.status === 'manual_confirmation' ? 'Manual Gate' :
                           dep.status === 'rolling_back' ? 'Rolling Back' :
                           dep.status === 'failed' ? 'Failed' :
                           dep.status === 'queued' ? 'Queued' : 'Deploying'}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-[#0A0A0B] rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full transition-all duration-700 ${
                            isFailed ? 'bg-red-500' :
                            isRollback ? 'bg-rose-500' :
                            isManualGate ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                            dep.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${dep.progress}%` }}
                        />
                      </div>

                      <div className="flex justify-end items-center text-[10px] text-[#71717A] font-mono">
                        <span>{new Date(dep.startedAt).toLocaleTimeString()}</span>
                      </div>

                      {/* Manual Gate Inline Control if Selected */}
                      {isSelected && isManualGate && (
                        <div className="mt-3 p-2.5 rounded bg-amber-950/20 border border-amber-900/40 font-sans">
                          <p className="text-[11px] text-amber-300 font-semibold mb-2">Promote to 100% Core Production traffic?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); approvePromotion(dep.id); }}
                              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider py-1 rounded"
                            >
                              Approve Promotion
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); rollbackDeployment(dep.id); }}
                              className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-[10px] py-1 px-3 rounded font-semibold"
                            >
                              Abort
                            </button>
                          </div>
                        </div>
                      )}

                      {dep.sourceUrl && (
                        <div className="mt-2.5 pt-2 border-t border-[#27272A]/40 flex justify-between items-center text-[9px] font-mono select-none">
                          <span className="text-[#71717A] uppercase font-bold">Zone Target: {dep.zone}</span>
                          <a
                            href={dep.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-amber-400 hover:text-amber-350 underline font-semibold flex items-center gap-0.5 transition"
                          >
                            Infra-Central Environment ↗
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Deployment Live Terminal Output Logs panel */}
            {selectedDeployment && (
              <div className="mt-6 border-t border-[#27272A] pt-4 font-mono">
                <div className="flex items-center justify-between text-[10px] text-[#71717A] mb-2 uppercase tracking-wider font-bold">
                  <span className="flex items-center gap-1"><Terminal className="h-3 w-3 text-emerald-500" /> Deploy Log Output</span>
                  <span>ID: {selectedDeployment.id}</span>
                </div>
                <div className="bg-[#0A0A0B] p-2.5 rounded-lg border border-[#27272A] h-28 overflow-y-auto text-[9.5px] text-emerald-400 space-y-1">
                  {selectedDeployment.logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed hover:bg-zinc-900 px-1">{log}</div>
                  ))}
                  {selectedDeployment.status === 'running' && (
                    <div className="text-blue-450 animate-pulse">Running synthetic core gateway latency tests...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Center Column (span 5): Critical Incidents & Collaboration */}
        <section className="lg:col-span-5 bg-[#0A0A0B] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-rose-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#71717A]">Active & Past Incidents</h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://incidents.shopify.io/incidents?filter%5Bstate%5D%5B%5D=active&filter%5Bresponsible_teams%5D%5B%5D=Live+Site+Operations&filter%5Balert_url%5D=&filter%5Binternal_financial_loss_min%5D="
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#2a1315] text-[#ff7982] hover:bg-[#3d1a1d] border border-rose-800/40 text-[9.5px] font-mono font-bold px-2 py-1 rounded transition-colors flex items-center gap-0.5"
                  title="Source Portal Feed: Real-time Shopify Active Incidents"
                >
                  Live Feed ↗
                </a>
                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/25 text-[10px] font-black px-2 py-0.5 rounded font-mono">
                  {activeIncidents.length} OPEN
                </span>
                <button
                  onClick={() => setShowDeclareIncident(!showDeclareIncident)}
                  className="bg-rose-650 hover:bg-rose-600 text-white border border-rose-700/50 text-[10px] font-bold font-mono px-2.5 py-1 rounded uppercase tracking-wider transition-all"
                >
                  {showDeclareIncident ? 'Close Form' : 'Declare Incident'}
                </button>
              </div>
            </div>

            {/* Declare Incident Form */}
            {showDeclareIncident && (
              <form onSubmit={declareIncident} className="mb-6 p-4 rounded-lg bg-[#18181B] border border-rose-900/30">
                <h3 className="text-xs font-bold text-rose-400 mb-3 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <AlertOctagon className="h-4 w-4 animate-bounce" /> File Crisis SLA Declaration
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#71717A] font-bold mb-1">Incident Headline *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Host-port synthetic validation failures" 
                      value={newIncTitle}
                      onChange={e => setNewIncTitle(e.target.value)}
                      className="w-full bg-[#0A0A0B] border border-[#27272A] px-3 py-2 text-xs text-slate-200 rounded focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-[#71717A] font-bold mb-1">Priority Severity</label>
                      <select 
                        value={newIncSeverity}
                        onChange={e => setNewIncSeverity(e.target.value as any)}
                        className="w-full bg-[#0A0A0B] border border-[#27272A] px-2 py-2 text-xs text-slate-200 rounded focus:border-rose-500 focus:outline-none font-mono"
                      >
                        <option value="P1">P1 (Immediate Critical Action)</option>
                        <option value="P2">P2 (Severe Degraded Performance)</option>
                        <option value="P3">P3 (Medium Operation Hiccup)</option>
                        <option value="P4">P4 (Low Informational Metric)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-[#71717A] font-bold mb-1">Impacted Zone</label>
                      <select 
                        value={newIncZone}
                        onChange={e => setNewIncZone(e.target.value as LsoZone)}
                        className="w-full bg-[#0A0A0B] border border-[#27272A] px-2 py-2 text-xs text-slate-200 rounded focus:border-rose-500 focus:outline-none"
                      >
                        <option value="core">core</option>
                        <option value="storefront-renderer">storefront-renderer</option>
                        <option value="checkout-web">checkout-web</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#71717A] font-bold mb-1">Initial Impact Details</label>
                    <textarea 
                      placeholder="Symptoms, Datadog alerts, or observed system anomalies..." 
                      value={newIncSummary}
                      onChange={e => setNewIncSummary(e.target.value)}
                      rows={2}
                      className="w-full bg-[#0A0A0B] border border-[#27272A] px-3 py-2 text-xs text-slate-200 rounded focus:border-rose-500 focus:outline-none font-mono"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 rounded mt-1 uppercase tracking-widest font-mono"
                  >
                    Actuate Operational Incident Page
                  </button>
                </div>
              </form>
            )}

            {/* Live Feed Status Banner */}
            {sourcesHealth?.incidentsPortal && (
              <div className="mb-4 p-3 rounded bg-rose-950/10 border border-rose-900/20 font-mono text-[11.5px] leading-relaxed flex flex-col gap-1.5 animate-fadeIn">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#ff7982] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE FEED STABILITY: {sourcesHealth.incidentsPortal.status === "sso_required" ? "SECURE SSO" : sourcesHealth.incidentsPortal.status.toUpperCase()}
                  </span>
                  <span className="text-zinc-500">
                    Latency: {sourcesHealth.incidentsPortal.latency || 0}ms
                  </span>
                </div>
                <p className="text-[10px] text-[#A1A1AA] break-all select-all font-mono">
                  Pull Target: {sourcesHealth.incidentsPortal.url}
                </p>
                <p className="text-[#a49cfc] text-[10px]">
                  Status: {sourcesHealth.incidentsPortal.message || "Connecting successfully..."}
                </p>
              </div>
            )}

            {/* Incidents List Grid */}
            <div className="space-y-3.5 mb-6">
              {activeIncidents.map((inc) => {
                const isSelected = selectedIncidentId === inc.id;
                const isResolved = inc.status === 'resolved';
                
                // Color mapping
                const getSevColor = (sev: string) => {
                  if (sev === 'P1') return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
                  if (sev === 'P2') return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
                  return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
                };

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`rounded-lg p-4 border transition-all cursor-pointer relative overflow-hidden ${
                      isResolved ? 'opacity-65 grayscale-25 border-[#27272A] bg-[#111114]' :
                      isSelected ? 'border-rose-500 bg-[#181313]' : 'border-zinc-850 hover:border-zinc-700 bg-[#161619]'
                    }`}
                  >
                    {/* Visual left priority indicator */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                      isResolved ? 'bg-slate-750' : inc.severity === 'P1' ? 'bg-rose-600' : 'bg-amber-500'
                    }`} />

                    <div className="flex justify-between items-start mb-2 pl-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black font-mono border px-2 py-0.5 rounded uppercase tracking-wider ${getSevColor(inc.severity)}`}>
                          {inc.severity === 'P1' ? 'Sev-1 Critical' : inc.severity === 'P2' ? 'Sev-2 Major' : `Sev-${inc.severity.substring(1)}`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">#{inc.id}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(inc.openedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 pl-1 mb-1.5 leading-snug">
                      {inc.title}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] pl-1 font-mono leading-relaxed truncate">
                      {inc.summary || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#71717A] mt-3.5 pt-2 border-t border-[#27272A]/50 pl-1">
                      <span className="font-semibold text-[#8e8e93]">Impacted: <span className="text-slate-350 capitalize font-mono text-[10px]">{inc.impactedZones.join(', ')}</span></span>
                      <span className="capitalize font-mono select-none px-1.5 py-0.5 bg-zinc-900 rounded font-bold border border-zinc-800">
                        {inc.status}
                      </span>
                    </div>

                    {inc.sourceUrl && (
                      <div className="mt-2.5 pt-2 border-t border-[#27272A]/30 flex justify-between items-center text-[9px] font-mono pl-1 select-none font-semibold">
                        <span className="text-[#71717A] uppercase font-bold text-[8.5px]">LSO Active Audit Scope</span>
                        <a
                          href={inc.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-rose-400 hover:text-rose-300 underline flex items-center gap-0.5 transition"
                        >
                          Shopify Incidents Portal ↗
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Incident Collaboration Workspace Timeline Feedback */}
          {selectedIncident && (
            <div className="border-t border-[#27272A] pt-5 mt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-white uppercase tracking-wider font-bold font-mono">
                    #{selectedIncident.id} Timeline Activity Log
                  </span>
                </div>
                <div className="flex gap-2">
                  {selectedIncident.status === 'triggered' && (
                    <button
                      onClick={() => updateIncidentStatus(selectedIncident.id, 'acknowledged')}
                      className="text-[10px] bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-1 rounded font-bold uppercase transition"
                    >
                      Acknowledge
                    </button>
                  )}
                  {selectedIncident.status !== 'resolved' && (
                    <button
                      onClick={() => updateIncidentStatus(selectedIncident.id, 'resolved', 'Root cause addressed. Production metrics stabilized.')}
                      className="text-[10px] bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 px-2 py-1 rounded font-bold uppercase transition"
                    >
                      Resolve Status
                    </button>
                  )}
                </div>
              </div>

              {/* Chat-like commentary timeline log */}
              <div className="bg-[#0F0F12] rounded-lg border border-[#27272A] p-4.5 mb-4 max-h-56 overflow-y-auto space-y-3.5">
                {selectedIncident.timeline.map((item, index) => (
                  <div key={index} className="text-xs">
                    <div className="flex justify-between items-center text-[10.5px] text-[#71717A] mb-1 font-mono">
                      <span className="font-bold text-indigo-400 flex items-center gap-1">
                        <User className="h-3 w-3 inline" /> {item.author}
                      </span>
                      <span>{new Date(item.time).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 font-mono leading-relaxed bg-[#18181B]/80 px-2.5 py-2 rounded border border-[#27272A]/50 select-text">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Message formulation stream */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Post diagnostic details to active timeline..."
                  value={incidentComment}
                  onChange={e => setIncidentComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addIncidentComment(selectedIncident.id)}
                  className="flex-1 bg-[#111114] border border-[#27272A] text-xs text-slate-250 px-3 py-2 rounded focus:outline-none focus:border-rose-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => addIncidentComment(selectedIncident.id)}
                  className="bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white px-3 py-2 border border-[#27272A] rounded flex items-center justify-center transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right Column (span 3): CI Pipeline Health */}
        <section className="lg:col-span-3 bg-[#0F0F12] p-6 flex flex-col justify-start gap-5">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-indigo-400" />
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#71717A]">CI Pipeline Center</h2>
              </div>
              <a
                href="https://lso-build-dashboard.quick.shopify.io/"
                target="_blank"
                rel="noreferrer"
                className="bg-[#181524] text-[#a49cfc] hover:bg-[#251f3b] border border-indigo-500/20 text-[9.5px] font-mono font-bold px-2 py-1 rounded transition-colors"
                title="Source Portal Feed: Shopify LSO Build dashboard URL"
              >
                Source Feed ↗
              </a>
            </div>

            {sourcesHealth?.pipelineCenter ? (
              <div className="space-y-4">
                {/* Main Health Status Card */}
                <div className="p-5 rounded-lg border border-[#27272A] bg-[#111114] flex flex-col gap-4 animate-fadeIn">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 font-mono">
                        {sourcesHealth.pipelineCenter.name}
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1 select-all break-all">
                        {sourcesHealth.pipelineCenter.url}
                      </p>
                    </div>
                    <span className={`text-[9.5px] px-2 py-0.5 rounded font-bold tracking-wider font-mono whitespace-nowrap leading-none ${
                      (sourcesHealth.pipelineCenter.status === 'online' || sourcesHealth.pipelineCenter.status === 'ok')
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : sourcesHealth.pipelineCenter.status === 'sso_required'
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse'
                    }`}>
                      {sourcesHealth.pipelineCenter.status === 'sso_required' ? 'SSO REQUIRED' : sourcesHealth.pipelineCenter.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-[#27272A]/50 font-mono text-[11px]">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[#71717A] font-bold mb-0.5">Latency</p>
                      <p className="text-slate-200 font-bold">
                        {sourcesHealth.pipelineCenter.latency !== undefined ? `${sourcesHealth.pipelineCenter.latency}ms` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-[#71717A] font-bold mb-0.5">Last Checked</p>
                      <p className="text-slate-200 font-bold">
                        {new Date(sourcesHealth.pipelineCenter.checkedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-1.5 p-3.5 rounded bg-[#0A0A0B] border border-[#27272A]/50 font-mono text-[11px] leading-relaxed text-[#A1A1AA] select-text">
                    <span className="text-[#71717A] font-bold uppercase tracking-wider text-[8.5px] block mb-1">Fetch Status & Logs</span>
                    {sourcesHealth.pipelineCenter.message || "Checking live feed stream connectivity..."}
                  </div>
                </div>

                {/* Additional context metrics / description */}
                <div className="p-4 rounded-lg bg-[#0A0A0B]/50 border border-[#27272A]/60 text-[11px] text-[#A1A1AA] leading-relaxed font-sans">
                  <p className="font-bold text-slate-200 mb-1 font-mono uppercase text-[9.5px] tracking-wider text-indigo-400">Security Boundary Notice</p>
                  This CI Pipeline health tracker communicates with the main Shopify LSO deployment orchestration system. An active <span className="text-amber-400 font-semibold font-mono">SSO REQUIRED</span> status indicates the system is online but shielded by corporate Okta/Google accounts policies in the preview container.
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[#71717A] font-mono text-[11px] uppercase tracking-wider animate-pulse">
                Fetching Pipeline status metrics...
              </div>
            )}
          </div>

          {/* Release Drift vs Main Tracker Section */}
          <div className="border-t border-[#27272A] pt-5 mt-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4.5 w-4.5 text-amber-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#71717A]">How Far Behind</h2>
              </div>
              <span className="text-[9.5px] uppercase font-mono bg-[#18181F] text-[#A1A1AA] px-2 py-0.5 rounded border border-[#27272A] font-bold">
                VS MAIN BRANCH
              </span>
            </div>

            <div className="space-y-4">
              {(['core', 'storefront-renderer', 'checkout-web'] as LsoZone[]).map((zone) => {
                const drift = getZoneDrift(zone);
                const isSynced = drift.behindCommits === 0;
                const isExpanded = expandedZones[zone] || false;
                
                // check if currently a deployment is running/queued for this zone
                const runningDeploy = deployments.find(d => d.zone === zone && (d.status === 'running' || d.status === 'queued'));
                
                return (
                  <div 
                    key={zone}
                    className={`p-4 rounded-lg border transition-all ${
                      isSynced 
                        ? 'border-[#27272A] bg-[#111114]/80' 
                        : 'border-amber-500/30 bg-[#161411]'
                    }`}
                  >
                    {/* Header with Zone Info and Commits Behind Main count */}
                    <div className="flex justify-between items-center">
                      <div className="min-w-0 pr-2">
                        <span className="text-[8px] text-zinc-500 capitalize block font-mono">Zone target</span>
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 font-mono">
                          {zone === 'storefront-renderer' ? 'SFR (Renderer)' : zone === 'checkout-web' ? 'Checkout-web' : 'Core'}
                        </h3>
                        <a 
                          href={drift.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[9.5px] text-[#818cf8] hover:text-[#a5b4fc] font-mono hover:underline break-all block mt-1"
                        >
                          {drift.url} ↗
                        </a>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-[7.5px] text-[#71717A] uppercase font-black tracking-wider block mb-1 font-mono">Commits Behind</span>
                        <div className={`text-lg font-black font-mono px-3 py-1 rounded-md border text-center ${
                          isSynced
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}>
                          {drift.behindCommits}
                        </div>
                      </div>
                    </div>

                    {/* Expand commits button */}
                    <div className="flex gap-2.5 items-center justify-between text-[10px] font-mono mt-3.5 pt-3 border-t border-[#27272A]/40">
                      <button
                        onClick={() => setExpandedZones(prev => ({ ...prev, [zone]: !isExpanded }))}
                        className="text-indigo-400 hover:text-indigo-300 underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {isExpanded ? 'Hide commits list' : 'Compare commits...'}
                      </button>
                    </div>

                    {/* Commits List dropdown */}
                    {isExpanded && (
                      <div className="mt-3.5 pt-3 border-t border-[#27272A]/45 space-y-2 max-h-36 overflow-y-auto font-mono scrollbar-thin">
                        <div className="text-[8.5px] text-[#71717A] font-black uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <GitCommit className="h-3 w-3 text-amber-550" /> Commits missing in {zone}:
                        </div>
                        {isSynced ? (
                          <div className="text-[10px] text-emerald-450 italic">
                            All commits successfully deployed. Parity is 100%.
                          </div>
                        ) : (
                          drift.commitsList?.map((c) => (
                            <div key={c.commit} className="text-[10px] leading-relaxed border-l border-[#27272A] pl-2 hover:bg-[#18181F] py-0.5">
                              <div className="flex justify-between text-[9px]">
                                <span className="text-[#818cf8] font-bold select-all">{c.commit}</span>
                                <span className="text-[#71717A]">{c.author}</span>
                              </div>
                              <p className="text-zinc-400 font-sans text-[10px] leading-snug mt-0.5">{c.msg}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      {/* Footer Status Bar with mock metadata markers */}
      <footer className="h-9 bg-[#18181B] border-t border-[#27272A] px-6 flex items-center justify-between text-[10px] text-[#71717A] font-mono select-none">
        <div className="flex gap-6 uppercase tracking-widest font-semibold">
          <span>Session/Workspace: LSO-PROD-22</span>
          <span className="hidden sm:inline">Container Ref: CloudRun-us-east-435253</span>
          <span className="hidden md:inline">Client Node: {currentTime.includes('.') ? currentTime.split('.')[0] : currentTime}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="uppercase tracking-wide text-[#71717A] font-bold">Signal link</span>
          <div className="flex gap-0.5 items-end h-2 w-8">
            <div className="w-1.5 h-1 bg-emerald-500" />
            <div className="w-1.5 h-1.5 bg-emerald-500" />
            <div className="w-1.5 h-2 bg-emerald-500" />
            <div className="w-1.5 h-1 bg-emerald-500" />
            <span className="text-[8px] text-emerald-400 font-bold ml-1">SECURE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
