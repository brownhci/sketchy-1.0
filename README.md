# sketchy-1.0
Sketchy and data featured in CSCW 2020 paper: "Sketchy: Drawing Inspiration from the Crowd"
https://jeffhuang.com/papers/Sketchy_CSCW20.pdf

# how to run sketchy

Install node and npm:

https://nodejs.org/en/download/

Open terminal to test if install was successful, run:
node -v
npm -v

(both should print out the version #'s for node and npm)

-------

Download sketchy code...pun intended ;)
https://github.com/brownhci/sketchy

Open terminal and go to directory where the sketchy code is.

## Admin interface
visit `/admin` to view the admin interface. Here, you will see two tables. The first table (Rooms in Database) shows all current and past rooms. The second table (Current Rooms) shows all rooms in memory. Click on a row in the table to view all sketches in that room.

When viewing a room in the Admin interface, the `delete` button will mark a room as deleted and kick everyone out of that room. When running an experiment, press this button to send everyone back to the home page after a portion of the activity.
The `send survey` button will send everyone in that room or in the homepage to the post-survey page. Press this button at the very end of the activity.

Clicking on any sketch in the admin view will bring up the sketch page. Here, the full history of the sketch can be viewed, along with any peeks performed by the user.


## Run the database

Run `mongodb` to start a mongodb process.

Run `mongo` to view contents of the database. Then in the mongo console, run `use sketchy` and `show collections`.


## Build the frontend
Navigate to `/sketchy-frontend`, then run `npm install` and `npm run build`


## Run the server
In the project directory, run.

`npm install` to install dependencies

`npm start` to run the server

(should print: "Server listening on port 8080")

Then access through browser using 'http://127.0.0.1:8080/'. You will need to create a room before you can join one.

-------

For best experience open on multiple tabs/windows to see how users experience Sketchy.
