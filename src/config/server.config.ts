import express, { Application } from "express";
import cors from "cors";
import router from "../routes/server.routes";

export const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router);