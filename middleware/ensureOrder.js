function ensureOrder(requiredState) {
  return (req, res, next) => {
    if (req.session.user && req.session.user.state === requiredState) {
      next();
    } else {
      return res.status(400).send(`Complete ${requiredState} step to continue`);
    }
  };
}

module.exports = ensureOrder;
