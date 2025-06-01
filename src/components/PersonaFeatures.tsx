import React, { useState } from "react";
import { motion } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import {
  MessageSquare, Workflow, AlertCircle, UserPlus, Cloud, 
  LinkIcon, Shield, LineChart, Zap
} from "lucide-react";

// Define feature structure
interface Feature {
  title: string;
  description: string;
  details: string;
  icon: React.ElementType;
  gradient: string;
}

// Define persona structure
interface Persona {
  name: string;
  features: Feature[];
}

const PersonaFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("DevOps");
  const [openFeatures, setOpenFeatures] = useState<string[]>([]);

  // Toggle feature expansion
  const toggleFeature = (featureTitle: string) => {
    setOpenFeatures(prev => 
      prev.includes(featureTitle) 
        ? prev.filter(title => title !== featureTitle)
        : [...prev, featureTitle]
    );
  };

  // Define all features
  const allFeatures: Record<string, Feature> = {
    conversational: {
      title: "Conversational Interface (ChatOps)",
      description: "Interact with your infrastructure in plain English. ZapGap integrates with Slack, Microsoft Teams, and a web chat console, so you can simply ask for what you need.",
      details: "No more digging through consoles or writing ad-hoc scripts – just type requests like you would to a colleague (e.g. 'Deploy the new build to staging' or 'Is there any CPU alarm right now?') and ZapGap will understand and act. The assistant can ask clarifying questions and confirm critical actions, making the experience truly conversational and user-friendly.",
      icon: MessageSquare,
      gradient: "from-blue-400 to-indigo-500"
    },
    workflow: {
      title: "Workflow Automation",
      description: "Under the hood, ZapGap can execute multi-step workflows that span multiple services and tools.",
      details: "For example, when you ask it to 'resolve that alert,' ZapGap might automatically diagnose the issue (check logs, metrics), apply a fix (restart a service, clear a queue), verify the resolution, and even update your incident ticket. These complex playbooks are carried out instantly and consistently. You can also customize or create new workflows – teach ZapGap new actions or sequences with minimal effort, leveraging your existing scripts or Infrastructure-as-Code.",
      icon: Workflow,
      gradient: "from-purple-400 to-pink-500"
    },
    incident: {
      title: "Intelligent Incident Remediation",
      description: "ZapGap acts as a tireless SRE on your team. It monitors for issues and can either alert you with insights or automatically trigger remediation steps for known problems.",
      details: "Using both predefined runbooks and AI reasoning, ZapGap can handle many incidents autonomously – such as scaling up resources when traffic spikes or restarting a failed container – and notify your team of the outcome. This dramatically reduces MTTR (Mean Time to Recovery) and midnight pages for on-call engineers. ZapGap's knowledge of past incidents and solutions grows over time, so it becomes more effective at preventing repeat issues.",
      icon: AlertCircle,
      gradient: "from-red-400 to-orange-500"
    },
    selfService: {
      title: "Self-Service for Developers",
      description: "With ZapGap, DevOps and IT teams can safely delegate routine tasks. Developers or QA engineers can request operations via ZapGap instead of filing tickets.",
      details: "For instance, a developer could ask, 'Give me a new testing database' – ZapGap will handle the provisioning and configure the environment according to policy (perhaps requiring an approval if it's production). This controlled self-service boosts team productivity and morale: less waiting, less bottlenecks, and more time for everyone to focus on important work.",
      icon: UserPlus,
      gradient: "from-green-400 to-teal-500"
    },
    multiCloud: {
      title: "Multi-Cloud & Hybrid Support",
      description: "ZapGap isn't limited to a single cloud. While initially optimized for AWS, our roadmap brings the same AI assistance to Azure, GCP, and private clouds.",
      details: "The platform's modular connectors and agent approach mean ZapGap can unify operations across disparate environments. Manage your AWS, Azure, and on-prem servers all through one assistant. No more context-switching between tools – ZapGap becomes your central command center for all infrastructure.",
      icon: Cloud,
      gradient: "from-cyan-400 to-blue-500"
    },
    integrations: {
      title: "Extensive Integrations",
      description: "ZapGap plays nicely with the tools you already use. It can integrate with CI/CD pipelines, configuration management, version control, monitoring, and more.",
      details: "This means ZapGap can trigger builds, merge code, fetch runbook pages, create tickets, or update documentation as part of its actions. The assistant becomes a connective tissue between systems, automating handoffs that used to be manual. Our integration philosophy: if it has an API, we can teach ZapGap to work with it.",
      icon: LinkIcon,
      gradient: "from-yellow-400 to-amber-500"
    },
    security: {
      title: "Security, Compliance & Governance",
      description: "Enterprise customers can trust that ZapGap is secure by design. All actions require proper authentication and are checked against your security policies.",
      details: "You can integrate with SSO/LDAP for user identity, ensuring only authorized personnel can invoke certain commands. Audit logs record who asked ZapGap to do what, and when, with full detail – critical for compliance and post-incident reviews. Additionally, ZapGap comes with built-in guardrails: for example, it won't delete databases or expose secrets unless explicitly allowed. It can also enforce tagging standards, verify configs against compliance rules, and suggest remediation if something drifts out of policy.",
      icon: Shield,
      gradient: "from-indigo-400 to-violet-500"
    },
    insights: {
      title: "Insights & Optimization Recommendations",
      description: "Beyond just doing what you ask, ZapGap proactively analyzes usage patterns and configurations to provide recommendations.",
      details: "It might alert you to underutilized resources ('These 20 VMs have low utilization – consider rightsizing or shutting them down to save costs.') or suggest improvements ('We noticed your access key hasn't rotated in 90 days – would you like ZapGap to handle the rotation?'). These AI-driven insights help you continuously optimize for cost, performance, and security, acting like a smart advisor always keeping an eye on your cloud.",
      icon: LineChart,
      gradient: "from-pink-400 to-rose-500"
    },
    zeroConfig: {
      title: "Zero-Config Setup & Continuous Learning",
      description: "Getting started with ZapGap is easy – connect it to your AWS account in minutes via a secure role, and the assistant will immediately begin learning about your environment.",
      details: "It uses existing data (configurations, monitoring, ticket history) to ramp up its knowledge. Over time, ZapGap's models learn from your team's preferences and the solutions that work best in your context. The more you use it, the more tailored and efficient it becomes. We handle all the AI model tuning and updates behind the scenes (in our managed cloud service), so you always have the latest capabilities without maintenance overhead.",
      icon: Zap,
      gradient: "from-emerald-400 to-green-500"
    }
  };

  // Define personas with their features
  const personas: Persona[] = [
    {
      name: "DevOps",
      features: [
        allFeatures.conversational,
        allFeatures.workflow,
        allFeatures.selfService,
        allFeatures.multiCloud,
        allFeatures.integrations,
        allFeatures.zeroConfig
      ]
    },
    {
      name: "SecOps",
      features: [
        allFeatures.incident,
        allFeatures.security,
        allFeatures.zeroConfig,
        allFeatures.conversational
      ]
    },
    {
      name: "FinOps",
      features: [
        allFeatures.insights,
        allFeatures.multiCloud,
        allFeatures.integrations,
        allFeatures.zeroConfig
      ]
    }
  ];

  // Get current persona's features
  const currentPersona = personas.find(p => p.name === activeTab) || personas[0];

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-gray-900/50 backdrop-blur-sm rounded-full p-1 border border-white/10">
          {personas.map((persona) => (
            <button
              key={persona.name}
              onClick={() => setActiveTab(persona.name)}
              className={`relative px-6 py-3 rounded-full transition-all duration-300 ${
                activeTab === persona.name
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {activeTab === persona.name && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 font-medium" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                For {persona.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <motion.div 
        className="flex flex-col gap-4 max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        key={activeTab}
      >
        {currentPersona.features.map((feature, index) => (
          <motion.div 
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Collapsible 
              open={openFeatures.includes(feature.title)}
              onOpenChange={() => toggleFeature(feature.title)}
            >
              <Card className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all duration-300">
                <CollapsibleTrigger asChild>
                  <div className="w-full cursor-pointer">
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center`}>
                            <feature.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.01em' }}>
                              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${feature.gradient}`}>{feature.title}</span>
                            </h3>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: openFeatures.includes(feature.title) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-5 pb-5 border-t border-gray-800/50 pt-4">
                    <div className="space-y-3">
                      <p className="text-gray-300 text-sm" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                        {feature.description}
                      </p>
                      <p className="text-gray-400 text-xs leading-relaxed" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                        {feature.details}
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PersonaFeatures;
