import * as express from 'express';
import 'express-basic-auth';
import { request } from 'http';
import loki = require('lokijs');
import expressBasicAuth = require('express-basic-auth');
//let db = new loki('loki.json')
let db = new loki("quickstart.db", {
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true,
  autosaveInterval: 4000
});

function databaseInitialize() {
  let parties: Collection<Party> = db.getCollection("parties");
  if (parties === null) {
    parties = db.addCollection("parties");
    console.log("added Collection")
  }
  runProgram(parties);


}
function runProgram(parties: Collection<Party>) {

  //let parties: Party[] = [];

  let MAX_PEOPLE: Number = 10;
  var server = express();
  server.use(express.json());
  const adminFilter = expressBasicAuth({ users: { admin: 'P@ssw0rd!' } });

  //server receives request(/register) from client and sends response
  server.post('/register/:party', (request, response) => {
    let name = request.params.party;
    let firstName = request.body.firstName;
    let lastName = request.body.lastName;
    let party: Party = parties.data.find((element) => {
      return element.name === name;
    });
    if (firstName == null || lastName == null) {
      response.status(400);
      response.send(`{Bad Request - no Name sent}`);
    }
    else if (party.people.length < MAX_PEOPLE) {
      let p: Person = new Person(firstName, lastName);
      //parties[party].people.push(p);
      let party: Party = parties.data.find((element) => {
        return element.name === name;
      });
      party.people.push(p);
      parties.update(party);

      response.send({
        response: `Thank you for registering at my party, ${p.toString()}`
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

  server.get('/guests/:party', adminFilter, (request, response) => {
    let name = request.params.party;
    let party: Party = parties.data.find((element) => {
      return element.name === name;
    });
    let ret: string = "";
    for (let i = 0; i < party.people.length; i++) {
      ret += `{${i + 1}. Guest:  ${party.people[i]}} \n`;
    }

    // response.send(`{People registered at my party ${party} are:} \n${ret}`);
    response.send(party.people);
  });
  server.post('/newpartry', (request, response) => {
    let name = request.body.name;
    let location = request.body.location;
    let date = request.body.date;
    let represent: Person = new Person(request.body.firstName, request.body.lastName);
    let p: Party = new Party(name, location, date, represent);
    //parties[p.name]=p;
    parties.insert(p);
    response.send(
      `${p.toString()} added`
    );
  });
  server.get('/party/:party', (request, response) => {
    let name = request.params.party;
    let party: Party = parties.data.find((element) => {
      return element.name === name;
    });
    console.log(party.toString())
    // response.send(`${party.toString()}`);//does not work
    response.send(`{${party.name}, ${party.location},${party.date},${party.represent.firstName},${party.represent.lastName}}`);
  })

}

class Person {

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
class Party {
  people: Person[] = [];
  name: string;
  location: string;
  date: Date;
  represent: Person;
  constructor(name: string, location: string, date: Date, represent: Person) {
    this.name = name;
    this.location = location;
    this.date = date;
    this.represent = represent;
  }
  toString() {
    return `${this.represent.toString()}s Party ${this.name} at ${this.location} on ${this.date}`;
  }
}