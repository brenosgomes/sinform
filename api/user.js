const knex = require("../config/db");
const bcrypt = require("bcryptjs");
const fs = require("fs")
const { v4: uuid } = require("uuid");

module.exports = (app) => {
  const { existsOrError, notExistsOrError, equalsOrError } = app.api.validator;

  const encryptPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  };

  const get = async (req, res) => {
    const user = await knex("user").select("*");
    return res.json(user);
  };

  const getById = async (req, res) => {
    try {
      existsOrError(req.params.id, "user não existe!");

      const getIdUser = await knex("user")
        .where({ user_id: req.params.id })
        .first();
      existsOrError(getIdUser, "user não encontrado");

      res.json(getIdUser);
    } catch (msg) {
      return res.status(400).send(msg);
    }
  };

  const remove = async (req, res) => {
    try {
        existsOrError(req.params.id, "user não existe!");

        const rows = await knex("user")
            .where({ user_id: req.params.id })
            .first();

        const removeUser = await knex("user")
            .del()
            .where({ user_id: req.params.id });

        existsOrError(removeUser, "user não encontrado");

        if(rows.user_key != "image.jpg"){
          fs.unlink(`tmp/${rows.user_key}`, (err) => {
              if (err) {
                  console.log(err);
              } else {
              console.log("removed");
              }
          });
        }

        console.log(rows.user_key);

        res.status(204).send();
    } catch (msg) {
        console.log(msg)
        return res.status(400).send(msg);
    }
};

  const post = async (req, res) => {
    let {
      user_email,
      user_name,
      user_password,
      user_city,
      user_state,
      user_university,
      user_confirm_password,
    } = req.body;

    try {
      existsOrError(user_email, "user não informado");
      existsOrError(user_password, "Senha não informada");
      existsOrError(user_confirm_password, "Confirmação de senha invalida");
      equalsOrError(
        user_password,
        user_confirm_password,
        "Senhas não conferem"
      );

      const userFromDB = await knex("user")
        .where({ user_email: user_email })
        .first();
      if (user_email) {
        notExistsOrError(userFromDB, "user já cadastrado");
        res.status(400);
      }

      user_password = encryptPassword(user_password);
      delete user_confirm_password;

      if(req.file){
        if (!req.body.url)
          req.body.url = `http://localhost:5000/files/${req.file.filename}`;

        finalUser = await knex("user").insert({
          user_email,
          user_name,
          user_password,
          user_city,
          user_state,
          user_university,
          user_size: req.file.size,
          user_key: req.file.filename,
          user_url: req.body.url,
        });
      } else {
        if (!req.body.url)
          req.body.url = "http://localhost:5000/files/image.jpg";

        finalUser = await knex("user").insert({
          user_email,
          user_name,
          user_password,
          user_city,
          user_state,
          user_university,
          user_size: 85448,
          user_key: "image.jpg",
          user_url: req.body.url,
        });
      }
      const emailUserFromDB = await knex("user")
        .where({ user_email: user_email })
        .first();
      existsOrError(emailUserFromDB, "user não encontrado");

      const user_id = emailUserFromDB.user_id;
      const certificate_id = uuid();
      const certificate_participationTime = 0;

      await knex("certificate").insert({
        certificate_id,
        user_id,
        certificate_participationTime,
      });

      res.status(201).json({msg: "usuario cadastrado", user: finalUser})
    } catch (msg) {
      console.log(msg);
      return res.status(400).send(msg);
    }
  };

  const patch = async (req, res) => {
    let { user_password, user_confirm_password } = req.body;
    const user_id = req.params.id;
    try {
      existsOrError(user_password, "Senha não informada");
      existsOrError(user_confirm_password, "Confirmação de senha invalida");
      equalsOrError(
        user_password,
        user_confirm_password,
        "Senhas não conferem"
      );

      user_password = encryptPassword(user_password);
      delete user_confirm_password;

      const attUser = await knex("user")
        .update(user_password)
        .where({ user_id: user_id });
      existsOrError(attUser, "user not found");

      res.status(200).send(attUser);
    } catch (msg) {
      return res.status(400).send(msg);
    }
  };

  const put = async (req, res) => {
    const {
      user_email,
      user_name,
      user_password,
      user_city,
      user_state,
      user_university
    } = req.body;
    const user_id = req.params.id;
    try {
      existsOrError(user_id, "user does not exist!");

      if(req.file){
        if (!req.body.url)
          req.body.url = `http://localhost:5000/files/${req.file.filename}`;

        finalUser = await knex("user").update({
          user_email,
          user_name,
          user_city,
          user_state,
          user_university,
          user_size: req.file.size,
          user_key: req.file.filename,
          user_url: req.body.url,
        });
      } else {
        if (!req.body.url)
          req.body.url = "http://localhost:5000/files/image.jpg";

        finalUser = await knex("user").update({
          user_email,
          user_name,
          user_city,
          user_state,
          user_university,
          user_size: 85448,
          user_key: "image.jpg",
          user_url: req.body.url,
        });
      }

      res.status(200).send();
    } catch (msg) {
      return res.status(400).send(msg);
    }
  };

  return { get, getById, post, put, remove, patch };
};
