import { ioFactoryForPostgres, ioFactoryForS3, ioFactoryForAPI, getStorageProviderFactory, type AWSConfig } from "@agyemanjp/storage"
import { dashCase, ok, snakeCase } from "@agyemanjp/standard"


export const getEntityStoreProviders = (cfg: { dbUrl: string, apiBasePath: string, s3Config: AWSConfig }) => {
	const s3 = getStorageProviderFactory(ioFactoryForS3(cfg.s3Config), { cacheExpirySeconds: 0, transactionSupport: false })
	if (s3.isErr()) return s3.errWithGenericValue()

	const pg = getStorageProviderFactory(ioFactoryForPostgres({
		dbUrl: cfg.dbUrl,
		getRowsetName: entityName => snakeCase(entityName).toLowerCase()
	}), { cacheExpirySeconds: 0, transactionSupport: false })
	if (pg.isErr()) return pg.errWithGenericValue()

	const api = getStorageProviderFactory(ioFactoryForAPI({
		basePath: cfg.apiBasePath,
		getRoutePath: entityName => dashCase(entityName).toLowerCase(),
		secretAccessKey: "",
		clientId: ""
	}), { cacheExpirySeconds: 0, transactionSupport: false })
	if (api.isErr()) return api.errWithGenericValue()

	const entityStoreProviders = <P extends { id: string }, Px extends Omit<P, omitKeys> & { id: string }, omitKeys extends string = "">(
		entityName: string, entityXtendedName: string) => {

		return {
			dbReadWrite: pg.value<P>(entityName)("get", "find", "insert", "update", "remove"),
			dbReadOnly: pg.value<Px>(entityXtendedName)("get", "find"),
			apiReadWrite: api.value<P>(entityName)("get", "find", "insert", "update", "remove"),
			apiReadOnly: api.value<Px>(entityXtendedName)("get", "find")
		}
	}

	return ok(entityStoreProviders).valWithGenericError()
}


/*export type StorageProviderGroup<> = { [key in keyof Schema]: {
	baseReadWrite: StorageProvider<Schema[key]["baseReadWrite"]>,
	augmentedReadOnly: StorageProvider<Schema[key]["augmentedReadOnly"], "get" | "find">
} }*/



