
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { cfnAgent } from './agents/cfn';

import { UpstashStore } from "@mastra/upstash";
// import { cfnWorkflow } from './workflows/cfn';
 
const upstashStorage = new UpstashStore({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

export const mastra = new Mastra({
  // workflows: { cfnWorkflow },
  agents: { cfnAgent },
  storage: upstashStorage as any,
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
