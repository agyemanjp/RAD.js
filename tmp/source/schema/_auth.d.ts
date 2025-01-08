import type { Digit, OmitX } from "@agyemanjp/standard";
import type { EntityRecordBase, EntityRecordXtensions } from "./base";
export type UserBaseX<U extends UserBase> = (Omit<U, "pwdHash" | "pwdSalt" | "verificationCodeHash"> & EntityRecordXtensions);
/** Basic user type; can be extended for more specificity */
export type UserBase<A extends AuthIdType = AuthIdType, L extends Digit = Digit> = {
    authIdType: A;
    authId: string;
    accessLevel: L;
    pwdHash: string;
    pwdSalt: string;
    /** Auth Id verification code hash */
    verificationCodeHash?: string;
    /** Timestamp when (& thus if) auth id was verified.
     * Unverified users can't access pages requiring verification
     */
    whenAuthIdVerified?: Date;
    /** For users only, this normally required field is */
    versionCreatorUserVId?: number;
} & OmitX<EntityRecordBase, "versionCreatorUserVId">;
export type AuthIdType = "email-address" | "phone-number" | "user-name";
