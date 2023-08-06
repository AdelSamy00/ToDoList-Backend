import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

const validateToken = (req, res, next) => {
  const accessToken = req.cookies['token'];
  //console.log(accessToken);
  if (!accessToken)
    return res.status(400).json({ error: 'User not Authenticated!' });
  try {
    const validToken = jwt.verify(accessToken, jwtSecret);
    //console.log(validToken);
    if (validToken) {
      req.authenticated = true;
      res.status(200).json({ userId: validToken.id });
      return next();
    }
  } catch (err) {
    return res.status(400).json({ error: 'err' });
  }
};
export default validateToken;
