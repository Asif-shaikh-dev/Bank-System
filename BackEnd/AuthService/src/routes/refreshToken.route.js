import express from "express";
import { refreshAccessToken } from "../controllers/auth.controller.js";
const refreshTokenRouter = express.Router();


refreshTokenRouter.post("/", refreshAccessToken);


export default refreshTokenRouter;