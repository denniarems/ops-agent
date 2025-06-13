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
import { Card, CardContent } from "@/components/ui/card";

export const NewFeaturesSection = () => {
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
    <section id="platform" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl mb-6" style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '0.02em' }}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-text-shimmer bg-[length:200%_auto]">Features</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.01em' }}>
            ZapGap brings AI-powered intelligence to your cloud operations with these powerful capabilities
          </p>
        </div>

        <div className="mb-16">
          <p className="text-gray-300 mb-10 leading-relaxed text-lg max-w-5xl mx-auto text-center" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            Each feature is designed to enhance your cloud operations experience, focusing on the benefit to your team.
            Below are the key features and capabilities of ZapGap:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className="modern-card h-full group">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#3ABCF7] to-[#8B2FF8] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-[#3ABCF7] to-[#8B2FF8] rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                    </div>
                    <div>
                      <h3 className="text-2xl mb-4" style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, letterSpacing: '0.01em' }}>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]">{feature.title}</span>
                      </h3>
                      <p className="text-gray-300 mb-4" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                        {feature.description}
                      </p>
                      <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                        {feature.details}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewFeaturesSection;
