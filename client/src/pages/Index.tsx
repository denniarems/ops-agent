import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Zap, Shield, Cog, Cloud, Users, Target, Gauge, Lock,
  Github, Linkedin, Twitter, MessageCircle, Sparkles, Brain,
  Cpu, Network, ChevronRight, CheckCircle, AlertCircle,
  MessageSquare, Workflow, UserPlus, Link as LinkIcon, LineChart, ChevronDown
} from "lucide-react";
import { SignedIn } from "@clerk/clerk-react";
import AuthButton from "@/components/auth/AuthButton";
import PlatformSection from "@/components/PlatformSection";
import UseCasesTable from "@/components/UseCasesTable";
import PersonaFeatures from "@/components/PersonaFeatures";
import ModernTextTransition from "@/components/ModernTextTransition";
import AIAgentsTitle from "@/components/AIAgentsTitle";

const AnimatedTextCycler = ({ texts }: { texts: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (!texts || texts.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % texts.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [texts]);
  
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold mb-2">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-text-shimmer bg-[length:200%_auto] drop-shadow-[0_0_8px_rgba(58,188,247,0.5)]">AI Agents</span>
      </div>
      <div className="font-mono text-xl md:text-2xl lg:text-2xl text-white flex items-center justify-center h-8 overflow-hidden">
        <span className="mr-2">for</span>
        <div className="relative overflow-hidden">
          <span 
            className={`text-gradient-animated font-bold transition-all duration-500 block ${isAnimating ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'}`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {texts[currentIndex] || "Cloud Troubleshooting"}
          </span>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  // State for features section
  // Note: activeUseCase state removed as it's no longer needed
  const [email, setEmail] = useState("");
  const [openFeatures, setOpenFeatures] = useState<number[]>([]);
  
  // Scroll animation values
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFeature = (index: number) => {
    setOpenFeatures(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const useCases = [
    {
      title: "SRE Teams",
      problem: "Frequent late-night alerts were waking the on-call engineer – e.g. a memory leak on a server caused crashes every few weeks. Manually restarting services and cleaning up resources at 2 AM was becoming unsustainable, and critical SLA uptimes were at risk.",
      solution: "ZapGap was configured to monitor the service and detect the early warning signs of the memory leak. Upon detection of high memory usage, ZapGap's auto-remediation workflow kicked in: it safely restarted the affected service, cleared caches, and even notified the team on Slack of the action taken. All of this happened within seconds of the anomaly.",
      impact: "MTTR dropped from 30 min to <1 min",
      icon: Shield,
      gradient: "from-purple-500 to-pink-400"
    },
    {
      title: "DevOps Teams",
      problem: "Developers needed to spin up test environments and run database migrations, but each request to Ops took hours or days in the ticket queue. The platform engineering team was bottlenecked with repetitive requests, pulling them away from strategic projects. This led to frustration on both sides and slower release cycles.",
      solution: "With ZapGap acting as an AI-powered self-service portal, developers can simply ask for resources or changes themselves. For example, a developer messages ZapGap: 'Create a new QA environment for the payment service.' ZapGap verifies the request against policy, then proceeds to provision a standardized environment. If a request touches production, ZapGap automatically routes an approval request to the relevant DevOps lead.",
      impact: "40% reduction in ticket workload",
      icon: Cog,
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      title: "LEADERSHIP",
      problem: "The CTO and IT Head noticed rising cloud costs with many underutilized resources (idle VMs, unattached storage volumes, forgotten dev/test environments running 24/7). Manually tracking and managing cloud sprawl was difficult, and monthly cloud bills were exceeding forecasts.",
      solution: "ZapGap was employed as a vigilant cost optimizer. It continuously scanned the cloud accounts for low-hanging fruit – instances running under 5% CPU, obsolete snapshots, or dev machines left on over the weekend. Through natural language or scheduled reports, ZapGap would surface opportunities and execute the clean-up tasks with proper logging and notifications.",
      impact: "25% reduction in AWS costs",
      icon: Brain,
      gradient: "from-orange-500 to-red-400"
    },
    {
      title: "IT Teams",
      problem: "An IT administrator was tasked with keeping the cloud environment compliant with security and operational best practices. This included enforcing encryption, using approved machine images, and adhering to regulatory standards. Manually auditing these across dozens of accounts and resources was tedious and error-prone, leading to occasional compliance gaps.",
      solution: "ZapGap was configured with a set of policy rules and compliance checks. It continuously scans the infrastructure for deviations: if a developer creates a resource that violates a rule, ZapGap flags it or auto-corrects it per policy. For example, when a new S3 bucket was created without encryption, ZapGap immediately identified it and applied the encryption setting, then notified the team.",
      impact: "Near-zero security incidents",
      icon: Network,
      gradient: "from-green-500 to-teal-400"
    }
  ];

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Waitlist signup:", email);
    setEmail("");
  };

  const features = [
    {
      title: "Conversational Interface (ChatOps)",
      description: "Interact with your infrastructure in plain English. ZapGap integrates with Slack, Microsoft Teams, and a web chat console, so you can simply ask for what you need.",
      details: "No more digging through consoles or writing ad-hoc scripts – just type requests like you would to a colleague (e.g. 'Deploy the new build to staging' or 'Is there any CPU alarm right now?') and ZapGap will understand and act. The assistant can ask clarifying questions and confirm critical actions, making the experience truly conversational and user-friendly.",
      icon: MessageSquare,
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      title: "Workflow Automation",
      description: "Under the hood, ZapGap can execute multi-step workflows that span multiple services and tools.",
      details: "For example, when you ask it to 'resolve that alert,' ZapGap might automatically diagnose the issue (check logs, metrics), apply a fix (restart a service, clear a queue), verify the resolution, and even update your incident ticket. These complex playbooks are carried out instantly and consistently. You can also customize or create new workflows – teach ZapGap new actions or sequences with minimal effort, leveraging your existing scripts or Infrastructure-as-Code.",
      icon: Workflow,
      gradient: "from-purple-400 to-pink-500"
    },
    {
      title: "Intelligent Incident Remediation",
      description: "ZapGap acts as a tireless SRE on your team. It monitors for issues and can either alert you with insights or automatically trigger remediation steps for known problems.",
      details: "Using both predefined runbooks and AI reasoning, ZapGap can handle many incidents autonomously – such as scaling up resources when traffic spikes or restarting a failed container – and notify your team of the outcome. This dramatically reduces MTTR (Mean Time to Recovery) and midnight pages for on-call engineers. ZapGap's knowledge of past incidents and solutions grows over time, so it becomes more effective at preventing repeat issues.",
      icon: AlertCircle,
      gradient: "from-red-400 to-orange-500"
    },
    {
      title: "Self-Service for Developers",
      description: "With ZapGap, DevOps and IT teams can safely delegate routine tasks. Developers or QA engineers can request operations via ZapGap instead of filing tickets.",
      details: "For instance, a developer could ask, 'Give me a new testing database' – ZapGap will handle the provisioning and configure the environment according to policy (perhaps requiring an approval if it's production). This controlled self-service boosts team productivity and morale: less waiting, less bottlenecks, and more time for everyone to focus on important work.",
      icon: UserPlus,
      gradient: "from-green-400 to-teal-500"
    },
    {
      title: "Multi-Cloud & Hybrid Support",
      description: "ZapGap isn't limited to a single cloud. While initially optimized for AWS, our roadmap brings the same AI assistance to Azure, GCP, and private clouds.",
      details: "The platform's modular connectors and agent approach mean ZapGap can unify operations across disparate environments. Manage your AWS, Azure, and on-prem servers all through one assistant. No more context-switching between tools – ZapGap becomes your central command center for all infrastructure.",
      icon: Cloud,
      gradient: "from-cyan-400 to-blue-500"
    },
    {
      title: "Extensive Integrations",
      description: "ZapGap plays nicely with the tools you already use. It can integrate with CI/CD pipelines, configuration management, version control, monitoring, and more.",
      details: "This means ZapGap can trigger builds, merge code, fetch runbook pages, create tickets, or update documentation as part of its actions. The assistant becomes a connective tissue between systems, automating handoffs that used to be manual. Our integration philosophy: if it has an API, we can teach ZapGap to work with it.",
      icon: LinkIcon,
      gradient: "from-yellow-400 to-amber-500"
    },
    {
      title: "Security, Compliance & Governance",
      description: "Enterprise customers can trust that ZapGap is secure by design. All actions require proper authentication and are checked against your security policies.",
      details: "You can integrate with SSO/LDAP for user identity, ensuring only authorized personnel can invoke certain commands. Audit logs record who asked ZapGap to do what, and when, with full detail – critical for compliance and post-incident reviews. Additionally, ZapGap comes with built-in guardrails: for example, it won't delete databases or expose secrets unless explicitly allowed. It can also enforce tagging standards, verify configs against compliance rules, and suggest remediation if something drifts out of policy.",
      icon: Shield,
      gradient: "from-indigo-400 to-violet-500"
    },
    {
      title: "Insights & Optimization Recommendations",
      description: "Beyond just doing what you ask, ZapGap proactively analyzes usage patterns and configurations to provide recommendations.",
      details: "It might alert you to underutilized resources ('These 20 VMs have low utilization – consider rightsizing or shutting them down to save costs.') or suggest improvements ('We noticed your access key hasn't rotated in 90 days – would you like ZapGap to handle the rotation?'). These AI-driven insights help you continuously optimize for cost, performance, and security, acting like a smart advisor always keeping an eye on your cloud.",
      icon: LineChart,
      gradient: "from-pink-400 to-rose-500"
    },
    {
      title: "Zero-Config Setup & Continuous Learning",
      description: "Getting started with ZapGap is easy – connect it to your AWS account in minutes via a secure role, and the assistant will immediately begin learning about your environment.",
      details: "It uses existing data (configurations, monitoring, ticket history) to ramp up its knowledge. Over time, ZapGap's models learn from your team's preferences and the solutions that work best in your context. The more you use it, the more tailored and efficient it becomes. We handle all the AI model tuning and updates behind the scenes (in our managed cloud service), so you always have the latest capabilities without maintenance overhead.",
      icon: Zap,
      gradient: "from-emerald-400 to-green-500"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Background gradient elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-50">
        <div className="absolute top-[-300px] right-[-300px] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-700/30 to-blue-700/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-cyan-700/20 to-teal-700/10 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-pink-700/15 to-red-700/10 blur-[80px] animate-pulse" style={{ animationDuration: '12s' }}></div>
      </div>
      {/* Header */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
                <motion.img 
                  src="/lovable-uploads/145c593f-1a1b-45a8-914e-d151ce53c695.png" 
                  alt="ZapGap Logo" 
                  className="h-20 w-auto brightness-0 invert relative"
                  initial={{ rotate: -5 }}
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
            
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { name: 'Platform', href: '#platform' },
                { name: 'Features', href: '#features' },
                { name: 'Use Cases', href: '#use-cases' }
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="relative px-4 py-2 text-gray-300 hover:text-white group overflow-hidden rounded-full transition-all duration-300"
                  style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.01em' }}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#3ABCF7]/20 to-[#8B2FF8]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
                  <span className="relative font-medium">{item.name}</span>
                </a>
              ))}

              {/* Dashboard Link for Authenticated Users */}
              <SignedIn>
                <a
                  href="/dashboard"
                  className="relative px-4 py-2 text-gray-300 hover:text-white group overflow-hidden rounded-full transition-all duration-300"
                  style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.01em' }}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#3ABCF7]/20 to-[#8B2FF8]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
                  <span className="relative font-medium">Dashboard</span>
                </a>
              </SignedIn>
            </nav>

            {/* Authentication Section */}
            <div className="flex items-center space-x-4">
              <AuthButton variant="header" />
            </div>

          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center particles-bg z-10">
        <div className="absolute inset-0 bg-black opacity-90"></div>
        
        {/* Dynamic neural network animation with reduced visibility */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {/* Neural network nodes */}
          <div className="absolute w-full h-full">
            {/* Static nodes */}
            <div className="absolute top-[15%] left-[20%] w-4 h-4 bg-gradient-to-r from-[#3ABCF7] to-[#5B7CF7] rounded-full blur-[2px] opacity-40 animate-[neural-pulse_2s_ease-in-out_infinite]"></div>
            <div className="absolute top-[30%] left-[40%] w-5 h-5 bg-gradient-to-r from-[#5B7CF7] to-[#8B2FF8] rounded-full blur-[2px] opacity-35 animate-[neural-pulse_2.5s_ease-in-out_infinite_0.5s]"></div>
            <div className="absolute top-[60%] left-[25%] w-3 h-3 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] rounded-full blur-[2px] opacity-40 animate-[neural-pulse_1.8s_ease-in-out_infinite_0.5s]"></div>
            <div className="absolute top-[20%] left-[70%] w-4 h-4 bg-gradient-to-r from-[#3ABCF7] to-[#5B7CF7] rounded-full blur-[2px] opacity-35 animate-[neural-pulse_2.2s_ease-in-out_infinite_0.7s]"></div>
            <div className="absolute top-[70%] left-[65%] w-5 h-5 bg-gradient-to-r from-[#5B7CF7] to-[#8B2FF8] rounded-full blur-[2px] opacity-40 animate-[neural-pulse_2.4s_ease-in-out_infinite_0.2s]"></div>
            <div className="absolute top-[45%] left-[80%] w-3 h-3 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] rounded-full blur-[2px] opacity-35 animate-[neural-pulse_1.9s_ease-in-out_infinite_0.4s]"></div>
            
            {/* Moving nodes */}
            <div className="absolute top-[25%] w-3 h-3 bg-[#3ABCF7] rounded-full blur-[2px] opacity-40 animate-[neural-travel_15s_linear_infinite]" style={{['--start-x' as string]: '-5%', ['--end-x' as string]: '105%'}}></div>
            <div className="absolute top-[55%] w-2 h-2 bg-[#5B7CF7] rounded-full blur-[2px] opacity-35 animate-[neural-travel_12s_linear_infinite_2s]" style={{['--start-x' as string]: '105%', ['--end-x' as string]: '-5%'}}></div>
            <div className="absolute top-[75%] w-3 h-3 bg-[#8B2FF8] rounded-full blur-[2px] opacity-40 animate-[neural-travel_18s_linear_infinite_4s]" style={{['--start-x' as string]: '-5%', ['--end-x' as string]: '105%'}}></div>
            <div className="absolute top-[35%] w-2 h-2 bg-[#3ABCF7] rounded-full blur-[2px] opacity-35 animate-[neural-travel_14s_linear_infinite_6s]" style={{['--start-x' as string]: '105%', ['--end-x' as string]: '-5%'}}></div>
            
            {/* Floating nodes with glow */}
            <div className="absolute top-[40%] left-[50%] w-6 h-6 bg-gradient-to-r from-[#3ABCF7]/30 to-[#8B2FF8]/30 rounded-full blur-md animate-[neural-glow_3s_ease-in-out_infinite] animate-[neural-float_20s_ease-in-out_infinite]" style={{['--float-x1' as string]: '50px', ['--float-y1' as string]: '-30px', ['--float-x2' as string]: '-40px', ['--float-y2' as string]: '20px', ['--float-x3' as string]: '20px', ['--float-y3' as string]: '40px'}}></div>
            <div className="absolute top-[65%] left-[40%] w-5 h-5 bg-gradient-to-r from-[#5B7CF7]/30 to-[#3ABCF7]/30 rounded-full blur-md animate-[neural-glow_4s_ease-in-out_infinite_1s] animate-[neural-float_25s_ease-in-out_infinite_2s]" style={{['--float-x1' as string]: '-60px', ['--float-y1' as string]: '-20px', ['--float-x2' as string]: '30px', ['--float-y2' as string]: '40px', ['--float-x3' as string]: '-20px', ['--float-y3' as string]: '-30px'}}></div>
          </div>
          
          {/* Neural connections */}
          <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
            {/* Static connections */}
            <line x1="20%" y1="15%" x2="40%" y2="30%" stroke="#3ABCF7" strokeWidth="0.5" className="animate-[connection-flow_4s_linear_infinite]" style={{strokeDasharray: '10 5'}} />
            <line x1="40%" y1="30%" x2="25%" y2="60%" stroke="#5B7CF7" strokeWidth="0.5" className="animate-[connection-flow_5s_linear_infinite_0.5s]" style={{strokeDasharray: '10 5'}} />
            <line x1="25%" y1="60%" x2="65%" y2="70%" stroke="#8B2FF8" strokeWidth="0.5" className="animate-[connection-flow_4.5s_linear_infinite_1s]" style={{strokeDasharray: '10 5'}} />
            <line x1="70%" y1="20%" x2="65%" y2="70%" stroke="#3ABCF7" strokeWidth="0.5" className="animate-[connection-flow_5.5s_linear_infinite_0.7s]" style={{strokeDasharray: '10 5'}} />
            <line x1="80%" y1="45%" x2="70%" y2="20%" stroke="#5B7CF7" strokeWidth="0.5" className="animate-[connection-flow_4.2s_linear_infinite_1.2s]" style={{strokeDasharray: '10 5'}} />
            <line x1="40%" y1="30%" x2="70%" y2="20%" stroke="#8B2FF8" strokeWidth="0.5" className="animate-[connection-flow_5.2s_linear_infinite_0.3s]" style={{strokeDasharray: '10 5'}} />
            <line x1="25%" y1="60%" x2="40%" y2="30%" stroke="#3ABCF7" strokeWidth="0.5" className="animate-[connection-flow_4.8s_linear_infinite_0.8s]" style={{strokeDasharray: '10 5'}} />
            <line x1="65%" y1="70%" x2="80%" y2="45%" stroke="#5B7CF7" strokeWidth="0.5" className="animate-[connection-flow_5.3s_linear_infinite_1.5s]" style={{strokeDasharray: '10 5'}} />
            
            {/* Data transfer points */}
            <circle cx="30%" cy="22%" r="1.5" fill="#3ABCF7" className="animate-[data-ping_2s_ease-in-out_infinite]" />
            <circle cx="50%" cy="45%" r="1.5" fill="#5B7CF7" className="animate-[data-ping_2.5s_ease-in-out_infinite_0.5s]" />
            <circle cx="45%" cy="65%" r="1.5" fill="#8B2FF8" className="animate-[data-ping_1.8s_ease-in-out_infinite_1s]" />
            <circle cx="75%" cy="35%" r="1.5" fill="#3ABCF7" className="animate-[data-ping_2.2s_ease-in-out_infinite_1.5s]" />
          </svg>
          
          {/* Moving connection lines */}
          <div className="absolute inset-0">
            <div className="absolute top-[25%] h-[0.5px] w-full bg-gradient-to-r from-transparent via-[#3ABCF7]/40 to-transparent animate-[neural-travel_15s_linear_infinite]" style={{['--start-x' as string]: '-100%', ['--end-x' as string]: '100%'}}></div>
            <div className="absolute top-[55%] h-[0.5px] w-full bg-gradient-to-r from-transparent via-[#5B7CF7]/40 to-transparent animate-[neural-travel_12s_linear_infinite_2s]" style={{['--start-x' as string]: '100%', ['--end-x' as string]: '-100%'}}></div>
            <div className="absolute top-[75%] h-[0.5px] w-full bg-gradient-to-r from-transparent via-[#8B2FF8]/40 to-transparent animate-[neural-travel_18s_linear_infinite_4s]" style={{['--start-x' as string]: '-100%', ['--end-x' as string]: '100%'}}></div>
            <div className="absolute top-[35%] h-[0.5px] w-full bg-gradient-to-r from-transparent via-[#3ABCF7]/40 to-transparent animate-[neural-travel_14s_linear_infinite_6s]" style={{['--start-x' as string]: '100%', ['--end-x' as string]: '-100%'}}></div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="animate-slide-up">
              <div className="text-4xl md:text-6xl mb-8 relative" style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '0.02em' }}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-text-shimmer bg-[length:200%_auto]">Zap the Gap of Your Infrastructure</span>
                {/* Light ray animation */}
                <div className="absolute bottom-[-8px] h-[2px] bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-[light-ray_3s_ease-in-out_infinite]" style={{ transformOrigin: 'left center' }}></div>
              </div>
            </div>
            
            {/* Typewriter Animation for AI Agent Capabilities */}
            <motion.div
              className="mb-8 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="mb-2">
                <span className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] px-8 py-2 rounded-full" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>AI Agents</span>
              </div>
              <div className="flex items-center">
                <ModernTextTransition 
                  prefix="for"
                  texts={[
                    "Cloud Troubleshooting",
                    "Incident Resolution",
                    "Automating Deployments",
                    "Cost Optimization",
                    "Compliance Checks",
                    "Multi-Cloud Operations",
                    "Real-Time Monitoring",
                    "Auto-Remediation",
                    "Terraform Execution",
                    "CI/CD Management"
                  ]}
                />
              </div>
            </motion.div>
              {/* Modern Action Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] rounded-xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
                <Button
                  onClick={() => navigate('/demo')}
                  className="w-full md:w-auto bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] border-0 text-white font-bold rounded-xl px-12 py-7 text-lg shadow-[0_8px_30px_rgba(139,47,248,0.3)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3ABCF7]/20 to-[#8B2FF8]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-3 animate-pulse" />
                    <span>Try Demo</span>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
                <Button
                  onClick={() => window.open('https://tally.so/r/nWBBrR', '_blank')}
                  className="w-full md:w-auto bg-gradient-to-r from-[#22C55E] to-[#16A34A] border-0 text-white font-bold rounded-xl px-12 py-7 text-lg shadow-[0_8px_30px_rgba(34,197,94,0.3)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#22C55E]/20 to-[#16A34A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center">
                    <UserPlus className="w-5 h-5 mr-3 animate-pulse" />
                    <span>Get Whitelisted</span>
                  </div>
                </Button>
              </motion.div>
            </motion.div>

            {/* Modern Interactive Terminal */}
            <motion.div 
              className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.7)]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {/* Terminal Header */}
              <div className="bg-[#1a1a1a] p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28ca41]"></div>
                </div>
                <div className="text-sm text-gray-400 font-mono">zapgap-terminal ~ infrastructure-scan</div>
                <div className="w-4"></div>
              </div>
              
              {/* Terminal Content */}
              <div className="bg-[#111]/90 backdrop-blur-md p-6 font-mono text-sm">
                <div className="flex items-center text-[#3ABCF7] mb-3">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  <span>Initializing ZapGap infrastructure scanner...</span>
                </div>
                
                <div className="text-green-400 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Connected to cloud environment</span>
                </div>
                
                <div className="text-yellow-400 mb-3 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>Detected 3 infrastructure gaps in production</span>
                </div>
                
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="w-4 h-4 rounded-full bg-[#3ABCF7] mr-3"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-white font-semibold">AI model analyzing infrastructure patterns</span>
                </div>
                
                <div className="flex items-center text-[#8B2FF8] font-bold">
                  <span className="mr-3 text-purple-500">&gt;</span>
                  <span>Generating automated remediation plan...</span>
                  <span className="ml-1 animate-blink">|</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Explainer */}
      <PlatformSection />

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl mb-6 relative" style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '0.02em' }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-text-shimmer bg-[length:200%_auto] relative">Features
                {/* Light ray animation */}
                <div className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-[light-ray_3s_ease-in-out_infinite]" style={{ transformOrigin: 'left center' }}></div>
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.01em' }}>
              ZapGap brings AI-powered intelligence to your cloud operations with these powerful capabilities
            </p>
          </div>

          <div className="mb-16">
            <p className="text-gray-300 mb-10 leading-relaxed text-base max-w-5xl mx-auto text-center" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              Each feature is designed to enhance your cloud operations experience, focusing on the benefit to your team.
              Click on any feature to learn more details.
            </p>
          </div>

          {/* Persona-based Features */}
          <PersonaFeatures />
        </div>
      </section>

      {/* Use Case Highlights */}
      <section id="use-cases" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl mb-6 relative" style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '0.02em' }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-text-shimmer bg-[length:200%_auto] relative">ZapGap in Action
                {/* Light ray animation */}
                <div className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-[light-ray_3s_ease-in-out_infinite]" style={{ transformOrigin: 'left center' }}></div>
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-4xl mx-auto" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.01em' }}>
              Real-world scenarios showing how different roles and teams leverage ZapGap. Each example demonstrates the problem faced, how ZapGap provides a solution, and the measurable impact on the organization.
            </p>
            
            <motion.div
              className="mt-8 mb-8 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-2">
                <span className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] px-8 py-2 rounded-full" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>AI Agents</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-white">for</span>
                <ModernTextTransition 
                  texts={[
                    "CTOs",
                    "DevOps Engineers",
                    "SREs",
                    "Platform Teams",
                    "IT Teams",
                    "Cloud Architects"
                  ]}
                />
              </div>
            </motion.div>
          </div>

          {/* Ultra Modern Use Cases Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <UseCasesTable />
          </motion.div>

          {/* Modern Use Cases Table is now the primary display method for use cases */}
        </div>
      </section>

      {/* Waitlist CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
        className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#7F5AF8]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
          >
        <span className="inline-block">Cloud Infrastructure,</span>
        <br />
        <motion.span 
          className="text-white inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Simplified by AI
        </motion.span>
          </motion.h1>
          <p className="text-2xl text-white/90 mb-12 leading-relaxed">
        Be among the first to experience the future of cloud operations
          </p>
            <div className="flex justify-center">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={() => window.open('https://tally.so/r/nWBBrR', '_blank')}
            className="btn-futuristic text-lg py-6 px-8 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 mr-3" />
              Get Whitelisted
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <motion.span 
          className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-400/20 rounded-full"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
            />
          </Button>
        </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111111] text-white py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-t border-gray-800 mt-12 pt-8 flex justify-center items-center">
            <p className="text-gray-400">© 2025 ZapGap. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
