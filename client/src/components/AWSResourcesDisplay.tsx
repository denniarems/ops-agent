import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Server, Database, HardDrive, Users,
  Network, Cloud, ChevronDown, ChevronRight, RefreshCw,
  CheckCircle, AlertCircle, Clock, Activity
} from "lucide-react";
import { AWSResourceSummary, EC2Instance, S3Bucket, RDSInstance, IAMUser } from "@/services/mockAWSService";

interface AWSResourcesDisplayProps {
  resources: AWSResourceSummary;
  isLoading: boolean;
  onRefresh: () => void;
}

const AWSResourcesDisplay = ({ resources, isLoading, onRefresh }: AWSResourcesDisplayProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['account']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getInstanceStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'stopping': return 'bg-orange-500';
      case 'terminated': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getInstanceStateIcon = (state: string) => {
    switch (state.toLowerCase()) {
      case 'running': return <CheckCircle className="w-4 h-4" />;
      case 'stopped': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const resourceSections = [
    {
      id: 'account',
      title: 'Account Information',
      icon: Cloud,
      count: 1,
      color: 'from-blue-500 to-cyan-500',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-400">Account ID</div>
              <div className="font-mono text-white">{resources.accountInfo.accountId}</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-400">Region</div>
              <div className="font-mono text-white">{resources.accountInfo.region}</div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg md:col-span-2">
              <div className="text-sm text-gray-400">ARN</div>
              <div className="font-mono text-white text-sm break-all">{resources.accountInfo.arn}</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ec2',
      title: 'EC2 Instances',
      icon: Server,
      count: resources.ec2Instances.length,
      color: 'from-orange-500 to-red-500',
      content: (
        <div className="space-y-3">
          {resources.ec2Instances.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No EC2 instances found
            </div>
          ) : (
            resources.ec2Instances.map((instance: EC2Instance) => (
              <div key={instance.instanceId} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getInstanceStateColor(instance.state)}`}></div>
                    <div>
                      <div className="font-semibold text-white">
                        {instance.name || instance.instanceId}
                      </div>
                      <div className="text-sm text-gray-400">{instance.instanceType}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    {getInstanceStateIcon(instance.state)}
                    <span>{instance.state}</span>
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Public IP:</span>
                    <span className="ml-2 font-mono text-white">
                      {instance.publicIpAddress || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Private IP:</span>
                    <span className="ml-2 font-mono text-white">
                      {instance.privateIpAddress || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">VPC:</span>
                    <span className="ml-2 font-mono text-white">
                      {instance.vpcId || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Launch Time:</span>
                    <span className="ml-2 text-white">
                      {instance.launchTime ? new Date(instance.launchTime).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )
    },
    {
      id: 's3',
      title: 'S3 Buckets',
      icon: HardDrive,
      count: resources.s3Buckets.length,
      color: 'from-green-500 to-teal-500',
      content: (
        <div className="space-y-3">
          {resources.s3Buckets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No S3 buckets found
            </div>
          ) : (
            resources.s3Buckets.map((bucket: S3Bucket) => (
              <div key={bucket.name} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{bucket.name}</div>
                    <div className="text-sm text-gray-400">
                      Region: {bucket.region} • Created: {bucket.creationDate ? new Date(bucket.creationDate).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                  <HardDrive className="w-5 h-5 text-green-500" />
                </div>
              </div>
            ))
          )}
        </div>
      )
    },
    {
      id: 'rds',
      title: 'RDS Instances',
      icon: Database,
      count: resources.rdsInstances.length,
      color: 'from-purple-500 to-pink-500',
      content: (
        <div className="space-y-3">
          {resources.rdsInstances.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No RDS instances found
            </div>
          ) : (
            resources.rdsInstances.map((instance: RDSInstance) => (
              <div key={instance.dbInstanceIdentifier} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white">{instance.dbInstanceIdentifier}</div>
                    <div className="text-sm text-gray-400">{instance.engine} • {instance.dbInstanceClass}</div>
                  </div>
                  <Badge variant="outline" className={`${instance.dbInstanceStatus === 'available' ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'}`}>
                    {instance.dbInstanceStatus}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Endpoint:</span>
                    <span className="ml-2 font-mono text-white text-xs">
                      {instance.endpoint || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Port:</span>
                    <span className="ml-2 font-mono text-white">
                      {instance.port || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )
    },
    {
      id: 'iam',
      title: 'IAM Users',
      icon: Users,
      count: resources.iamUsers.length,
      color: 'from-indigo-500 to-purple-500',
      content: (
        <div className="space-y-3">
          {resources.iamUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No IAM users found
            </div>
          ) : (
            resources.iamUsers.map((user: IAMUser) => (
              <div key={user.userId} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{user.userName}</div>
                    <div className="text-sm text-gray-400 font-mono">{user.userId}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Created: {user.createDate ? new Date(user.createDate).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                  <Users className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
            ))
          )}
        </div>
      )
    },
    {
      id: 'network',
      title: 'Network & Security',
      icon: Network,
      count: resources.vpcs.length + resources.securityGroups.length + resources.keyPairs.length,
      color: 'from-cyan-500 to-blue-500',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">VPCs ({resources.vpcs.length})</h4>
            {resources.vpcs.length === 0 ? (
              <div className="text-sm text-gray-400">No VPCs found</div>
            ) : (
              <div className="space-y-2">
                {resources.vpcs.slice(0, 3).map((vpc: any, index: number) => (
                  <div key={vpc.VpcId || index} className="p-2 bg-white/5 rounded text-sm">
                    <span className="font-mono text-white">{vpc.VpcId}</span>
                    <span className="ml-2 text-gray-400">({vpc.CidrBlock})</span>
                  </div>
                ))}
                {resources.vpcs.length > 3 && (
                  <div className="text-sm text-gray-400">... and {resources.vpcs.length - 3} more</div>
                )}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Security Groups ({resources.securityGroups.length})</h4>
            {resources.securityGroups.length === 0 ? (
              <div className="text-sm text-gray-400">No security groups found</div>
            ) : (
              <div className="text-sm text-gray-400">
                {resources.securityGroups.length} security groups configured
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Key Pairs ({resources.keyPairs.length})</h4>
            {resources.keyPairs.length === 0 ? (
              <div className="text-sm text-gray-400">No key pairs found</div>
            ) : (
              <div className="space-y-1">
                {resources.keyPairs.slice(0, 3).map((keyPair: any, index: number) => (
                  <div key={keyPair.KeyName || index} className="text-sm font-mono text-white">
                    {keyPair.KeyName}
                  </div>
                ))}
                {resources.keyPairs.length > 3 && (
                  <div className="text-sm text-gray-400">... and {resources.keyPairs.length - 3} more</div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-8"
    >
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                       style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              Connected AWS Services
            </CardTitle>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {resourceSections.map((section) => (
            <div key={section.id} className="border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color}`}>
                    <section.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">{section.title}</div>
                    <div className="text-sm text-gray-400">{section.count} items</div>
                  </div>
                </div>
                {expandedSections.includes(section.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.includes(section.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 bg-black/20"
                >
                  {section.content}
                </motion.div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AWSResourcesDisplay;
