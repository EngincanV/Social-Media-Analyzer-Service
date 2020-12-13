import express from 'express';
import createError from "http-errors";
import cookieParser from "cookie-parser";
import compression from "compression";

const app = express();

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Hello World");
});

//catch 404 and forward to error handler 
app.use((req, res, next) => {
    next(createError(404));
});

export default app;