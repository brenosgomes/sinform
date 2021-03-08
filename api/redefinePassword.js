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
        const  {user_email} = req.body;

        try{
            const findUserByEmail = await knex("user")
                .where({ user_email })
                .first()

            if(!findUserByEmail){
                res.status(400).send({error: "Usuario não enontrado"})
            }
            
            const token  = crypto.randomBytes(20).toString('hex')
            const now = new Date()
            now.setHours(now.getHours() + 1);

            await knex("user")
                .update({ user_token: token, user_expiresToken: now})
                .where({ user_email: user_email })

            const email = {
                from: "CACIC",
                to: user_email,
                subject: "[SINFORM 2021] Recuperação de senha",
                text: "Para alterar sua senha acesse o link https://www.sinform.com.br/redefine?token=" + token
            }

            transporter.sendMail(email)

            res.status(200).send("Email enviado")
        } catch (err){
            res.status(400).send({error: "Erro ao resetar senha"})
        }
    }

    const resetPassword = async (req, res) => {
        let { user_password, user_confirm_password } = req.body;
        const user_token = req.params.token
        console.log(user_token)
        console.log(req.body)
        try {
            existsOrError(user_password, "Senha não informada");
            existsOrError(user_confirm_password, "Confirmação de senha invalida");
            equalsOrError(user_password, user_confirm_password, "Senhas não conferem");

            const findUserByToken = await knex("user")
                    .where({ user_token: user_token })
                    .first()

            if(!findUserByToken)
                return res.status(400).send({error: "Usuario não enontrado"})

            const now = new Date()
            if(now > findUserByToken.user_expiresToken)
                return res.status(400).send({ error: "O token expirou"})

            user_password = encryptPassword(user_password);
            delete user_confirm_password;

            const attUser = await knex("user")
                .update({user_password})
                .where({ user_email: findUserByToken.user_email });
            existsOrError(attUser, "user not found");

            res.status(200).send("Senha redefinida");
        } catch (err) {
                console.log("erro => " + err)
                return res.status(400).send(err);
        }
    }

    return { forgotPassword, resetPassword }
}