import cassandra, { ExecutionProfile } from "cassandra-driver";
import { Configuration, ICassandraConfig } from "./Configuration";

const cassandraConfig: ICassandraConfig = Configuration.getInstance().getCassandraConfig();
const textAuthProvider: cassandra.auth.PlainTextAuthProvider = new cassandra.auth.PlainTextAuthProvider(
    cassandraConfig.user,
    cassandraConfig.password
);

const loadBalancingPolicy: cassandra.policies.loadBalancing.LoadBalancingPolicy = new cassandra.policies.loadBalancing.TokenAwarePolicy(
    new cassandra.policies.loadBalancing.DefaultLoadBalancingPolicy()
);

export default new cassandra.Client({
    contactPoints: cassandraConfig.contactPoints,
    localDataCenter: cassandraConfig.dataCenter,
    keyspace: cassandraConfig.keyspace,
    authProvider: textAuthProvider,
    profiles: [
        new ExecutionProfile("default", {
            consistency: cassandra.types.consistencies.one,
            readTimeout: 10000,
        }),
    ],
    policies: {
        loadBalancing: loadBalancingPolicy,
    },
});
