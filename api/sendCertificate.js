const knex = require("../config/db")
const pdf = require('html-pdf');
const ejs = require('ejs');
const nodemailer = require("nodemailer") 
require("dotenv").config()
const email = process.env.email;
const password = process.env.password;

module.exports = app => {    
    var options = {
        type: "pdf",
        height: "1080px",
        width: "1980px"
    }

    const transporter = nodemailer.createTransport({ 
        service: "Gmail", 
        auth: {
            user: email,
            pass: password
        }
    })

    const getParticipant = async (req, res) => {
        const participants = await knex("user").select("user_name", "user_email","certificate_participationTime", "certificate_id")
            .innerJoin("certificate", "user.user_id", "certificate.user_id")

        for (participant in participants) {
            (function (participant) {
                setTimeout(function () {
                    var username = participants[participant].user_name;
                    var participationTime = participants[participant].certificate_participationTime
                    var validationId = participants[participant].certificate_id

                    var variables = {
                        nome: username,
                        hora: participationTime,
                        id: validationId
                    }
                                 
                    setTimeout(function () {
                        ejs.renderFile("../sinform/certificate.ejs", variables, (err, html) => {
                            if (err) {
                                console.log(err);
                            } else {
                                pdf.create(html, options).toFile("./sinform2021.pdf", (err, res) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(res)
                                    }
                                });
                            }
                        });    
                    }, 10000*1);                                          
                    
                    const email = {
                        from: "CACIC",
                        to: participants[participant].user_email,
                        subject: "Formulario MVTech",
                        text: "Obrigado por participar do evento " + participants[participant].user_name,
                        attachments: [{ // Basta incluir esta chave e listar os anexos
                            filename: 'Certificado_SINFORM2021.pdf', // O nome que aparecerá nos anexos
                            path: './sinform2021.pdf' // O arquivo será lido neste local ao ser enviado
                            }]
                    }
            
                    setTimeout(function () {
                        transporter.sendMail(email, (err, info) => { 
                            console.log("email enviado")
                        })
                    }, 15000*1);   
                    
                }, 20000*participant);
            })(participant);
        }
        return res.status(200).json({msg: "terminou bro"});      
    }
    return { getParticipant }
}