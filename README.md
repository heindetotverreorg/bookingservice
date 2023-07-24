# reservepadel

## Project setup
```
npm install | yarn wont run on the server so we need a package-lock instead.json of a yarn.lock
```

### For prod on local
```
npm start | this will start the server and server the FE in prod mdoe
```

### For dev on local
```
npm start and npm server | this will start the server and run the FE in a seperate process in dev mode
```

### what is this anyway
```
This is a simple FE built around a node js server that uses puppeteer to login to a sports booking platform and when logged in book certain padel courts. It's goal is to run automagically on 00:00 every sunday so I dont have to get out of bed to book padel for me and my mates. It can also be used custom with set dates/times because the techniques are there anyway
```
