require("dotenv").config()
const authSecret = process.env.authSecret;
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const knex = require("../config/db");

module.exports = (app) => {
  const signIn = async (req, res) => {
    if (!req.body.user_email || !req.body.user_password) {
      return res.status(400).send("Insira usuario e senha");
    }

    const user = await knex("user")
      .where({ user_email: req.body.user_email })
      .first();

    if (!user) return res.status(400).send("user não encontrado");

    const isMatch = bcrypt.compareSync(
      req.body.user_password,
      user.user_password
    );
    if (!isMatch)
      return res.status(401).send("Combinação de user e senha inválida!");

    const now = Date.now();

    payload = {
      id: user.user_id,
      email: user.user_email,
      password: user.user_password,
      name: user.user_name,
      city: user.user_city,
      state: user.user_state,
      university: user.user_university,
      stateUniversity: user.user_stateUniversity,
      iat: now,
      exp: now + 1000 * 60 * 60 * 24,
    };

    res.json({
      ...payload,
      token: jwt.encode(payload, authSecret),
    });
  };

  const validateToken = (req, res) => {
    const { userData } = req.body || null;

    try {
      if (userData) {
        const token = jwt.decode(userData.token, authSecret);
        if (new Date(token.exp * 1000) > new Date()) {
          return res.status(200).json({
            success: true,
            name: token.name,
            email: token.email
          });
        }
      }
    } catch (e) {
      res.status(401);
    }
    res.send(false);
  };

  return { signIn, validateToken };
};
