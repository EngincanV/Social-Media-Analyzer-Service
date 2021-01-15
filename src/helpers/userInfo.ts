const jwt = require("jsonwebtoken");
import { exception } from "console";
import jwtConfig from "../config/jwt-secret-key";

const getUserId = (token: string): number => {
    if (token) {
        try {
            var decoded = jwt.verify(token, jwtConfig.secretKey);

            return decoded.data.id;

        }
        catch (err) {
           return 0;
        }
    }
    
    return 0;
}

const getUserEmail = (token: string): string => {
    if(token) {
        try {
            var decoded = jwt.verify(token, jwtConfig.secretKey);

            return decoded.data.email;

        } catch (error) {
            throw error;
        }
    }

    throw exception("Bir hata gerçekleşti.")
}

module.exports = { getUserId, getUserEmail };