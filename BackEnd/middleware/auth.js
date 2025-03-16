const jwt = require('jsonwebtoken');

mudule.exports = (req, res, next) => {
  try {
    const token =  req.headers.authentification.split('')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId
    };

  } catch(error) {
    res.status(401).json({ error });
  }

};
