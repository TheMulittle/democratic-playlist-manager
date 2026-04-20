function generatePlaylist(playlistInfo) {

  return { 
    body: {
      items: playlistInfo.playlistInfo ?? [],
      limit: playlistInfo.limit ?? 100,
      offset: playlistInfo.offset ?? 0,
      total: playlistInfo.total ?? 1 
    }
  };
}

module.exports.generatePlaylist = generatePlaylist;
