import express, {NextFunction, Request, Response} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import models, {gen_uuid} from "./models";
import {Server} from "socket.io";
const {TokenService, UserService, ProjectService} = models;
/**
 * 첫번째 고난: post로 넘긴 body값이 undefined인 문제
 * body-parser 라이브러리를 통해 해결할 수 있었다.
 * 포인트1: import 형식을 사용하고 싶다면 tyconfig에서  로 설정할 것 "esModuleInterop": true,
 * 포인트2: midlleware 등록 시점은 생성직후에 주입하여야 함

*/
const app: express.Application = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(cors({methods: ["GET", "POST", "PATCH", "DELETE"], credentials: true}));

export default app;

export const loginMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const tokenId = req.headers["authorization"];
	const is_logedIn = TokenService.is_loged_in(tokenId);
	if (is_logedIn) {
		next();
	} else {
		res.status(401).send();
	}
};

export type SocketMessage = {
	type: "POST" | "DELETE" | "PATCH";
	id: string;
	user_id: string;
	project_id: string;
	created_at: string;
	checking_users: {user_id: string; checked: boolean}[];
};
export const todoAlertMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const tokenId = req.headers["authorization"];
	const project_id = req.headers["project_id"] as string;
	const io = req.app.get("io") as Server;
	if (!tokenId) throw new Error("no token id in headers");
	if (!io) throw new Error("no io in app");
	if (!project_id) throw new Error("no project_id in request header");
	console.log("========todo middleware==========");
	console.log("req method:", req.method);
	console.log("req path:", req.path);
	console.log("req params:", req.params);
	console.log("req url:", req.url);
	console.log("req query:", req.query);
	console.log("==================================");
	const user = UserService.getItemByTokenId(tokenId);
	const related_users = ProjectService.getRelatedUsersByProjectId(project_id);

	const newMessage: SocketMessage = {
		id: gen_uuid(),
		created_at: Date.now().toLocaleString(),
		type: req.method as SocketMessage["type"],
		project_id,
		user_id: user.id,
		checking_users: related_users.map((user_id) => ({user_id, checked: user_id === user.id})),
	};
	io.to(project_id).emit("ADD_SOCKET_MESSAGE", newMessage);
	next();
};

export const corsCheck = (req, callback) => {
	let corsOptions;
	const acceptList = [
		// ... url list
		"http://localhost:3001",
		"http://10.10.10.56:3001",
	];
	if (acceptList.includes(req.header("Origin"))) {
		corsOptions = {origin: true, credential: true};
	} else {
		corsOptions = {origin: false};
	}
	callback(null, corsOptions);
};
