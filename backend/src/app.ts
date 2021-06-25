import {NextFunction, Request, Response} from "express";
import app, {corsCheck} from "./middlewares";
import cors from "cors";
import models from "./models";
// const express = require("express");
// const app = express();
// const port = 5000;
const {UserService, ProjectService, TokenService} = models;

app.get("/", (req: Request, res: Response, next: NextFunction) => {
	res.send("hello asdeaasds sess!");
});

app.post("/login", cors(corsCheck), (req: Request, res: Response) => {
	const login = UserService.login({...req.body});
	if (login.res === "ok") {
		res.json({auth_key: login.data.auth_key});
		return;
	}
	res.status(401).send();
});
app.get("/projects", cors(corsCheck), (req: Request, res: Response) => {
	const tokenId = req.headers["authorization"];
	const is_logedIn = TokenService.is_loged_in(tokenId);
	if (is_logedIn) {
		const user = UserService.getItemByTokenId(tokenId);
		const pList = ProjectService.getListByUser(user);
		console.log(pList);
		res.json(pList);
	}
});

app.get("/tokens", (req: Request, res: Response) => {
	res.json(TokenService.getList());
});

// app.get("/", (req, res) => {
// 	res.json({aaa: req.aaa ?? "asd"});
// });

// app.listen(port, () => {
// 	console.log(`Example app listening at http://localhost:${port}`);
// });

export default app;
