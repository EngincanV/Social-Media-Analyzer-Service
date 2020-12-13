import express from 'express';
import createError from "http-errors";
import cookieParser from "cookie-parser";
import compression from "compression";
import accountRouter from "./routes/account";
import verifyToken from "./middlewares/verify-token";

const app = express();
const PORT: number = 3000;

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Bearer Authorization
app.use("/api", verifyToken);

app.get("/account", accountRouter);

//catch 404 and forward to error handler 
app.use((req, res, next) => {
    next(createError(404));
});

app.listen(PORT);

export default app;