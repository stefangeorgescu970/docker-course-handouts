import CassandraClient from '../../utils/CassandraClient';
import cassandra, { QueryOptions } from "cassandra-driver";

export type CassandraResult = cassandra.types.ResultSet;
export type CassandraRow = cassandra.types.Row;
export type CassandraClient = cassandra.Client;
// tslint:disable-next-line:typedef
export const CassandraUUID = cassandra.types.TimeUuid;

// tslint:disable-next-line type-literal-delimiter no-any
export type KeyValue = { [key: string]: any };

export interface ICassandraResponse {
    result?: CassandraResult;
    error?: ICassandraServiceError;
}

export interface ICassandraQuery {
    query: string;
    params?: KeyValue;
}

export enum CassandraServiceErrorSeverity {
    CRITICAL = "critical",
    ERROR = "error",
}

export interface ICassandraServiceError {
    error: Error;
    severity: CassandraServiceErrorSeverity;
}

export interface ICassandraQueryRequest {
    queryData: ICassandraQuery;
    queryOptions?: QueryOptions;
}

export const fetchOneCassandra: (payload: ICassandraQueryRequest) => Promise<CassandraResult> = (
    payload: ICassandraQueryRequest
) => {
    return queryCassandra({
        queryData: payload.queryData,
        queryOptions: { ...payload.queryOptions, fetchSize: 1 },
    });
};

export const queryCassandra: (payload: ICassandraQueryRequest) => Promise<CassandraResult> = (
    payload: ICassandraQueryRequest,
) => {
    console.log(
        `Performing Cassandra Query: ${payload.queryData.query} with parameters: ${JSON.stringify(
            payload.queryData.params ?? {}
        )}`
    );
    return CassandraClient.execute(payload.queryData.query, payload.queryData.params, {
        ...payload.queryOptions,
        prepare: payload.queryData.params !== undefined,
    });
};

export const getUser: (userId: string) => Promise<{
    result?: KeyValue; 
    error?: Error;
}> = async (
    userId: string
) => {
    const query: string = `
        SELECT *
        FROM users
        WHERE user_id = :user_id
    `;
    try {
        const queryResult: CassandraResult = await fetchOneCassandra({
            queryData: {
                query: query,
                params: {
                    user_id: userId,
                },
            },
        });
        if (queryResult.rowLength !== 1) {
            console.log(`getUser: Did not find user with id ${userId}.`);
            return {error: new Error(`getUser: Did not find user with id ${userId}.`)};
        }

        return {result: queryResult.rows[0]};
    } catch (error) {
        console.log(`getUser: Error querying Cassandra.`, { error });
        return { error };
    }
};
