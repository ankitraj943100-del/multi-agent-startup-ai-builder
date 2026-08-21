"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Search,
  Briefcase,
  Cpu,
  TrendingUp,
  Download,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Circle,
  Zap,
} from "lucide-react";
import AgentStep from "@/components/AgentStep";
import { generateStartupPlan, getSessionStatus } from "@/lib/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const AGENT_LIST = [
  { id: "idea", name: "Founder Agent", icon: Rocket, description: "Generates startup name, vision, problem statement, and target audience.", color: "#a78bfa", doing: "Crafting the vision..." },
  { id: "market_research", name: "Market Research Agent", icon: Search, description: "Validates the idea with TAM, competitors, and demand analysis.", color: "#06b6d4", doing: "Analyzing the market..." },
  { id: "product", name: "Product Manager Agent", icon: Briefcase, description: "Defines the MVP feature set and multi-phase product roadmap.", color: "#f59e0b", doing: "Building the roadmap..." },
  { id: "engineering", name: "Engineer Agent", icon: Cpu, description: "Designs system architecture, tech stack, APIs, and database schema.", color: "#10b981", doing: "Designing the stack..." },
  { id: "marketing", name: "Marketing Agent", icon: TrendingUp, description: "Creates go-to-market strategy, channels, and launch content.", color: "#f43f5e", doing: "Planning the launch..." },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [outputs, setOutputs] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (sessionId && status !== "completed" && status !== "failed") {
      interval = setInterval(async () => {
        try {
          const data = await getSessionStatus(sessionId);
          setStatus(data.status);
          setOutputs(data.agentOutputs);
          setLogs(data.logs || []);
          if (data.status === "completed" || data.status === "failed") {
            clearInterval(interval);
            setIsGenerating(false);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [sessionId, status]);

  useEffect(() => {
    if (activityRef.current) {
      activityRef.current.scrollTop = activityRef.current.scrollHeight;
    }
  }, [logs]);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setError(null);
    setOutputs({});
    setLogs([]);
    setSessionId(null);
    setStatus("starting");

    try {
      const { sessionId: newSessionId } = await generateStartupPlan(input);
      setSessionId(newSessionId);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start generation. Is the backend running?");
      setIsGenerating(false);
    }
  };

  const exportPDF = async () => {
    if (!resultsRef.current) return;
    const canvas = await html2canvas(resultsRef.current, {
      scale: 2,
      backgroundColor: "#030712",
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`startup-plan-${outputs?.idea?.startupName || "untitled"}.pdf`);
  };

  const exportMarkdown = () => {
    let md = `# Startup Plan: ${outputs?.idea?.startupName || "Untitled"}\n\n`;
    AGENT_LIST.forEach((agent) => {
      if (outputs[agent.id]) {
        md += `## ${agent.name}\n`;
        md += `\`\`\`json\n${JSON.stringify(outputs[agent.id], null, 2)}\n\`\`\`\n\n`;
      }
    });
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `startup-plan-${outputs?.idea?.startupName || "untitled"}.md`;
    a.click();
  };

  const progress = (Object.keys(outputs).length / AGENT_LIST.length) * 100;

  const getAgentStatus = (agentId: string, index: number) => {
    if (outputs[agentId]) return "completed";
    if (status === "running") {
      const currentActiveIndex = AGENT_LIST.findIndex((a) => !outputs[a.id]);
      if (index === currentActiveIndex) return "running";
    }
    if (status === "failed") {
      const lastIndex = AGENT_LIST.findIndex((a) => !outputs[a.id]);
      if (index === lastIndex) return "failed";
    }
    return "pending";
  };

  return (
    <>
      {/* Progress Bar */}
      {isGenerating && (
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          AI Startup Team
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          Your AI-powered board of directors. One prompt. Five experts. Complete blueprint.
        </motion.p>
      </header>

      {/* Input */}
      <div className="input-bar">
        <input
          type="text"
          placeholder="Describe your startup idea..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          disabled={isGenerating}
        />
        <button onClick={handleGenerate} disabled={isGenerating || !input.trim()}>
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
          {isGenerating ? "Working..." : "Generate"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-banner">
          <div className="error-banner-inner">
            <AlertCircle size={18} />
            {error}
          </div>
        </motion.div>
      )}

      {/* Dashboard */}
      <div className="dashboard">
        {/* LEFT: Insight Cards */}
        <div className="panel-left" ref={resultsRef}>
          <AnimatePresence>
            {AGENT_LIST.map((agent, index) => (
              <AgentStep
                key={agent.id}
                {...agent}
                status={getAgentStatus(agent.id, index) as any}
                output={outputs[agent.id]}
              />
            ))}
          </AnimatePresence>

          {status === "completed" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="export-actions"
            >
              <button className="export-btn" onClick={exportPDF}>
                <Download size={16} />
                Download PDF
              </button>
              <button className="export-btn" onClick={exportMarkdown}>
                <FileText size={16} />
                Export Markdown
              </button>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Activity Feed */}
        <div className="panel-right">
          <div className="activity-panel">
            {/* Agent Steps */}
            <div className="activity-header">
              <Zap size={14} />
              Agent Pipeline
            </div>
            {AGENT_LIST.map((agent, index) => {
              const s = getAgentStatus(agent.id, index);
              const AgentIcon = agent.icon;
              return (
                <div
                  key={agent.id}
                  className={`agent-step-item ${s === "running" ? "is-active" : s === "completed" ? "is-done" : "is-pending"}`}
                >
                  <div className={`agent-step-icon ${s === "running" ? "active-bg" : s === "completed" ? "done-bg" : "pending-bg"}`}>
                    {s === "running" ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Loader2 size={14} style={{ color: agent.color }} />
                      </motion.div>
                    ) : s === "completed" ? (
                      <CheckCircle2 size={14} style={{ color: "#10b981" }} />
                    ) : (
                      <Circle size={14} style={{ color: "#475569" }} />
                    )}
                  </div>
                  <div className="step-label">
                    <span>{agent.name}</span>
                    {s === "running" && <span className="step-sublabel">{agent.doing}</span>}
                    {s === "completed" && <span className="step-sublabel">Done ✓</span>}
                  </div>
                </div>
              );
            })}

            {/* Logs */}
            <div className="activity-header" style={{ marginTop: "0.5rem" }}>
              {isGenerating && <div className="dot-live" />}
              Live Logs
            </div>
            <div className="activity-body" ref={activityRef}>
              {logs.length === 0 && (
                <div style={{ color: "var(--text-dim)", fontSize: "0.8rem", padding: "0.5rem 0" }}>
                  Logs will appear here when an agent starts working...
                </div>
              )}
              {logs.map((log, idx) => (
                <div key={idx} className="activity-item">
                  <div className={`activity-dot ${log.level}`} />
                  <div>
                    <div className="activity-text">{log.message}</div>
                    <span className="activity-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
