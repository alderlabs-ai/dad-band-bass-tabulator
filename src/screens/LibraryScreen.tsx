import { useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../components/EmptyState';
import { LibrarySongCard } from '../components/LibrarySongCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SearchBar } from '../components/SearchBar';
import { palette } from '../constants/colors';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { useBassTab } from '../store/BassTabProvider';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Library'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function LibraryScreen({ navigation }: Props) {
  const {
    songs,
    createSong,
    deleteSong,
    loadStateFromFile,
    saveStateToFile,
    storageFileUri,
  } = useBassTab();
  const [query, setQuery] = useState('');
  const [songPendingDelete, setSongPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [fileActionMessage, setFileActionMessage] = useState(
    `State storage: ${storageFileUri}`,
  );

  const filteredSongs = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return songs;
    }

    return songs.filter((song) =>
      [song.title, song.artist, song.key, song.tuning]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, songs]);

  const handleCreateSong = () => {
    const song = createSong();
    navigation.navigate('SongEditor', { songId: song.id });
  };

  const handleSaveState = async () => {
    try {
      await saveStateToFile();
      setFileActionMessage('State saved.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save state.';
      setFileActionMessage(`Save failed: ${message}`);
    }
  };

  const handleLoadState = async () => {
    try {
      await loadStateFromFile();
      setFileActionMessage('State restored.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to restore state.';
      setFileActionMessage(`Restore failed: ${message}`);
    }
  };

  const handleDeleteSong = (songId: string, songTitle: string) => {
    setSongPendingDelete({ id: songId, title: songTitle });
  };

  const confirmDeleteSong = () => {
    if (!songPendingDelete) {
      return;
    }

    deleteSong(songPendingDelete.id);
    setSongPendingDelete(null);
    setFileActionMessage('Song deleted.');
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headingBlock}>
          <Text style={styles.title}>BassTab Library</Text>
          <Text style={styles.subtitle}>
            Quick-access charts for rehearsal and stage use.
          </Text>
        </View>
        <View style={styles.actionRow}>
          <PrimaryButton label="Save State" onPress={handleSaveState} variant="secondary" />
          <PrimaryButton label="Restore State" onPress={handleLoadState} variant="ghost" />
          <PrimaryButton label="New Song" onPress={handleCreateSong} />
        </View>
      </View>

      <Text style={styles.storageNote}>{fileActionMessage}</Text>

      <SearchBar value={query} onChangeText={setQuery} />

      {filteredSongs.length === 0 ? (
        <EmptyState
          title="No songs found"
          description="Try a different search term or create a new chart."
        />
      ) : (
        filteredSongs.map((song) => (
          <LibrarySongCard
            key={song.id}
            song={song}
            onEdit={() => navigation.navigate('SongEditor', { songId: song.id })}
            onLive={() => navigation.navigate('PerformanceView', { songId: song.id })}
            onDelete={() => handleDeleteSong(song.id, song.title)}
          />
        ))
      )}

      <Modal
        visible={Boolean(songPendingDelete)}
        transparent
        animationType="fade"
        onRequestClose={() => setSongPendingDelete(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete song?</Text>
            <Text style={styles.modalText}>
              {songPendingDelete
                ? `Are you sure you want to delete "${songPendingDelete.title}"?`
                : ''}
            </Text>
            <View style={styles.modalActions}>
              <PrimaryButton
                label="Cancel"
                onPress={() => setSongPendingDelete(null)}
                variant="ghost"
              />
              <PrimaryButton
                label="Delete"
                onPress={confirmDeleteSong}
                variant="danger"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 16,
  },
  headingBlock: {
    gap: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: palette.text,
  },
  subtitle: {
    fontSize: 17,
    color: palette.textMuted,
    lineHeight: 24,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  storageNote: {
    fontSize: 13,
    lineHeight: 20,
    color: palette.textMuted,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 20,
    gap: 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: palette.text,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    color: palette.textMuted,
  },
  modalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },
});
