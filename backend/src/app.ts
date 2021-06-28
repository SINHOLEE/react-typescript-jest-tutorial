import {NextFunction, Request, Response} from "express";
import app, {corsCheck, loginMiddleware} from "./middlewares";
import cors from "cors";
import models from "./models";
const {UserService, ProjectService, TokenService, TodoService} = models;

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
app.post("/todos", cors(corsCheck), loginMiddleware, (req: Request, res: Response) => {
	const {content} = req.body;
	const project_id = req.headers["project_id"] as string;
	const todo = TodoService.add(content, project_id);
	if (todo) {
		res.json(todo);
	} else {
		res.status(400).send();
	}
});

app.get("/todos", cors(corsCheck), loginMiddleware, (req: Request, res: Response) => {
	const project_id = req.headers["project_id"] as string;

	const todos = TodoService.getList(project_id);
	res.json(todos);
});
app.patch("/todos/:id", cors(corsCheck), loginMiddleware, (req: Request, res: Response) => {
	const todo_id = req.params.id as string;

	const todos = TodoService.toggle(todo_id);
	res.json(todos);
});

app.get("/projects", cors(corsCheck), loginMiddleware, (req: Request, res: Response) => {
	const tokenId = req.headers["authorization"];
	const user = UserService.getItemByTokenId(tokenId);
	const pList = ProjectService.getListByUser(user);
	res.json(pList);
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
