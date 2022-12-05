# Great Games Web Server
The web server is a Node.js application that uses express.js to serve web pages.

## Web Server Setup

Make sure to update db/index.js with the login credentials of your database, uncommenting the password field if necessary.

```bash
# Restore the database dump
# You can rename the database from project, or choose a different user, but make sure to update db/index.js.
psql --user postgres project < project.dump
```

```bash
# Install NVM

cd path/to/repo/game-store # Change working directory to the game-store subdirectory

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

# Install the Long Term Support version of Node.js
nvm install --lts

nvm use --lts

# Install the required node modules
npm install
```

## Web Server Usage

By default, the website is bound to [http://localhost:3000](http://localhost:3000) when running.

```bash
# Run the web server (assumes database is already running)
npm start
```

Simply go to the link above to use the site! More information is provided in the user manual section of the report.