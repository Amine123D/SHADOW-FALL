import { BALANCE } from '../data/balance';
import { ITEM_BY_ID, SLOTS, Slot } from '../data/items';

export interface SaveData {
  version: 1;
  level: number;
  xp: number;
  bag: string[];
  equipped: Record<Slot, string | null>;
  checkpoint: { x: number; y: number } | null;
}

const DB_NAME = 'shadowfall';
const STORE = 'saves';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(
  mode: IDBTransactionMode,
  op: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = op(tx.objectStore(STORE));
        tx.oncomplete = () => {
          db.close();
          resolve(req.result);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
        tx.onabort = () => {
          db.close();
          reject(tx.error);
        };
      })
  );
}

export function saveGame(slot: number, data: SaveData): Promise<void> {
  return run('readwrite', (s) => s.put(data, `slot-${slot}`)).then(
    () => undefined
  );
}

export async function loadGame(slot: number): Promise<SaveData | null> {
  try {
    const raw = await run<unknown>('readonly', (s) => s.get(`slot-${slot}`));
    return validateSave(raw);
  } catch {
    return null;
  }
}

function isNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isItemId(v: unknown): v is string {
  return (
    typeof v === 'string' &&
    Object.prototype.hasOwnProperty.call(ITEM_BY_ID, v)
  );
}

// Returns clean data, or null if the save is missing or corrupted.
export function validateSave(raw: unknown): SaveData | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const d = raw as Record<string, unknown>;

  if (d.version !== 1) return null;
  if (!isNum(d.level) || !isNum(d.xp)) return null;
  const level = Math.floor(d.level);
  if (level < 1 || level > BALANCE.progression.maxLevel || d.xp < 0) return null;

  if (!Array.isArray(d.bag) || d.bag.length > BALANCE.inventory.bagSize) return null;
  if (!d.bag.every(isItemId)) return null;

  if (typeof d.equipped !== 'object' || d.equipped === null) return null;
  const eq = d.equipped as Record<string, unknown>;
  const equipped: Record<Slot, string | null> = {
    weapon: null,
    armor: null,
    trinket: null,
  };
  for (const slot of SLOTS) {
    const v = eq[slot];
    if (v === null || v === undefined) continue;
    if (!isItemId(v) || ITEM_BY_ID[v].slot !== slot) return null;
    equipped[slot] = v;
  }

  let checkpoint: { x: number; y: number } | null = null;
  if (d.checkpoint !== null && d.checkpoint !== undefined) {
    const c = d.checkpoint as Record<string, unknown>;
    if (typeof c !== 'object' || !isNum(c.x) || !isNum(c.y)) return null;
    checkpoint = { x: c.x, y: c.y };
  }

  return {
    version: 1,
    level,
    xp: d.xp,
    bag: [...(d.bag as string[])],
    equipped,
    checkpoint,
  };
}