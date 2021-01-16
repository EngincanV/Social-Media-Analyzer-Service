const jwt = require("jsonwebtoken");

import jwtConfig from "../config/jwt-secret-key";

const verifyToken = (req: any, res: any, next: any) => {
    const token: string = req.headers['authorization'];

    if(token) {
        jwt.verify(token, jwtConfig.secretKey, (err: any, decoded: any) => {
            if(err) {
                res.json({
                    success: false,
                    message: 'Token doğrulanırken bir hata meydana geldi.'
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
            success: false,
            message: 'Token bulunamadı. Ilgili servislere erişebilmek için lütfen giriş yapın.'
        });
    }
};

module.exports = verifyToken;