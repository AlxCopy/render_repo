const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 3001;
const contacts = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

morgan.token("body", (req, res) => JSON.stringify(req.body));

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
);

app.get("/api/persons", (req, res) => {
  res.send(contacts);
});

app.get("/info", (req, res) => {
  res.send(`<p>Phonebook has info for ${contacts.length} people</p>
            <p>${new Date()}</p>`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const contact = contacts.find((c) => c.id === id);

  if (!contact) {
    res.status(404).send({ error: "Contact not found" });
    return;
  }

  res.json(contact);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!contacts.some((contact) => contact.id === id)) {
    res.status(404).send({ error: "Contact not found" });
    return;
  }
  contacts.filter((contact) => contact.id !== id);

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({ error: "Name or number is missing" });
  }

  if (contacts.some((contact) => contact.name === name)) {
    return res.status(400).json({ error: "Name must be unique" });
  }

  const newId = (Math.random() * 10000) | 0;

  const newContact = {
    id: newId,
    name,
    number,
  };
  contacts.push(newContact);
  res.status(201).json(newContact);
});

app.put("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({ error: "Name or number is missing" });
  }

  const contactIndex = contacts.findIndex((c) => c.id === id);
  if (contactIndex === -1) {
    return res.status(404).json({ error: "Contact not found" });
  }

  contacts[contactIndex] = { id, name, number };
  res.json(contacts[contactIndex]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
