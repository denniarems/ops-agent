import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';

const devOpsQuotes = [
  "\"It works on my machine\" - The eternal DevOps mystery 🤔",
  "\"Have you tried turning it off and on again?\" - The universal fix 🔄",
  "\"It's not a bug, it's a feature\" - Classic developer defense 🐛",
  "\"The code is self-documenting\" - Famous last words 📚",
  "\"This will only take 5 minutes\" - Narrator: It did not take 5 minutes ⏰",
  "\"Let's just deploy on Friday\" - What could go wrong? 🚀",
  "\"The server is down\" - The three words that ruin weekends 💥",
  "\"It's probably a DNS issue\" - It's always DNS 🌐",
  "\"We need more monitoring\" - Said after every incident 📊",
  "\"The deployment went smoothly\" - Jinxed it 🎯",
  "\"Let's roll back\" - The DevOps panic button 🔙",
  "\"It's working in staging\" - But production is a different beast 🎭",
  "\"We should automate this\" - The DevOps mantra 🤖",
  "\"The logs don't show anything\" - Time to add more logging 📝",
  "\"It's a network issue\" - When in doubt, blame the network 🕸️",
  "\"We need better error handling\" - After the error happened 🚨",
  "\"The database is slow\" - Time to blame the DBA 🐌",
  "\"Let's add more servers\" - The horizontal scaling solution 📈",
  "\"It's a race condition\" - The concurrency nightmare 🏃‍♂️",
  "\"We should have tested this more\" - Hindsight is 20/20 🔍",
  "\"The cache is stale\" - Clear all the things! 🗑️",
  "\"It's a configuration issue\" - Check the config files 📋",
  "\"We need a hotfix\" - Emergency deployment incoming 🚑",
  "\"The load balancer is acting up\" - Traffic distribution chaos ⚖️",
  "\"It's working now\" - The mysterious self-healing bug 🎪",
  "\"We need more containers\" - When Docker is the answer to everything 🐳",
  "\"The CI/CD pipeline broke\" - Continuous integration, continuous disasters 🔗",
  "\"Let's use Kubernetes\" - Because managing one server is too easy ☸️",
  "\"The microservices are talking to each other\" - Or are they? 🗣️",
  "\"Infrastructure as Code failed\" - When YAML becomes your enemy 📄",
  "\"The health check is lying\" - Trust but verify 💚",
  "\"We're out of disk space\" - The classic Monday morning surprise 💾",
  "\"The backup didn't work\" - Testing backups is for quitters 📦",
  "\"Permission denied\" - The sudo struggle is real 🔐",
  "\"The API is rate limiting us\" - Slow down, speed racer! 🐌",
  "\"The deployment failed silently\" - The worst kind of failure 🤫",
  "\"We need a post-mortem\" - Time to find who to blame 🕵️",
  "\"The metrics are lying\" - When dashboards become fiction 📈",
  "\"Let's scale it horizontally\" - More servers = more problems 📊",
  "\"The webhook didn't fire\" - Callbacks are just suggestions 🔔",
  "\"It's a timeout issue\" - Wait for it... wait for it... ⏱️",
  "\"The secret rotation failed\" - When secrets aren't so secret 🔑",
  "\"We're being DDoS'd\" - Or is it just Monday traffic? 🌊",
  "\"The firewall is blocking it\" - Security vs productivity 🔥",
  "\"Let's add more alerts\" - Death by notification 🚨",
  "\"The cluster is unhealthy\" - Time for some Kubernetes therapy 🏥",
  "\"We have a memory leak\" - Garbage collection is just a suggestion 🗑️",
  "\"The dependencies are conflicting\" - Version hell strikes again 📚",
  "\"We need canary deployments\" - Because YOLO deployments hurt 🐤",
  "\"The monitoring is down\" - How will we know if anything is broken? 👁️",
  "\"Let's use feature flags\" - Toggle your way to success 🏳️",
  "\"The queue is backing up\" - When async becomes a-sync-ing ship 📋",
  "\"We need better logging\" - printf debugging at scale 📝",
  "\"The certificate expired\" - HTTPS more like HTTP-Sadness 🔒",
  "\"Let's dockerize everything\" - When all you have is a container... 📦",
  "\"The CDN is down\" - Global distribution, global problems 🌍",
  "\"We need zero downtime deployments\" - Aim for the stars, land in the logs 🚀"
];

interface LoadingQuotesProps {
  className?: string;
}

export const LoadingQuotes = ({ className }: LoadingQuotesProps) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // Start with a random quote
    setCurrentQuoteIndex(Math.floor(Math.random() * devOpsQuotes.length));

    // Rotate quotes every 3 seconds
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % devOpsQuotes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 min-h-[60px] flex items-center">
        <div className="flex flex-col space-y-2">
          {/* Typing indicator */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          {/* Rotating quotes */}
          <div className="min-h-[24px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentQuoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-gray-300 italic"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                {devOpsQuotes[currentQuoteIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
