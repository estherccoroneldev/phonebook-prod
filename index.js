const express = require("express");
const fs = require("fs/promises");
const morgan = require("morgan");
const app = express();
let persons = require("./persons-db.json").persons;

morgan.token("response-custom", function (request, _) {
  return request.method === "POST" ? JSON.stringify(request.body) : "";
});

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :response-custom"
  )
);
app.use(morgan("tiny"));

app.use(express.json());

app.get("/api/persons", (_, response) => {
  response.json(persons);
});

app.get("/info", (_, response) => {
  const date = new Date();
  response.send(`
  <p>Hello there! PhoneBook has info for ${persons.length} people</p>
  <p>${date}</p>
  `);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => {
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
  persons = persons.filter((note) => note.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
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

  const isExisting = persons.some(isNameEqual(body.name));

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

  persons = [...persons, person];
  setPerson({ persons });
  response.json(person);
});

async function setPerson(body) {
  try {
    await fs.writeFile("./persons-db.json", JSON.stringify(body));
  } catch (err) {
    console.log(JSON.stringify(err, null, 2));
  }
}

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});