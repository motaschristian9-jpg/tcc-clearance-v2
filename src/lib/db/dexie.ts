import Dexie, { type EntityTable } from 'dexie';
import {
  StoredKeyRecord,
  StoredProfileRecord,
  StoredEventRecord,
  StoredRosterStudent,
  StoredScanQueueItem,
  StoredCardStamp,
} from '@/types/database';

export class TCCDatabase extends Dexie {
  keys!: EntityTable<StoredKeyRecord, 'id'>;
  profile!: EntityTable<StoredProfileRecord, 'id'>;
  events!: EntityTable<StoredEventRecord, 'id'>;
  roster!: EntityTable<StoredRosterStudent, 'id'>;
  scanQueue!: EntityTable<StoredScanQueueItem, 'id'>;
  stamps!: EntityTable<StoredCardStamp, 'id'>;

  constructor() {
    super('TCCClearanceDB');
    this.version(1).stores({
      keys: 'id',
      profile: 'id',
      events: 'id, schoolYear',
      roster: 'id, schoolId, fullName, department, section',
      scanQueue: 'id, eventId, slotId, studentId, schoolId, synced, createdAt',
      stamps: 'id, eventId, slotId',
    });
  }
}

export const db = new TCCDatabase();

/**
 * Helper to get the number of unsynced scans waiting in the offline queue
 */
export async function getUnsyncedScanCount(): Promise<number> {
  try {
    return await db.scanQueue.where('synced').equals(0).count();
  } catch (error) {
    console.error('Failed to get unsynced scan count:', error);
    return 0;
  }
}

/**
 * Enqueue a new scan record into local Dexie store
 */
export async function enqueueOfflineScan(
  item: Omit<StoredScanQueueItem, 'createdAt' | 'synced'>
): Promise<StoredScanQueueItem> {
  const fullItem: StoredScanQueueItem = {
    ...item,
    synced: 0,
    createdAt: Date.now(),
  };

  await db.scanQueue.put(fullItem);
  return fullItem;
}

/**
 * Retrieve pending scans for batch upload
 */
export async function getPendingBatch(limit = 100): Promise<StoredScanQueueItem[]> {
  return await db.scanQueue
    .where('synced')
    .equals(0)
    .limit(limit)
    .toArray();
}

/**
 * Mark a batch of items as synced
 */
export async function markScansAsSynced(ids: string[]): Promise<void> {
  await db.transaction('rw', db.scanQueue, async () => {
    for (const id of ids) {
      await db.scanQueue.update(id, { synced: 1 });
    }
  });
}
