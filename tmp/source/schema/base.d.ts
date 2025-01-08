/** Info automatically attached to records when saved/retrieved to/from storage */
export type EntityRecordXtensions = {
    /** Positive integer used as version id
     * It is motonically increasing, but non-contiguous for a specific record external id
     */
    versionId: number;
    /** When (and thus if) this version is expired. NULL for current version.
     * Records are soft-deleted by expiring the lastest version & not creating a new one
     */
    versionExpiryTimestamp?: Date;
};
/** Basic info required to be included with every record when saving to storage */
export type EntityRecordBase = {
    id: string;
    /** User version id of this record version's creator */
    versionCreatorUserVId: number;
    /** When this version was created.
     * No need for modification timestamp since record versions are immutable
     */
    versionCreationTimestamp: Date;
};
