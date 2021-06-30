import app from "./app";
import {createServer} from "http";
import {Server, Socket} from "socket.io";
import models from "./models";
const {UserService, ProjectService, TokenService, TodoService} = models;

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
	console.log("socket:", socket.rooms);
	// console.log("socketIo: ", socketIo.sockets);
	socket.emit("initClient", {hi: `hi i am ${socket.id}`});
	socket.emit("initClient", {hi: `hi222 i am ${socket.id}`});
	socket.on("initClient", (value: any) => {
		console.log("initClient: ", value);
	});
	socket.on("send message", (item: any) => {
		console.log(item);
		console.log(socket.id);
		// socket.emit('respnse message',{message:`id: ${socket.id}`, })
	});

	socket.on("join_rooms", (value: {auth_key: string}) => {
		console.log({value});
		console.log("rooms: ", socket.rooms);
		const user = UserService.getItemByTokenId(value.auth_key);
		user.project_ids.forEach((pid) => socket.join(pid));
		console.log("rooms: ", socket.rooms);
	});
});

export default server;
