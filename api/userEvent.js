const knex = require("../config/db");
const user = require("./user");

module.exports = (app) => {
  const { existsOrError } = app.api.validator;

  const get = async (req, res) => {
    const userEvent = await knex("userEvent").select("*");
    return res.json(userEvent);
  };

  const getById = async (req, res) => {
    try {
      existsOrError(req.params.id, "userEvent does not exist!");

      const getIdUserEvent = await knex("userEvent")
        .where({ userEvent_id: req.params.id })
        .first();
      existsOrError(getIdUserEvent, "userEvent not found");

      res.json(getIdUserEvent);
    } catch (msg) {
      return res.status(400).send(msg);
    }
  };

  const remove = async (req, res) => {
    try {
      existsOrError(req.params.id, "userEvent does not exist!");

      const removeUserEvent = await knex("userEvent")
        .del()
        .where({ userEvent_id: req.params.id });
      existsOrError(removeUserEvent, "userEvent not found");

      res.status(204).send();
    } catch (msg) {
      return res.status(400).send(msg);
    }
  };

  const post = async (req, res) => {
    const userEvent = req.body;
    const userEvent_presence = false;

    const user_id = userEvent.user_id;
    const event_id = userEvent.event_id;

    try {
      const newUserEvent = await knex("userEvent").insert({
        user_id,
        event_id,
        userEvent_presence,
      });
      res.json(newUserEvent);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  };

  const put = async (req, res) => {
    const userEvent = req.body;
    try {
      userEvent_presence = true;

      console.log(userEvent)

      const modifiedUserEvent = await knex("userEvent").where({
        user_id: userEvent.user_id,
        event_id: userEvent.event_id,
      }).first()

      const certificateFromDatabase = await knex("certificate")
        .where({ user_id:  userEvent.user_id})
        .first()

      if (modifiedUserEvent) {
        const event = await knex("event").where({
          event_id: userEvent.event_id,
        }).first();

        certificateFromDatabase.certificate_participationTime = parseInt(certificateFromDatabase.certificate_participationTime) + parseInt(event.event_workload);
      } else { 
          return res.status(400).send("oin");;
      }

      const attUserEvent = await knex("userEvent")
        .update({userEvent_presence})
        .where({ user_id: userEvent.user_id, event_id: userEvent.event_id });
      existsOrError(attUserEvent, "userEvent not found");

      const attCertificate = await knex("certificate")
        .update({certificate_participationTime: certificateFromDatabase.certificate_participationTime})
        .where({ user_id: userEvent.user_id });
      existsOrError(attCertificate, "userEvent not found");

      res.status(200).send();
    } catch (msg) {
        console.log(msg)
      return res.status(400).send(msg);
    }
  };

  return { get, getById, post, put, remove };
};
