# Democratic Spotify Playlist Front End
API to Reorder Collaborative Playlist so each contributor has one song per cycle

Still under development


## INSTALLING THE APP

Clone the repo and run `npm install` to install its dependencies. 

Before running the app, it is necessary to set the enviroment variable regarding the backend URL. For convinience you can add a .env.local file in which details of the Spotify API can be added during development time:


```
//Backend base URL
REACT_APP_API_BASE_URL = 'http://localhost:8080'
``` 

Make sure you have the [backend](https://github.com/mgkramar/democratic-spotify-playlist-reorderer-back-end) running in the specificed address . After configuring the enviroment variables, run:

```
 npm start
``` 


## Acknowledgments

This project was based in [@yurigava's](https://github.com/yurigava/democratic-spotify-playlist) ideia
