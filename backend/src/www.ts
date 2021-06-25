import app from "./app";
import {createServer} from "http";
import {Server, Socket} from "socket.io";

const port: number = Number(process.env.PORT) || 5555;

const server = createServer(app);
const socketIo = new Server(server, {
	cors: {
		origin: "http://localhost:3001",
		methods: ["GET", "POST", "PATCH"],
	},
});
socketIo.on("connection", (socket: Socket) => {
	console.log("================");
	console.log("connected");
	console.log(socket.id);

	socket.on("send message", (item: any) => {
		console.log(item);
		console.log(socket.id);
		// socket.emit('respnse message',{message:`id: ${socket.id}`, })
	});
});

server.listen(port, () => {
	console.log(`${port}포트 서버 대기 중!`);
});

export default server;
