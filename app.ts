import * as express from 'express';
import 'express-basic-auth';
import { request } from 'http';
import expressBasicAuth = require('express-basic-auth');

let people: Guest[] = [];
let MAX_PEOPLE: Number = 10;
var server = express();
server.use(express.json());
const adminFilter = expressBasicAuth({ users: { admin: 'P@ssw0rd!' }});

//server receives request(/register) from client and sends response
server.post('/register', (request, response) => {
  let firstName = request.body.firstName;
  let lastName = request.body.lastName;
  if (firstName == null || lastName == null) {
    response.status(400);
    response.send(`{Bad Request - no Name sent}`);
  }
  else if (people.length < MAX_PEOPLE) {
    people.push(new Guest(firstName, lastName));
    response.send({
      response: `Thank you for registering at my party, 
    ${request.body.firstName} ${request.body.lastName}`
    });
  } else {
    response.send({ response: `Sorry guy, there are already ${MAX_PEOPLE} people at my party` });
  }

});

const port = 8080;
server.listen(port, function () {
  console.log(`API is listening on port ${port}`);
});

//server.use(expressBasicAuth( { authorizer: adminFilter } ))

server.get('/guests',adminFilter, (request, response) => {

    let ret: string = "";
    for (let i = 0; i < people.length; i++) {
      ret += people[i] + '\n';
    }

    response.send(`People registered at my party are: \n${ret}`);
 
  

});
server.get('/party', (request, response) => {
  response.send({
    name: 'The future is now',
    location: 'Somewhere',
    date: new Date()
  });

});
class Guest {

  firstName: string;
  lastName: string;
  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
  toString() {
    return `${this.firstName} ${this.lastName}`
  }
}
