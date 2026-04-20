function generatePlaylistItems(usersAndTracks = []) {
  let addedAtCounter = 0;
  return usersAndTracks.map((userAndTrack) => ({
    added_at: userAndTrack.added_at
      ? userAndTrack.added_at
      : `2019-12-27T01:30:${addedAtCounter++}Z`,
    added_by: {
      id: userAndTrack.added_byId ?? userAndTrack.trackId[0],
    },
    track: {
      id: userAndTrack.trackId,
    },
  }));
}

function generateNItems(numberOfItems) {
  usersAndTracks = Array(numberOfItems);

  usersAndTracks = [...usersAndTracks.keys()].map((element) => {
    return { trackId: `T${element}`, added_byId: `U${element}` };
  });
  
  return generatePlaylistItems(usersAndTracks);
}

module.exports.generatePlaylistItems = generatePlaylistItems;
module.exports.generateNItems = generateNItems;
