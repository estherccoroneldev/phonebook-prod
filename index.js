const express = require("express");
const app = express();
let data = require("./persons-db.json");

app.use(express.json());

app.get("/api/persons", (_, response) => {
  response.json(data.persons);
});

app.get("/info", (_, response) => {
  const date = new Date();
  response.send(`
  <p>Hello there! PhoneBook has info for ${data.persons.length} people</p>
  <p>${date}</p>
  `);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = data?.persons.find((person) => {
    return person.id === id;
  });

  if (person) {
    response.json(person);
  } else {
    response.statusMessage = "The specified person was not found";
    response.status(400).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  data.persons = data.persons.filter((note) => note.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const maxId =
    data.persons.length > 0 ? Math.max(...data.persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

const isNameEqual = (newName) => (person) =>
  person.name.toLocaleLowerCase() === newName.toLocaleLowerCase();

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.phoneNumber) {
    return response.status(400).json({
      error: "name and/or phone number missing",
    });
  }

  const isExisting = data.persons.some(isNameEqual(body.name));

  if (isExisting) {
    // 422 Unprocessable Entity
    return response.status(422).json({
      error: "Unprocessable Entity: Name must be unique",
    });
  }

  const person = {
    name: body.name,
    phoneNumber: body.phoneNumber,
    id: generateId(),
  };

  data.persons = [...data.persons, person];

  response.json(person);
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});