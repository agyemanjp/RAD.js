import bcrypt from "bcryptjs";
import { asResultFx, err, getIdUnique, hasValue, ok } from "@agyemanjp/standard";
export async function authenticateAsync(args) {
    const { authId, password, storage } = args;
    const users = await storage.get(["authId", "equals", authId]);
    if (users.isOk()) {
        const user = users.value[0];
        if (hasValue(user)) {
            try {
                // console.log(`User to authenticate against: ${stringify(user)}`)
                // console.log(`Calling bcrypt.compareSync(${password}, ${user.pwdHash})`)
                return bcrypt.compareSync(password, user.pwdHash)
                    ? ok(user)
                    : err({ errCode: "not-found", description: "Invalid password" });
            }
            catch (e) {
                return err({
                    errCode: "general",
                    description: `Executing bcrypt.compareSync(): ${String(e)}`
                });
            }
        }
        else {
            return err({
                errCode: "not-found", description: "Unknown email address"
            });
        }
    }
    else {
        return users.errWithGenericValue();
    }
}
export async function registerAsync(args) {
    const { authIdType, authId, password, accessLevel, storage, ...xtraProps } = args;
    const salt = asResultFx(() => bcrypt.genSaltSync())();
    if (salt.isErr())
        return salt.errWithGenericValue();
    const hash = asResultFx(() => bcrypt.hashSync(password, salt.value))();
    if (hash.isErr())
        return hash.errWithGenericValue();
    const id = getIdUnique();
    const userToRegister = Object.assign({
        id,
        authIdType,
        authId,
        accessLevel,
        pwdSalt: salt.value,
        pwdHash: hash.value,
        // versionCreatorUserVId: id,
        versionCreationTimestamp: new Date(),
    }, xtraProps);
    // console.log(`User to register: ${stringify(userToRegister)}`)
    return storage
        .insert(userToRegister)
        .then(result => result.isOk()
        ? ok(userToRegister)
        : err(result.error));
}
// export const getAccessLevel = <L extends Digit>(user: User<AuthIdType, L>): L | 0 => user ? user.accessLevel : 0 //userAccessLevels.ADHOC
// export const userAccessLevels = {
// 	/** Ad-hoc user */
// 	ADHOC: 0,
// 	/** Registered user */
// 	REGULAR: 1,
// 	/** Admin for internal company */
// 	ADMIN: 2
// } as const
// export type UserAccessLevel = typeof userAccessLevels[keyof typeof userAccessLevels]
//# sourceMappingURL=_auth.js.map