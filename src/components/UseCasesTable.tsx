import React from "react";
import { motion } from "framer-motion";
import {
  Zap, Shield, Cog, Cloud, Users, Target, Gauge, Lock, 
  Github, Linkedin, Twitter, MessageCircle, Sparkles, Brain, 
  Cpu, Network, ChevronRight, CheckCircle, AlertCircle,
  MessageSquare, Workflow, UserPlus, Link as LinkIcon, LineChart, ChevronDown,
  Server, Database, Code, Terminal, Settings, Layers, GitBranch, Activity
} from "lucide-react";

// Define the table data structure
interface TableRow {
  category: string;
  businessPain: string;
  howZapGapAssists: string;
  impactValue: string;
  icon: React.ElementType;
  gradient: string;
}

const UseCasesTable: React.FC = () => {
  // Table data based on the image
  const tableData: TableRow[] = [
    {
      category: "Proactively Preventing Downtime with Smart Ops",
      businessPain: "SRE engineers manually search through logs and metrics to find the root cause. Requires tribal knowledge to log into the right systems.",
      howZapGapAssists: "ZapGap detects high CPU/memory usage, identifies the root cause, and takes action. Sends Slack/Teams notifications with context.",
      impactValue: "Ping saved 40+ hours/month in manual investigation. Reduced downtime by 70%.",
      icon: Shield,
      gradient: "from-purple-500 to-pink-400"
    },
    {
      category: "Daily Cloud Tracking & Optimization",
      businessPain: "IT managers manually review cloud costs, often caught too late. Difficult to attribute costs to teams.",
      howZapGapAssists: "Daily ZapGap AWS cost tracking. Identifies unused resources, orphaned volumes, and suggests right-sizing.",
      impactValue: "No manual analysis needed. Identified $250K/mo in savings. Automated cleanup.",
      icon: Gauge,
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      category: "Security and Compliance Monitoring",
      businessPain: "Security audits are manual, time-consuming, and error-prone. S3 encryption, IAM permissions, etc.",
      howZapGapAssists: "CTO types 'Find open S3 buckets' and ZapGap scans for public-accessible resources.",
      impactValue: "Daily scans and auto-remediation. Proactive compliance. Reduced audit time by 80%.",
      icon: Lock,
      gradient: "from-red-500 to-orange-400"
    },
    {
      category: "Automated Runbooks & Incident Response",
      businessPain: "DevOps engineer must create, update, and execute runbooks. Tribal knowledge.",
      howZapGapAssists: "Engineers type 'How to deploy new app to dev', and ZapGap walks them through steps.",
      impactValue: "New knowledge automatically documented. Recommendation for auto-remediation.",
      icon: Terminal,
      gradient: "from-green-500 to-teal-400"
    },
    {
      category: "Connecting New Engineers Faster",
      businessPain: "New hires struggle with 'how things work'. Tribal knowledge.",
      howZapGapAssists: "ZapGap 'buddy' for new hires to quickly get context on systems.",
      impactValue: "New team onboarding reduced from 3 weeks to 3 days.",
      icon: Users,
      gradient: "from-indigo-500 to-blue-400"
    },
    {
      category: "Multi-Account Tagging Governance",
      businessPain: "Managing multiple AWS accounts with consistent tagging is manual and error-prone.",
      howZapGapAssists: "IT team types 'Find all resources missing required tags' and ZapGap provides report.",
      impactValue: "Centralized control. Reduced manual governance overhead.",
      icon: Settings,
      gradient: "from-amber-500 to-yellow-400"
    },
    {
      category: "IaC & Rightsizing Recommendations",
      businessPain: "CTO sees cloud costs growing. Manual review of Terraform.",
      howZapGapAssists: "ZapGap scans Terraform files and suggests optimizations for cost, security, and performance.",
      impactValue: "Smarter architecture decisions. Reduced manual review time.",
      icon: Code,
      gradient: "from-emerald-500 to-green-400"
    }
  ];

  return (
    <div className="w-full overflow-hidden">
      <div className="relative">
        {/* Background glow effects */}
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-purple-700/20 to-blue-700/10 blur-[80px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-cyan-700/20 to-teal-700/10 blur-[80px] animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      <div className="grid grid-cols-1 gap-6 relative z-10">
        {tableData.map((row, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Category with Icon */}
                  <div className="md:w-1/4 flex flex-col items-start">
                    <div className={`w-12 h-12 bg-gradient-to-br ${row.gradient} rounded-lg flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <row.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      <span className={`bg-clip-text text-transparent bg-gradient-to-r ${row.gradient}`}>
                        {row.category}
                      </span>
                    </h3>
                  </div>

                  {/* Business Pain */}
                  <div className="md:w-1/4">
                    <div className="mb-2">
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Business Pain</span>
                    </div>
                    <p className="text-gray-300 text-sm" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      {row.businessPain}
                    </p>
                  </div>

                  {/* How ZapGap Assists */}
                  <div className="md:w-1/4">
                    <div className="mb-2">
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">How ZapGap Assists</span>
                    </div>
                    <p className="text-gray-300 text-sm" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      {row.howZapGapAssists}
                    </p>
                  </div>

                  {/* Impact/Value */}
                  <div className="md:w-1/4">
                    <div className="mb-2">
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Impact/Value</span>
                    </div>
                    <p className="text-gray-300 text-sm" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      {row.impactValue}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UseCasesTable;
