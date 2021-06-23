import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
/**
 * 첫번째 고난: post로 넘긴 body값이 undefined인 문제
 * body-parser 라이브러리를 통해 해결할 수 있었다.
 * 포인트1: import 형식을 사용하고 싶다면 tyconfig에서  로 설정할 것 "esModuleInterop": true,
 * 포인트2: midlleware 등록 시점은 생성직후에 주입하여야 함

*/
const app: express.Application = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(cors({method: ["GET", "POST"], credentials: true}));

app.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {
	res.send("hello asdeaasds sess!");
});

export default app;

// const express = require("express");
// const app = express();
// const port = 5000;

const gen_uuid = (): string => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};
type UserType = {
	id: string;
	username: string;
	password: string;
	project_ids: string[];
};
const users: UserType[] = [
	{
		id: "user_1",
		username: "dltlsgh5@naver.com",
		password: "TLSgh!@3",
		project_ids: ["project_1"],
	},
	{
		id: "user_2",
		username: "another@gmail.com",
		password: "TLSgh!@3",
		project_ids: [],
	},
	{
		id: "user_3",
		username: "dltlsgh5@kinx.net",
		password: "TLSgh!@3",
		project_ids: ["project_1"],
	},
	{
		id: "user_4",
		username: "1",
		password: "1",
		project_ids: ["project_1"],
	},
];
type TokenType = {
	id: string;
	/**
	 * auth_key ===token_id
	 */
	token_id: string;
	is_deleted: boolean;
	userId: string;
};

const tokens: TokenType[] = [];

type ProjectType = {
	id: string;
	related_users: string[];
};

const projects: ProjectType[] = [{id: "project_1", related_users: ["user_1", "user_3", "user_4"]}];

const is_loged_in = (tokenId: string): boolean => {
	return !!tokens.find((t) => t.token_id === tokenId);
};
// var myLogger = function (req, res, next) {
// 	// console.log({req});
// 	// req.aaa = Date.now();
// 	// console.log(`logger: ${req.aaa}`);
// 	next();
// };

// app.use(myLogger);
/**
 * req.body에서 텍스트로 출력되는 현상이 나타남
 * 그 이유는 content-type 헤더에 application/x-www-form-urlencoded 설정을 했기 때문
 * 나중에 content-type에 따른 parser전략이 어떻게 바뀌는지 파악해야 겠음
 */

const tokenRepository = {
	getByTokenId: (tokenId: string) => {
		return tokens.find((token) => token.token_id === tokenId);
	},
	addUser: (user: UserType): TokenType => {
		const newToken = {id: gen_uuid(), is_deleted: false, token_id: gen_uuid(), userId: user.id};
		tokens.push(newToken);
		return newToken;
	},
	has: (token: string): boolean => {
		return !!tokens.find((t) => token === t.token_id);
	},
};

type SuccessProps<T> = {
	res: "ok";
	data: T;
};

type FailProps = {
	res: "fail";
	message: string;
};
type ServiceProps<T> = SuccessProps<T> | FailProps;

const UserRepository = {
	getById: (id: string): UserType => {
		const user = users.find((user) => user.id === id);
		if (user) {
			return user;
		}
		throw new Error(`user DB has no element by userId ${id}`);
	},
	getByUsernameAndPassword: (username: string, password: string): UserType => {
		const user = users.find((user) => user.password === password && user.username === username);
		if (user) {
			return user;
		}
		throw new Error(`해당 계정이 없습니다.`);
	},
};
const getProjects = (userId: string): ProjectType[] => {
	const plist = projects.filter((p) => p.related_users.some((uid) => uid === userId));
	console.log({plist});
	return plist;
};
const UserService = {
	getByTokenId: (tokenId: string) => {
		const token = tokenRepository.getByTokenId(tokenId);
		return UserRepository.getById(token.userId);
	},
	login: ({
		username,
		password,
	}: {
		username: string;
		password: string;
	}): ServiceProps<{auth_key: string} & {user: UserType}> => {
		try {
			const user = UserRepository.getByUsernameAndPassword(username, password);
			const token = tokenRepository.addUser(user);
			return {
				res: "ok",
				data: {
					user,
					auth_key: token.token_id,
				},
			};
		} catch (e) {
			console.dir(e.message);
			return {
				res: "fail",
				message: "계정 혹은 비밀번호가 잘못되었습니다.",
			};
		}
	},
};
app.post("/login", cors(corsCheck), (req: express.Request, res: express.Response) => {
	const login = UserService.login({...req.body});
	if (login.res === "ok") {
		res.json({auth_key: login.data.auth_key});
		return;
	}
	res.status(401).send();
});
app.get("/projects", cors(corsCheck), (req: express.Request, res: express.Response) => {
	const tokenId = req.headers["authorization"];
	const is_logedIn = is_loged_in(tokenId);
	if (is_logedIn) {
		const userId = UserService.getByTokenId(tokenId).id;
		const pList = getProjects(userId);
		console.log(pList);
		res.json(pList);
	}
});

app.get("/tokens", (req: express.Request, res: express.Response) => {
	res.json(tokens);
});

// app.get("/", (req, res) => {
// 	res.json({aaa: req.aaa ?? "asd"});
// });

// app.listen(port, () => {
// 	console.log(`Example app listening at http://localhost:${port}`);
// });

function corsCheck(req, callback) {
	let corsOptions;
	const acceptList = [
		// ... url list
		"http://localhost:3002",
		"http://10.10.10.56:3002",
	];
	if (acceptList.includes(req.header("Origin"))) {
		corsOptions = {origin: true, credential: true};
	} else {
		corsOptions = {origin: false};
	}
	callback(null, corsOptions);
}
