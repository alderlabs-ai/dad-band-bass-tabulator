const storageKey = 'basstab:state-file';

export const stateStorageLabel = 'browser local storage (basstab:state-file)';

export async function saveSnapshotFile(snapshot: unknown): Promise<string> {
  localStorage.setItem(storageKey, `${JSON.stringify(snapshot, null, 2)}\n`);
  return stateStorageLabel;
}

export async function loadSnapshotFile(): Promise<string> {
  const storedSnapshot = localStorage.getItem(storageKey);

  if (!storedSnapshot) {
    throw new Error('No saved JSON snapshot was found in browser storage yet.');
  }

  return storedSnapshot;
}
