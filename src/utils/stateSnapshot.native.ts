import { File, Paths } from 'expo-file-system';

const stateFile = new File(Paths.document, 'basstab-state.json');

export const stateStorageLabel = stateFile.uri;

export async function saveSnapshotFile(snapshot: unknown): Promise<string> {
  stateFile.create({ intermediates: true, overwrite: true });
  stateFile.write(`${JSON.stringify(snapshot, null, 2)}\n`);

  return stateFile.uri;
}

export async function loadSnapshotFile(): Promise<string> {
  if (!stateFile.exists) {
    throw new Error('No saved JSON file was found yet.');
  }

  return stateFile.text();
}
