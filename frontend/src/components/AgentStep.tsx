"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, CheckCircle2, Loader2, Circle } from "lucide-react";

interface AgentStepProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: "pending" | "running" | "completed" | "failed";
  output?: any;
}

const ICON_COLORS: Record<string, string> = {
  idea: "#a78bfa",
  market_research: "#06b6d4",
  product: "#f59e0b",
  engineering: "#10b981",
  marketing: "#f43f5e",
};

const AgentStep: React.FC<AgentStepProps> = ({
  id,
  name,
  description,
  icon: Icon,
  status,
  output,
}) => {
  const color = ICON_COLORS[id] || "#a78bfa";
  const isActive = status === "running";
  const isDone = status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`insight-card ${isActive ? "active" : ""} ${isDone ? "completed" : ""}`}
    >
      {/* Show loading state when running */}
      {isActive && !output && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
            <Loader2 size={18} style={{ color }} />
          </motion.div>
          <span style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>Generating insights...</span>
        </div>
      )}

      {/* Show only the data output — no agent name */}
      {output && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="output-section"
        >
          <FormattedOutput data={output} />
        </motion.div>
      )}

      {/* Pending state: subtle placeholder */}
      {!isActive && !output && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0", opacity: 0.3 }}>
          <Circle size={14} />
          <span style={{ fontSize: "0.85rem" }}>Waiting...</span>
        </div>
      )}
    </motion.div>
  );
};

// Helper: format a key string to a readable label
const formatKey = (key: string) =>
  key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

// Check if array items are objects with consistent keys (table-worthy)
const isTableArray = (arr: any[]): boolean => {
  if (arr.length === 0) return false;
  return arr.every((item) => typeof item === "object" && item !== null && !Array.isArray(item));
};

// Recursive renderer for nested data
const FormattedOutput: React.FC<{ data: any }> = ({ data }) => {
  if (typeof data === "string") return <span className="output-val text">{data}</span>;
  if (typeof data === "number" || typeof data === "boolean")
    return <span className="output-val number">{data.toString()}</span>;

  if (Array.isArray(data)) {
    // Render as TABLE if items are objects
    if (isTableArray(data)) {
      const keys = Array.from(new Set(data.flatMap((item) => Object.keys(item))));
      return (
        <div className="output-table-wrap">
          <table className="output-table">
            <thead>
              <tr>
                {keys.map((k) => (
                  <th key={k}>{formatKey(k)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {keys.map((k) => (
                    <td key={k}>
                      {typeof row[k] === "object" ? (
                        <FormattedOutput data={row[k]} />
                      ) : (
                        row[k]?.toString() || "—"
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Render as bullet list for simple arrays
    return (
      <ul className="output-list">
        {data.map((item, idx) => (
          <li key={idx}>
            <div className="output-list-bullet" />
            <div className="output-list-content">
              <FormattedOutput data={item} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof data === "object" && data !== null) {
    return (
      <div>
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="output-row">
            <div className="output-key">{formatKey(key)}</div>
            <div className="output-val-container">
              <FormattedOutput data={val} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default AgentStep;
