import type { EntityRecordBase, EntityRecordXtensions } from "./base"

export type HoodXtended = Hood & {
	city: City
} & EntityRecordXtensions
export type Hood = {
	name: string,
	latitude: number,
	longitude: number,
	imageUrl: string,
	/** Owning city's record (version) id */
	cityVId: number
} & EntityRecordBase

export type CityXtended = City & {
	region: Region
} & EntityRecordXtensions
export type City = {
	name: string,
	imageUrl?: string,
	/** Owning region's record (version) id */
	regionVId: number
} & EntityRecordBase

export type RegionXtended = Region & EntityRecordXtensions
export type Region = {
	name: string,
} & EntityRecordBase
