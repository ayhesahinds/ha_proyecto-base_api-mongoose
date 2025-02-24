const { expressjwt: checkJwt } = require("express-jwt");

function checkAuth(req, res, next) {
  checkJwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] })(req, res, (error) => {
    if (!req.auth) {
      return res.json({ msg: "Please, login" });
    }
    return next();
  });
}

module.exports = { checkAuth };
