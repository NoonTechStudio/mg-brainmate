import Dexie, { type Table } from 'dexie';

export interface Lead {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  category: string;
  status: string;
  followUpDate?: string;
  notes?: string;
  source?: string;
  estimatedValue?: number;
  assignedTo?: string;
  customFields?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id?: number;
  type: 'added' | 'updated' | 'status_changed' | 'followup_done' | 'deleted';
  description: string;
  leadId?: number;
  createdAt: string;
}

export interface AppSetting {
  id?: number;
  key: string;
  value: string;
}

export interface TeamMember {
  id?: number;
  name: string;
  phone: string;
  role: string;
}

class BrainMateDB extends Dexie {
  leads!: Table<Lead>;
  activities!: Table<Activity>;
  settings!: Table<AppSetting>;
  team!: Table<TeamMember>;

  constructor() {
    super('BrainMateDB');
    this.version(1).stores({
      leads: '++id, name, phone, category, status, followUpDate, createdAt',
      activities: '++id, type, leadId, createdAt',
      settings: '++id, &key',
      team: '++id, name',
    });
  }
}

export const db = new BrainMateDB();

export async function getSetting(key: string): Promise<string | null> {
  const setting = await db.settings.where('key').equals(key).first();
  return setting?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const existing = await db.settings.where('key').equals(key).first();
  if (existing?.id != null) {
    await db.settings.update(existing.id, { value });
  } else {
    await db.settings.add({ key, value });
  }
}

export async function logActivity(
  type: Activity['type'],
  description: string,
  leadId?: number
): Promise<void> {
  await db.activities.add({
    type,
    description,
    leadId,
    createdAt: new Date().toISOString(),
  });
}
