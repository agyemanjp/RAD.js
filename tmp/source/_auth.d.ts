import type { StorageProvider } from "@agyemanjp/storage";
import { type Result, type OmitX } from "@agyemanjp/standard";
import type { UserBase } from "./schema/_auth";
export declare function authenticateAsync<U extends UserBase>(args: {
    authId: string;
    password: string;
    storage: StorageProvider<U, "get">;
}): Promise<Result<UserBase>>;
export declare function registerAsync<U extends UserBase>(args: OmitX<U, keyof UserBase> & {
    authIdType: U["authIdType"];
    authId: string;
    password: string;
    accessLevel: U["accessLevel"];
    storage: StorageProvider<U, "insert">;
}): Promise<Result<U>>;
