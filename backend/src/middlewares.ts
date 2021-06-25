import express, {NextFunction, Request, Response} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import models from "./models";
const {TokenService} = models;
/**
 * 첫번째 고난: post로 넘긴 body값이 undefined인 문제
 * body-parser 라이브러리를 통해 해결할 수 있었다.
 * 포인트1: import 형식을 사용하고 싶다면 tyconfig에서  로 설정할 것 "esModuleInterop": true,
 * 포인트2: midlleware 등록 시점은 생성직후에 주입하여야 함

*/
const app: express.Application = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(cors({methods: ["GET", "POST", "PATCH"], credentials: true}));

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
