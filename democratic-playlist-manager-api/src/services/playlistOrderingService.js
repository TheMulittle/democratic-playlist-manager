function defineCurrentTrackInformation(playlistTracks, currentTrack) {
  if (playlistTracks.indexOf(currentTrack) >= 0) {
    return {
      position: playlistTracks.indexOf(currentTrack),
      userId: currentTrack.added_by.id,
    };
  }

  return {};
}

function defineMidCycleUserOrder(playlistTracks, currentTrackInfo) {
  const userOrder = [...playlistTracks]
    .sort(
      (track1, track2) => new Date(track1.added_at) - new Date(track2.added_at)
    )
    .reduce((users, track) => {
      if (!users.find((user) => user === track.added_by.id)) {
        users = [...users, track.added_by.id];
      }
      return users;
    }, []);

  const currentTrackUserPositionInCycle = userOrder.indexOf(
    currentTrackInfo.userId
  );
  return pivotUserOrder(userOrder, currentTrackUserPositionInCycle);
}

function definePlaylistTracksOrder(playlistTracks, currentTrack) {
  const currentTrackInfo = defineCurrentTrackInformation(
    playlistTracks,
    currentTrack
  );
  let reorderedPlaylist = [...playlistTracks];
  if (currentTrackInfo.userId) {
    const userOrder = defineMidCycleUserOrder(playlistTracks, currentTrackInfo);
    const numberOfTracksPerUser = calculateNumberOfTracksPerUser(
      userOrder,
      playlistTracks
    );
    reorderedPlaylist = definePlaylistOrder(
      playlistTracks,
      userOrder,
      numberOfTracksPerUser,
      currentTrackInfo
    );
  }
  return reorderedPlaylist;
}

function pivotUserOrder(userOrder, currentTrackUserPositionInCycle) {
  return userOrder
    .slice(currentTrackUserPositionInCycle + 1)
    .concat(userOrder.slice(0, currentTrackUserPositionInCycle + 1));
}

function calculateNumberOfTracksPerUser(userOrder, playlistTracks) {
  return userOrder.map((userId) => ({
    userId,
    tracks: playlistTracks.filter((track) => track.added_by.id === userId)
      .length,
  }));
}

function definePlaylistOrder(
  playlistTracks,
  userOrder,
  numberOfTracksPerUser,
  currentTrackInfo
) {
  const maxNumberOfTracks = numberOfTracksPerUser
    .map((info) => info.tracks)
    .reduce(
      (numberOfTracks1, numberOfTracks2) =>
        numberOfTracks1 > numberOfTracks2 ? numberOfTracks1 : numberOfTracks2,
      0
    );
  const numberOfUsers = userOrder.length;
  const numberOfReorderedTracksPerUser = Array(numberOfUsers).fill(0);

  // TODO: have a look here, this code smells
  const orderedPlaylistTracks = Array(maxNumberOfTracks * numberOfUsers);
  for (let i = currentTrackInfo.position + 1; i < playlistTracks.length; i++) {
    const position = userOrder.indexOf(playlistTracks[i].added_by.id);
    orderedPlaylistTracks[
      numberOfReorderedTracksPerUser[position]++ * numberOfUsers + position
    ] = playlistTracks[i];
  }

  return playlistTracks
    .slice(0, currentTrackInfo.position + 1)
    .concat(orderedPlaylistTracks.filter(Boolean));
}

module.exports.definePlaylistTracksOrder = definePlaylistTracksOrder;
