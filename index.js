require('dotenv').config()

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Contact = require("./models/contact");

const app = express();

const PORT = process.env.PORT || 3001;

morgan.token("body", (req, res) => JSON.stringify(req.body));

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
);

app.get("/api/persons", (req, res, next) => {
  Contact.find({})
    .then((contacts) => {
      res.json(contacts);
    })
    .catch(error => next(error));
});

app.get("/info", (req, res, next) => {
  Contact.find({})
    .then((contacts) => {
      res.send(`<p>Phonebook has info for ${contacts.length} people</p>
            <p>${new Date()}</p>`);
    })
    .catch(error => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  console.log(`Fetching contact with id: ${id}`);
  Contact.findById(id)
    .then((contact) => {
      if (contact) {
        res.json(contact);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Contact.findByIdAndDelete(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => next(error));
});

app.post("/api/persons", (req, res, next) => {
  if (!req.body || !req.body.name || !req.body.number)
    return res.status(400).json({ error: "Content missing" });

  const name = req.body.name;
  const number = req.body.number;

  Contact.findOne({ name: name })
    .then((existingContact) => {
      if (existingContact) {
        return Contact.findByIdAndUpdate(
          existingContact._id,
          { number: number },
          { new: true }
        );
      } else {
        const newContact = new Contact({
          name,
          number,
        });
        return newContact.save();
      }
    })
    .then((savedContact) => {
      res.status(201).json(savedContact);
    })
    .catch(error => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  if (!req.body || !req.body.name || !req.body.number)
    return res.status(400).json({ error: "Content missing" });

  const name = req.body.name;
  const number = req.body.number;
  const updatedContact = {
    name,
    number,
  };
  Contact.findByIdAndUpdate(id, updatedContact, { new: true, runValidators: true, context: 'query' })
    .then((contact) => {
      if (contact) {
        res.json(contact);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === 'ValidationError') { return response.status(400).json({ error: error.message }) }

  next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
