import passport from 'passport';

/**
 * POST /login
 */
export function login(req, res, next) {
  // Do email and password validation for the server
  passport.authenticate('local', (authErr, user, info) => {
    if (authErr) return next(authErr);
    if (!user) {
      return res.sendStatus(401);
    }
    // Passport exposes a login() function on req (also aliased as
    // logIn()) that can be used to establish a login session
    const user_role = user.user_role;
    return req.logIn(user, (loginErr) => {
      if (loginErr) return res.sendStatus(401);
      return res.status(200).send({ user_role });
    });
  })(req, res, next);
}

/**
 * POST /logout
 */
export function logout(req, res) {
  req.logout();
  res.sendStatus(200);
}


export default {
  login,
  logout,
};
