import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwt-secret-key";

const verifyToken = (req: any, res: any, next: any) => {
    const token = req.headers['authorization'];

    if(token) {
        jwt.verify(token, jwtConfig.secretKey, (err: any, decoded: any) => {
            if(err) {
                res.json({
                    status: false,
                    message: 'Failed to authenticate token'
                });
            }
            else {
                //payload
                req.decode = decoded;
                next();
            }
        });
    }
    else {
        res.json({
            status: false,
            message: 'No token provided.'
        });
    }
};

export default verifyToken;