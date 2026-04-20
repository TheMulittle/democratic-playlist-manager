function generateCurrentUserProfile(user) {
  return {
    country: "BR",
    display_name: "User Name",
    email: "user_email@provider.com",
    explicit_content: {
      filter_enabled: false,
      filter_locked: false,
    },
    external_urls: {
      spotify: `https://open.spotify.com/user/${user.userId}`,
    },
    followers: {
      href: null,
      total: 24,
    },
    href: `https://api.spotify.com/v1/users/${user.userId}`,
    id: user.userId,
    images: [
      {
        height: null,
        url: "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=738740789498937&height=300&width=300&ext=8&hash=Ah1ygg",
        width: null,
      },
    ],
    product: "premium",
    type: "user",
    uri: `spotify:user:${user.userId}`,
  };
}

module.exports = { generateCurrentUserProfile };
