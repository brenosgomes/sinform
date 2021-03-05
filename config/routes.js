module.exports = app => {
    app.route("/user")
      .get(app.api.user.get)
      .post(app.api.user.post)

    app.route("/user/:id")
      .get(app.api.user.getById)
      .put(app.api.user.put)
      .delete(app.api.user.remove)

    app.route("/userEvent")
      .get(app.api.userEvent.get)
      .post(app.api.userEvent.post)
      .put(app.api.userEvent.put)

    app.route("/userEvent/:id")
      .get(app.api.userEvent.getById)
      .delete(app.api.userEvent.remove)

    app.route("/forgotPassword")
      .post(app.api.redefinePassword.forgotPassword)

    app.route("/resetPassword/:token")
      .put(app.api.redefinePassword.resetPassword)

    app.route("/signin").post(app.api.userAuth.signIn)
    app.route("/validateToken").post(app.api.userAuth.validateToken)
      
}