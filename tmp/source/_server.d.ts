import type { Server } from "http";
import type { Socket } from "net";
import { type ArgsType, type Rec, type Result } from "@agyemanjp/standard";
import type { StorageProvider } from "@agyemanjp/storage";
import type { Route } from "./_routing";
import type { getEntityStoreProviders } from './_storage';
/** Create express app configured with routes */
export declare function appFactory(env: {
    databaseUrl: string;
    objectStorageRootUrl: string;
    objectStorageDefaultBucket: string;
    objectStorageAccessKeySecret: string;
    objectStorageAccessKeyId: string;
    objectStorageRegion: string;
    port: number;
}, routesFactory: (args: {
    storage: Rec<Rec<StorageProvider<any, any>>>;
    staticPath: string;
    env: Rec;
}) => Result<Route[]>, storageFactory: (args: ArgsType<typeof getEntityStoreProviders>[0]) => Rec<Rec<StorageProvider<any, any>>>): import("@agyemanjp/standard").Err<any, import("@agyemanjp/standard").StdError<"bad-input" | "malformed-input" | "no-connection" | "access-denied" | "not-found" | "conflict" | "time-out" | "resources-exhausted" | "not-implemented" | "runtime" | "internal" | "general", any>> | import("@agyemanjp/standard").Ok<import("express-serve-static-core").Express, import("@agyemanjp/standard").StdError<"bad-input" | "malformed-input" | "no-connection" | "access-denied" | "not-found" | "conflict" | "time-out" | "resources-exhausted" | "not-implemented" | "runtime" | "internal" | "general", any>>;
/** Configure abnormal process termination handlers */
export declare function cfgProcTermination(appName: string, server: Server, sockets: Rec<Socket>): void;
