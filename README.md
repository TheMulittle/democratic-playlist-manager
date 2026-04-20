[![codecov](https://codecov.io/gh/mgkramar/democratic-spotify-playlist-reorderer-back-end/branch/master/graph/badge.svg?token=11N5G337OB)](https://codecov.io/gh/mgkramar/democratic-spotify-playlist-reorderer-back-end) [![HitCount](http://hits.dwyl.com/mgkramar/democratic-spotify-playlist-reorderer-back-end.svg)](http://hits.dwyl.com/mgkramar/democratic-spotify-playlist-reorderer-back-end)



# Democratic Spotify Playlist Back End
API to Reorder Collaborative Playlist so each contributor has one song per cycle

The front-end is still to be developed

## OBJECTIVE

You are in a barbecue party in Brazil when you and your friends decided to put some music on. You all decide to create a shared playlist on spotify. One of your friends, Greg, starts adding songs and end up filling the playlist with 30 consecutively Nordic Death Metal songs because he strong believes he is a Viking even though he was born in Sao Paulo. Now, you, that just wanted to relax listening to Sugar by Robert Schulz, is required to wait 5 hours (because each of his songs take 10 minutes) before listening to your beloved song. 

Democratic-playlist comes to the rescue! The idea behind it is simple: a mechanism to reorder spotify playlists in such a manner that at most one song from every person will be played before the second song from someone is played

## FEATURE ROADMAP

- **Democratic sorting: (On going)** sort the playlist ensuring that at most one song from every person will be played before the second song from someone is played -
- **Voteskip (On going):** it is the 3rd time that you add Sugar by Robert Shculz and the rest of your friends would like to skip that damn song. A voting system will be implemented to allow a democratic (but not necessarly fair) vote to be place to decided whether the song is skipped or not
- **Multiple Users enabled:** it would be nice if this application could handle multiple people adding their playlists
- **Democratic time limit:** you don't want someone adding a 10h podcast to the list, therefore a track excedding the time limit defined should be deleted from the playlist
- **Mercenary sorting:** sort the playlist ensuring that some have priority over other people (I am sure you want the house owner to have some priveleges)

## TECHNICAL ROADMAP

- Improve testing covereage
- Handle missing negative scenarios
- Create a front-end applicatoin
- ~~Dockerize the application~~

## RUNNING THE APP LOCALLY

Clone the repo and run `npm install` to install its dependencies. 

Before running the app, it is necessary to set some enviroment variables regarding Spotify API authentication via Authorization code flow (more on the subject [here](https://github.com/thelinmichael/spotify-web-api-node#authorization)). For convinience you can add a .env file in which details of the Spotify API can be added during development time:


```
// Callback endpoint that will be called after successful authentication on Spotify
SPOTIFY_CALLBACK=http://localhost:8080/callback

// The front-end base URL
WEB_APP_BASE_URL=http://localhost:3000

// Spotify ID and Secret
SPOTIFY_CLIENT_ID=''
SPOTIFY_CLIENT_SECRET=''
``` 

After configuring the enviroment variables, run:

```
 npm start
``` 

Once the server is up and running you need to authenticate to spotify via `/secret-login`. Once authenticated , one can perform a POST call like the one below to start having its colaborative playlist managed. Notice that the playlist needs to belong to the user that is currently authenticated

```
Endpoint: http://localhost:8080/playlist

Body: 
{
    playlistId: ''
}
```

## BUILDING THE CONTAINER AND RUNNING THE APPLICATION AS A CONTAINER

Clone the repo and run `npm install` to install its dependencies. 

Build the container image via `docker build --tag dsm:latest .` command in the project's root folder

Run the container from the image just created. 
`SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` needs to be passed as environment variables. Environment variables `SPOTIFY_CALLBACK` and `WEB_APP_BASE_URL`` defaults to http://localhost:8080/callback and
http://localhost:3000, respectively. They can be overriden if required

```
 docker run -p 8080:8080 -e SPOTIFY_CLIENT_ID=[clientId] -e SPOTIFY_CLIENT_SECRET=[clientSecret] dsm
``` 

## Acknowledgments

This project was created by me and completely refactored by [@mgkramar](https://github.com/mgkramar)

## Contributing to the project

First things first, ensure you have [Node along with NPM installed](https://nodejs.org/en/download/).

Secondly, ensure that your code [meet the repo's formatting standards](__docs__/LINTING.md)
