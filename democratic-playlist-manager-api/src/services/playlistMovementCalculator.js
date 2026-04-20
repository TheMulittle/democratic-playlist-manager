function getPlaylistReorderMovements(
  currentPlaylistTracks,
  toBePlaylistTracks
) {
  const movements = [];
  const movingPlaylistTracks = [...currentPlaylistTracks];
  // TODO: this code smells
  for (const positionInToBePlaylist of toBePlaylistTracks.keys()) {
    const toBeTrackEntry = toBePlaylistTracks[positionInToBePlaylist];
    if (
      areTracksDifferent(
        movingPlaylistTracks[positionInToBePlaylist],
        toBeTrackEntry
      )
    ) {
      const positionInCurrentPlaylist = movingPlaylistTracks.findIndex(
        (currentTrackEntry) => areTracksEqual(currentTrackEntry, toBeTrackEntry)
      );
      movements.push({
        from: positionInCurrentPlaylist,
        to: positionInToBePlaylist,
      });
      moveTrack(
        movingPlaylistTracks,
        positionInCurrentPlaylist,
        positionInToBePlaylist
      );
    }
  }
  return movements;
}

function moveTrack(playlistTracks, fromPosition, toPosition) {
  const track = playlistTracks[fromPosition];
  playlistTracks.splice(fromPosition, 1);
  playlistTracks.splice(toPosition, 0, track);
}

function areTracksDifferent(entry1, entry2) {
  return (
    entry1.track.id !== entry2.track.id &&
    entry1.added_by.id !== entry2.added_by.id
  );
}

function areTracksEqual(entry1, entry2) {
  return (
    entry1.track.id === entry2.track.id &&
    entry1.added_by.id === entry2.added_by.id
  );
}

module.exports.getPlaylistReorderMovements = getPlaylistReorderMovements;
