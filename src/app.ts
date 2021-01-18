const express = require("express");
const createError = require("http-errors") ;
const cookieParser = require("cookie-parser");
const compression = require("compression");
const verifyToken = require("./middlewares/verify-token");
const cors = require("cors");

//routes
const accountRouter = require("./routes/account");
const instagramRouter = require("./routes/instagram");
const hintRouter = require("./routes/hints");
const feedbackRouter = require("./routes/feedback");
const personalInfoRouter = require("./routes/personalInfo");
const statsRouter = require("./routes/stats");

const getRawBody = require("raw-body");

const app: any = express();
const PORT: number = 3000;

const expressSwagger = require("express-swagger-generator")(app);
const swaggerOptions = require("./config/swaggerconfig");

//swagger documentation
expressSwagger(swaggerOptions);

app.use(cors());
app.use(compression());

app.use(function (req: any, res: any, next: any) {
    getRawBody(req, {
        length: req.headers['content-length'],
        limit: '50mb'
    }, function (err: any, string: any) {
        if(err) return next(err);

        req.text = string;
        next();
    })
});

app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Authorization Middleware
app.use("/api", verifyToken);

app.use("/", hintRouter);
app.use("/account", accountRouter);
app.use("/api/instagram", instagramRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/personal-info", personalInfoRouter);
app.use("/api/stats", statsRouter);

//catch 404 and forward to error handler 
app.use((req: any, res: any, next: any) => {
    next(createError(404));
});

app.listen(PORT);

export default app;