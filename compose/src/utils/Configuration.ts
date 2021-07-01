/**
 * @module Models
 */
// @ts-ignore
import yml from "node-yaml";

interface IExpressConfig {
    port: number;
}

interface ICassandraConfig {
    contactPoints: Array<string>;
    dataCenter: string;
    keyspace: string;
    user: string;
    password: string;
}

interface IEnvConfig {
    express: IExpressConfig;
    cassandra: ICassandraConfig;
}

interface IConfig {
    [env: string]: IEnvConfig;
}


class Configuration {
    private static instance: Configuration;
    private readonly config: IEnvConfig;

    private constructor(configPath: string) {
        const env: string | undefined = process.env.NODE_ENV;

        if (!env) {
            throw new Error("NODE_ENV not set");
        }

        this.config = this.insertEnv(yml.readSync(configPath))[env];
    }

    /**
     * Retrieves the singleton instance of Configuration
     * @returns Configuration
     */
    public static getInstance(): Configuration {
        if (!this.instance) {
            this.instance = new Configuration("../config/config.yml");
        }

        return Configuration.instance;
    }

    /**
     * Retrieves the entire configuration
     * @returns IEnvConfig
     */
    public getConfig(): IEnvConfig {
        return this.config;
    }

    /**
     * Retrieves the Express configuration
     * @returns IExpressConfig
     */
    public getExpressConfig(): IExpressConfig {
        if (!this.config.express) {
            throw new Error("Express config is not defined in the config file.");
        }

        return this.config.express;
    }


    /**
     * Retrieves the Cassandra configuration
     * @returns ICassandraConfig
     */
     public getCassandraConfig(): ICassandraConfig {
        if (!this.config.cassandra) {
            throw new Error("Cassandra config is not defined in the config file.");
        }

        return this.config.cassandra;
    }

    /**
     * Inserts environment variables into the config
     * @param config - the configuration read from the file
     */
    private insertEnv(config: IConfig): IConfig {
        // Replace environment variable references
        let stringifiedConfig: string = JSON.stringify(config);
        const envRegex: RegExp = /\${(\w+\b):?(\w+\b)?}/g;
        const matches: RegExpMatchArray | null = stringifiedConfig.match(envRegex);

        if (matches) {
            matches.forEach((match: string) => {
                envRegex.lastIndex = 0;
                const captureGroups: RegExpExecArray = envRegex.exec(match) as RegExpExecArray;

                // Insert the environment variable if available. If not, insert placeholder. If no placeholder, leave it as is.
                stringifiedConfig = stringifiedConfig.replace(
                    match,
                    process.env[captureGroups[1]] || captureGroups[2] || captureGroups[1]
                );
            });
        }

        return JSON.parse(stringifiedConfig);
    }
}

export { Configuration, IEnvConfig, IConfig, ICassandraConfig };
