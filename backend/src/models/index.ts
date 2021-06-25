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
	getItem: (tokenId: string) => {
		return tokens.find((token) => token.token_id === tokenId);
	},
	add: (user: UserType): TokenType => {
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
	getItemByUserId: (id: string): UserType => {
		const user = users.find((user) => user.id === id);
		if (user) {
			return user;
		}
		throw new Error(`user DB has no element by userId ${id}`);
	},
	getUserByUsernameAndPassword: (username: string, password: string): UserType => {
		const user = users.find((user) => user.password === password && user.username === username);
		if (user) {
			return user;
		}
		throw new Error(`해당 계정이 없습니다.`);
	},
};
const ProjectService = {
	getListByUser: (user: UserType): ProjectType[] => {
		const plist = projects.filter((p) => p.related_users.some((uid) => uid === user.id));
		console.log({plist});
		return plist;
	},
};

const TokenService = {
	getList: () => {
		return tokens.slice();
	},
	is_loged_in: (tokenId: string): boolean => {
		return !!tokens.find((t) => t.token_id === tokenId);
	},
};

const UserService = {
	getItemByTokenId: (tokenId: string) => {
		const token = tokenRepository.getItem(tokenId);
		return UserRepository.getItemByUserId(token.userId);
	},
	login: ({
		username,
		password,
	}: {
		username: string;
		password: string;
	}): ServiceProps<{auth_key: string} & {user: UserType}> => {
		try {
			const user = UserRepository.getUserByUsernameAndPassword(username, password);
			const token = tokenRepository.add(user);
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

export default {
	ProjectService,
	UserService,
	TokenService,
};
