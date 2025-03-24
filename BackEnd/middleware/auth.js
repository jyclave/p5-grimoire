// const jwt = require('jsonwebtoken');


// module.exports = (req, res, next) => {
//   try {
//       const token = req.headers.authorization.split(' ')[1];
//       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
//       const userId = decodedToken.userId;
//       req.auth = {
//           userId: userId
//       };
//    next();
//   } catch(error) {
//       res.status(401).json({ error });
//   }
// };

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Authentification requise" });
    }
    
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    
    req.auth = {
      userId: userId
    };
    
    next();
  } catch(error) {
    // Message d'erreur générique
    res.status(401).json({ message: "Requête non authentifiée" });
  }
};
