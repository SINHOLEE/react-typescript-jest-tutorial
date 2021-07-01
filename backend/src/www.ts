import app from "./app";
import {createServer} from "http";
import {Server, Socket} from "socket.io";
import models from "./models";
import {io} from "socket.io-client";
const {UserService, ProjectService, TokenService, TodoService, SocketMessageService} = models;

const port: number = Number(process.env.PORT) || 5555;

const server = createServer(app);

server.listen(port, () => {
	console.log(`${port}포트 서버 대기 중!`);
});
export const socketIo = new Server(server, {
	transports: ["websocket"],
	cors: {
		origin: "http://localhost:3001",
		methods: ["GET", "POST", "PATCH", "DELETE"],
	},
});

// socket io app에 등록하기

app.set("io", socketIo);
socketIo.on("connection", (socket: Socket) => {
	console.log("================");
	console.log("connected");
	socket.on("INIT_MESSAGES", async (value: {auth_key: string}) => {
		const messages = await SocketMessageService.getList();
		const user = UserService.getItemByTokenId(value.auth_key);

		const filteredMessage = messages
			.filter((message) => user.project_ids.includes(message.project_id))
			.filter((message) => !message.checking_users.some((u) => u.user_id === user.id));

		socket.emit("READ_MESSAGE_RESULT", filteredMessage);
	});

	socket.on("READ_MESSAGES", async (value: {auth_key: string}) => {
		const user = UserService.getItemByTokenId(value.auth_key);

		await SocketMessageService.toggleCheckingUserState(user.id);
		const messages = await SocketMessageService.getList();
		const filteredMessage = messages.filter((message) =>
			user.project_ids.includes(message.project_id),
		);

		user.project_ids.forEach((p_id) =>
			socketIo.to(p_id).emit("READ_MESSAGE_RESULT", filteredMessage),
		);
	});
	socket.on("join_rooms", (value: {auth_key: string}) => {
		const user = UserService.getItemByTokenId(value.auth_key);
		user.project_ids.forEach((pid) => socket.join(pid));
	});
});

export default server;
