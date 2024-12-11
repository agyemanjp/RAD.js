import bcrypt from "bcryptjs"
import type { StorageProvider } from "@agyemanjp/storage"
import { asResultFx, err, getIdUnique, hasValue, ok, type Result, type OmitX, type Digit } from "@agyemanjp/standard"
import type { UserBase } from "./schema/_auth"

export async function authenticateAsync<U extends UserBase>(args:
	{
		authId: string,
		password: string,
		storage: StorageProvider<U, "get">
	})
	: Promise<Result<UserBase>> {

	const { authId, password, storage } = args

	const users = await storage.get(["authId", "equals", authId])
	if (users.isOk()) {
		const user = users.value[0]
		if (hasValue(user)) {
			try {
				// console.log(`User to authenticate against: ${stringify(user)}`)
				// console.log(`Calling bcrypt.compareSync(${password}, ${user.pwdHash})`)
				return bcrypt.compareSync(password, user.pwdHash)
					? ok(user)
					: err({ errCode: "not-found", description: "Invalid password" })
			}
			catch (e) {
				return err({
					errCode: "general",
					description: `Executing bcrypt.compareSync(): ${String(e)}`
				})
			}
		}
		else {
			return err({
				errCode: "not-found", description: "Unknown email address"
			})
		}
	}
	else {
		return users.errWithGenericValue()
	}
}

export async function registerAsync<U extends UserBase>(args
	: OmitX<U, keyof UserBase> & {
		authIdType: U["authIdType"],
		authId: string,
		password: string,
		accessLevel: U["accessLevel"],
		storage: StorageProvider<U, "insert">
	})
	: Promise<Result<U>> {

	const { authIdType, authId, password, accessLevel, storage, ...xtraProps } = args

	const salt = asResultFx(() => bcrypt.genSaltSync())()
	if (salt.isErr()) return salt.errWithGenericValue()

	const hash = asResultFx(() => bcrypt.hashSync(password, salt.value))()
	if (hash.isErr()) return hash.errWithGenericValue()

	const id = getIdUnique()
	const userToRegister = Object.assign(
		{
			id,
			authIdType,
			authId,
			accessLevel,
			pwdSalt: salt.value,
			pwdHash: hash.value,
			// versionCreatorUserVId: id,
			versionCreationTimestamp: new Date(),
		} satisfies UserBase,
		xtraProps
	) as any as U
	// console.log(`User to register: ${stringify(userToRegister)}`)

	return storage
		.insert(userToRegister)
		.then(result => result.isOk()
			? ok(userToRegister)
			: err(result.error)
		)
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
