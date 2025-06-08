import { Zap, Shield, Cog, Cloud, Database, Network, Eye, Target, Cpu, Server, Lock, Workflow, GitBranch, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const PlatformSection = () => {
  return (
    <section id="platform" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl mb-6 relative" style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '0.02em' }}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-text-shimmer bg-[length:200%_auto] relative">AI-Powered Cloud Platform
              {/* Light ray animation */}
              <div className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-[light-ray_3s_ease-in-out_infinite]" style={{ transformOrigin: 'left center' }}></div>
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '0.01em' }}>
            Bringing true AI-driven intelligence into your cloud operations in a safe, scalable way
          </p>
        </div>

        {/* Platform Overview - Futuristic Design with Fixed Card Layout */}
        <div className="mb-32 relative">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-blue-500/5 animate-[spin_60s_linear_infinite]"></div>
            <div className="absolute top-20 right-10 w-32 h-32 bg-blue-500 opacity-10 blur-[100px]"></div>
            <div className="absolute bottom-40 left-20 w-40 h-40 bg-purple-500 opacity-10 blur-[100px]"></div>
          </div>

          <div className="relative z-10">
            <p className="text-gray-300 mb-16 leading-relaxed text-lg max-w-4xl mx-auto text-center" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              ZapGap's platform is built to bring true AI-driven intelligence into your cloud operations in a safe,
              scalable way. Here we pull back the curtain on how ZapGap works under the hood to deliver a seamless
              assistant experience:
            </p>

            {/* Fixed Layout Structure */}
            <div className="relative max-w-6xl mx-auto">
              {/* Central Orchestrator */}
              <div className="relative mb-20">
                <div className="relative z-20 mx-auto w-64">
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-40"></div>
                  
                  {/* Card */}
                  <div className="relative bg-gray-900/90 border border-white/10 rounded-2xl p-6 text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                      <Cpu className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Central Orchestrator</span>
                    </h3>
                    <p className="text-gray-300 text-sm" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      The AI brain that interprets requests, consults context, and orchestrates execution
                    </p>
                  </div>
                </div>
              </div>

              {/* Box around all six component cards with single connection line */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Pure black background box for all six cards */}
                <div className="absolute top-[190px] left-1/2 w-[96%] h-[400px] border border-gray-800/50 rounded-xl transform -translate-x-1/2 bg-black shadow-[0_4px_30px_rgba(0,0,0,0.4)] z-0">
                  {/* Subtle corner accents matching card colors */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-indigo-500/70 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-blue-500/70 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-purple-500/70 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-pink-500/70 rounded-br-xl"></div>
                </div>
                
                {/* Single connection line from orchestrator to box */}
                <div className="absolute top-[150px] left-1/2 w-[3px] h-[40px] bg-gradient-to-b from-blue-500 to-violet-600 transform -translate-x-1/2 z-10"></div>
                <div className="absolute top-[150px] left-1/2 w-[8px] h-[40px] bg-gradient-to-b from-blue-500/30 to-violet-600/30 blur-[5px] transform -translate-x-1/2 z-9"></div>
              </div>
              
              {/* Top Row Components */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative">
                {[
                  {
                    title: "Agent-Based Architecture",
                    description: "Lightweight delegates that execute actions close to your infrastructure",
                    icon: Server,
                    color: "from-cyan-500 to-blue-600",
                    cornerColor: "#3B82F6"
                  },
                  {
                    title: "Context Graph",
                    description: "Maintains an up-to-date understanding of your infrastructure and policies",
                    icon: Database,
                    color: "from-indigo-500 to-purple-600",
                    cornerColor: "#8B5CF6"
                  },
                  {
                    title: "Multi-Cloud Design",
                    description: "Cloud-agnostic with a modular connector system for AWS, Azure, GCP, and more",
                    icon: Cloud,
                    color: "from-blue-500 to-indigo-600",
                    cornerColor: "#3B82F6"
                  }
                ].map((feature, index) => (
                  <div key={index} className="group relative">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 -bottom-4 bg-gradient-to-b from-transparent via-blue-600/20 to-blue-600/30 rounded-2xl blur-lg opacity-75"></div>
                    
                    {/* Card */}
                    <div className="relative bg-gray-900/90 border border-white/10 rounded-2xl p-5 h-full">
                      {/* Bottom border line */}
                      <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-blue-500/30"></div>
                      
                      {/* Content */}
                      <div className="flex items-start">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg p-0.5 mr-4`}>
                          <div className="w-full h-full bg-gray-900 rounded-[6px] flex items-center justify-center">
                            <feature.icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        
                        <div>
                          {/* Title */}
                          <h3 className="text-lg font-bold mb-1" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${feature.color}`}>
                              {feature.title}
                            </span>
                          </h3>
                          
                          {/* Description */}
                          <p className="text-gray-300 text-sm" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Corner accent */}
                      <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-12 -mt-6 -mr-6 transform rotate-45" style={{ backgroundColor: feature.cornerColor }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bottom Row Components */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {[
                  {
                    title: "Enterprise Security",
                    description: "End-to-end encryption with role-based access control and approval workflows",
                    icon: Shield,
                    color: "from-purple-500 to-pink-600",
                    cornerColor: "#9333EA"
                  },
                  {
                    title: "Observability",
                    description: "Full visibility into assistant actions with dashboard and transcripts",
                    icon: Eye,
                    color: "from-pink-500 to-rose-600",
                    cornerColor: "#EC4899"
                  },
                  {
                    title: "Continuous Learning",
                    description: "Improves performance by analyzing outcomes and user feedback",
                    icon: Target,
                    color: "from-amber-500 to-orange-600",
                    cornerColor: "#F59E0B"
                  }
                ].map((feature, index) => (
                  <div key={index} className="group relative">
                    {/* Card */}
                    <div className="relative bg-gray-900/90 border border-white/10 rounded-2xl p-5 h-full">
                      {/* Content */}
                      <div className="flex items-start">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg p-0.5 mr-4`}>
                          <div className="w-full h-full bg-gray-900 rounded-[6px] flex items-center justify-center">
                            <feature.icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        
                        <div>
                          {/* Title */}
                          <h3 className="text-lg font-bold mb-1" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${feature.color}`}>
                              {feature.title}
                            </span>
                          </h3>
                          
                          {/* Description */}
                          <p className="text-gray-300 text-sm" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Corner accent */}
                      <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-12 -mt-6 -mr-6 transform rotate-45" style={{ backgroundColor: feature.cornerColor }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Connection lines are now handled by the SVG above */}
            </div>
          </div>
        </div>

        {/* Key Platform Components */}
        <div className="mt-32 relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500 opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-purple-500 opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-500 opacity-5 rounded-full blur-3xl"></div>
          </div>

          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl mb-6 relative" style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '0.02em' }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-text-shimmer bg-[length:200%_auto] relative">Key Platform Components
                {/* Light ray animation */}
                <div className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#3ABCF7] via-[#5B7CF7] to-[#8B2FF8] animate-[light-ray_3s_ease-in-out_infinite]" style={{ transformOrigin: 'left center' }}></div>
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              Our platform architecture combines powerful components that work together seamlessly to deliver AI-powered cloud operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {[
              {
                title: "ZapGap Orchestrator",
                description: "The cloud-based AI engine that processes user requests, applies reasoning (using LLMs), and coordinates actions via agents. It's the 'brain' that turns a simple prompt into concrete results.",
                icon: Cpu,
                color: "from-blue-400 to-indigo-600",
                features: ["Natural language processing", "Multi-step reasoning", "Action sequencing"]
              },
              {
                title: "ZapGap Agents",
                description: "Deployable in your AWS account (and other environments in future releases), these agents securely interface with cloud APIs, Kubernetes clusters, and other services. They execute tasks on behalf of the orchestrator.",
                icon: Server,
                color: "from-indigo-400 to-purple-600",
                features: ["Secure execution", "Low-latency operations", "Environment-specific actions"]
              },
              {
                title: "Integration Connectors",
                description: "A library of connectors allows ZapGap to talk to various systems out-of-the-box – AWS services, DevOps tools, Chat platforms, and more. If it has an API, ZapGap can likely integrate with it.",
                icon: GitBranch,
                color: "from-cyan-400 to-blue-600",
                features: ["AWS service integrations", "DevOps tool connectors", "Chat platform support"]
              },
              {
                title: "Policy & Security Engine",
                description: "Administrators can define guardrails such as usage policies, approval requirements, or blacklisted actions. The platform enforces these rules automatically.",
                icon: Lock,
                color: "from-purple-400 to-pink-600",
                features: ["Role-based access control", "Approval workflows", "Audit logging"]
              }
            ].map((component, index) => (
              <div key={index} className="group relative">
                {/* Glass card with backdrop filter */}
                <div className="relative h-full backdrop-blur-md bg-gray-900/40 border border-gray-800/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] group-hover:border-gray-700/80">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${component.color}`}></div>
                  
                  {/* Card content */}
                  <div className="p-8 relative z-10">
                    <div className="flex items-start mb-6">
                      {/* Icon with gradient background */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${component.color} p-0.5 mr-5 shadow-lg`}>
                        <div className="w-full h-full bg-gray-900 rounded-[10px] flex items-center justify-center">
                          <component.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-2xl font-bold" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                        <span className={`bg-clip-text text-transparent bg-gradient-to-r ${component.color}`}>
                          {component.title}
                        </span>
                      </h3>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-300 mb-6 leading-relaxed" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      {component.description}
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-3">
                      {component.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-gray-200" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${component.color} mr-3`}></div>
                          <span className="group-hover:text-white transition-colors duration-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Hover effect - subtle glow */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className={`h-full bg-gradient-to-r ${component.color} blur-sm`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Scalability & Resilience - Full width card with different style */}
          <div className="mt-8 relative z-10">
            <div className="backdrop-blur-md bg-gray-900/40 border border-gray-800/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] group hover:border-gray-700/80">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-teal-400 to-emerald-600"></div>
              
              <div className="p-8 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
                  {/* Icon with gradient background */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 p-0.5 mb-4 md:mb-0 md:mr-5 shadow-lg">
                    <div className="w-full h-full bg-gray-900 rounded-[10px] flex items-center justify-center">
                      <Scale className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <div>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-600">
                        Scalability & Resilience
                      </span>
                    </h3>
                    <p className="text-gray-300 mt-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      ZapGap's platform is cloud-native and scales as you grow. The agent mesh can handle multiple concurrent requests and heavy workloads, spinning up more instances as needed.
                    </p>
                  </div>
                </div>
                
                {/* Features in horizontal layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {["Auto-scaling architecture", "High availability", "Fault tolerance"].map((feature, idx) => (
                    <div key={idx} className="flex items-center text-gray-200 bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 hover:bg-gray-800/50 transition-colors duration-300" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-600 mr-3"></div>
                      <span className="group-hover:text-white transition-colors duration-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformSection;
