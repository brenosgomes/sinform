const nodemailer = require("nodemailer") ;
const knex = require("../config/db");
const crypto = require("crypto")
const bcrypt = require("bcryptjs");
const { havingNotBetween } = require("../config/db");
require("dotenv").config();
const email = process.env.email;
const password = process.env.password;

module.exports = app =>{
    const { existsOrError, equalsOrError } = app.api.validator;

    const encryptPassword = (password) => {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    };

    const transporter = nodemailer.createTransport({ 
        service: "Gmail", 
        auth: {
            user: email,
            pass: password
        }
    })

    const forgotPassword = async (req, res) => {
        const  { user_email } = req.body;

        try{
            const findUserByEmail = await knex("user")
                .where({ user_email: user_email })
                .first()

            if(!findUserByEmail)
                return res.status(400).send({error: "Usuario não enontrado"})
            
            const token  = crypto.randomBytes(20).toString('hex')
            const now = new Date()
            now.setHours(now.getHours() + 1);

            await knex("user")
                .update({ user_token: token, user_expiresToken: now})
                .where({ user_email: user_email })

            const email = {
                from: "CACIC",
                to: user_email,
                subject: "Email de recuperação de senha",
                text: "Para alterar sua senha acesse o link https://www.sinform.com.br/recover/" + token
            }

            transporter.sendMail(email, (err, info) => { 
                console.log("email enviado")
            })

            return res.status(200)
        } catch (err){
            return res.status(400).send({error: "Erro ao resetar senha"})
        }
    }

    const resetPassword = async (req, res) => {
        let { user_token, user_email, user_password, user_confirm_password } = req.body;
        try {
            existsOrError(user_password, "Senha não informada");
            existsOrError(user_confirm_password, "Confirmação de senha invalida");
            equalsOrError(user_password,    user_confirm_password, "Senhas não conferem");

            const findUserByEmail = await knex("user")
                    .where({ user_email: user_email })
                    .first()

            if(!findUserByEmail)
                return res.status(400).send({error: "Usuario não enontrado"})

            equalsOrError(user_token, findUserByEmail.user_token, "Token invalido")

            const now = new Date()
            console.log(now)
            console.log(findUserByEmail.user_expiresToken)
            if(now > findUserByEmail.user_expiresToken)
                return res.status(400).send({ error: "O token expirou"})

            user_password = encryptPassword(user_password);
            delete user_confirm_password;

            const attUser = await knex("user")
                .update({user_password})
                .where({ user_email: user_email });
            existsOrError(attUser, "user not found");

            res.status(200).json(attUser);
        } catch (err) {
                console.log("erro => " + err)
                return res.status(400).send(err);
        }
    }

    return { forgotPassword, resetPassword }
}