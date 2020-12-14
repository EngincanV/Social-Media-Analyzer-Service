const express = require("express");
const createError = require("http-errors") ;
const cookieParser = require("cookie-parser");
const compression = require("compression");
const verifyToken = require("./middlewares/verify-token");

//routes
const accountRouter = require("./routes/account");
const instagramRouter = require("./routes/instagram");

const app: any = express();
const PORT: number = 3000;

const expressSwagger = require("express-swagger-generator")(app);
const swaggerOptions = require("./config/swaggerconfig");

//swagger documentation
expressSwagger(swaggerOptions);

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Bearer Authorization
app.use("/api", verifyToken);

app.use("/account", accountRouter);
app.use("/api/instagram", instagramRouter);

//catch 404 and forward to error handler 
app.use((req: any, res: any, next: any) => {
    next(createError(404));
});

app.listen(PORT);

export default app;