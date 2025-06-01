import { 
  MessageSquare, 
  Workflow, 
  AlertCircle, 
  UserPlus, 
  Cloud, 
  Link, 
  Shield, 
  LineChart, 
  Zap 
} from "lucide-react";
import { motion } from "framer-motion";

export const FeaturesSection = () => {
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
      icon: Link,
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
    <section id="features" className="py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.1),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.1),_transparent_50%)]" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full border border-blue-500/5 animate-[spin_120s_linear_infinite]"></div>
        <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] rounded-full border border-purple-500/5 animate-[spin_90s_linear_infinite_reverse]"></div>
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with 3D effect */}
        <div className="text-center mb-24 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[150px] font-black text-gray-900/5 select-none" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>FEATURES</div>
          </div>
          <h2 className="text-6xl mb-6 relative" style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '0.02em' }}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-text-shimmer bg-[length:200%_auto]">Features</span>
            {/* Underline effect */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mt-8" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.01em' }}>
            ZapGap brings AI-powered intelligence to your cloud operations with these powerful capabilities
          </p>
        </div>

        <div className="mb-24">
          <p className="text-gray-300 mb-10 leading-relaxed text-lg max-w-5xl mx-auto text-center" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            On the Features page, we break down what ZapGap can do for your team. Each feature is described in
            clear terms, focusing on the benefit to the user. Below are the key features and capabilities of ZapGap:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-24">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              {/* Feature card with neo-brutalism style */}
              <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border-t border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
                {/* Glowing accent line based on feature color */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient}`}></div>
                
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                </div>
                
                <div className="p-10 md:p-12 relative z-10">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    {/* Icon with 3D effect */}
                    <div className="flex-shrink-0 relative group">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      <div className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500`}>
                        <div className="absolute inset-[3px] bg-gray-900 rounded-xl flex items-center justify-center">
                          <feature.icon className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Content with enhanced typography */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-3xl mb-6" style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '0.01em' }}>
                        <span className={`bg-clip-text text-transparent bg-gradient-to-r ${feature.gradient}`}>
                          {feature.title}
                        </span>
                      </h3>
                      <p className="text-xl text-gray-200 mb-6 font-medium" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                        {feature.description}
                      </p>
                      <p className="text-gray-400 leading-relaxed text-lg" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                        {feature.details}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 transform rotate-45 bg-gradient-to-r ${feature.gradient} opacity-80`}></div>
                </div>
              </div>
              
              {/* Index number with 3D effect */}
              <div className="absolute -left-5 top-1/2 transform -translate-y-1/2 hidden md:block">
                <div className="relative">
                  <div className="text-8xl font-black opacity-5" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{index + 1}</div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
