const app = require("express")();
const consign = require("consign");

consign()
    .include("./config/middleware.js")
    .then("./api/validator.js")
    .then("./api")
    .then("./config/routes.js")
    .into(app)

app.listen(5000, () =>{
    console.log("Backend executando na porta 5000 （。＾▽＾）")
})