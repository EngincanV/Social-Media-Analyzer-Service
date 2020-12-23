const jwt = require("jsonwebtoken");
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

module.exports = { getUserId };