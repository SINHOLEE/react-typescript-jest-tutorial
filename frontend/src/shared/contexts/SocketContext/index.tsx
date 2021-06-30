import {createContext, Dispatch, ReactNode, useContext, useReducer} from "react";
import socketIOClient, {Socket} from "socket.io-client";

const socket = socketIOClient("10.10.10.56:5555", {
	transports: ["websocket"],
});

type SocketState = {
	socket: Socket;
	rooms: Socket[];
	messages: SocketMessage[];
};

export type SocketMessage = {
	type: "POST" | "DELETE" | "PATCH";
	id: string;
	user_id: string;
	project_id: string;
	created_at: string;
	checking_users: {user_id: string; checked: boolean}[];
};

type SocketAction =
	| {type: "ADD_ROOM"; roomName: string}
	| {type: "DEFAULT"}
	| {type: "ADD_MESSAGE"; newMessage: SocketMessage};
type SocketDisaptch = Dispatch<SocketAction>;

function socketReducer(state: SocketState, action: SocketAction): SocketState {
	switch (action.type) {
		case "ADD_ROOM":
			return {...state};
		case "ADD_MESSAGE":
			return {...state, messages: state.messages.concat([action.newMessage])};
		case "DEFAULT":
			return state;
		default:
			throw new Error("socket action error");
	}
}

const initSocketState = {socket, rooms: [], messages: []};

const SocketStateContext = createContext<SocketState>(initSocketState);
const SocketDisaptchContext = createContext<SocketDisaptch>(() => {});

socket.on("server_login", (value: any) => {
	console.log(111111111111, value);
});

export function useSocketMessages() {
	const {messages} = useContext(SocketStateContext);
	if (!messages) throw new Error("no socket messages ");
	return messages;
}

export function useSocketDispatch() {
	const dispatch = useContext(SocketDisaptchContext);
	if (!dispatch) throw new Error("no socketDispatch");
	const addRoom = (roomName: string) => {
		dispatch({type: "ADD_ROOM", roomName});
	};
	const addMessage = (message: SocketMessage) => {
		dispatch({type: "ADD_MESSAGE", newMessage: message});
	};
	return {addMessage};
}

export function useSocket() {
	const {socket} = useContext(SocketStateContext);
	if (!socket) throw new Error("no Socket Context");

	const disconect = () => {
		socket.close();
		console.log("dis");
	};
	const connect = () => {
		socket.connect();

		console.log("socket Active:", socket.active);
	};
	return {disconect, connect, socket};
}

export default function SocketProvider({children}: {children: ReactNode}) {
	const [state, dispatch] = useReducer(socketReducer, initSocketState);

	return (
		<SocketStateContext.Provider value={state}>
			<SocketDisaptchContext.Provider value={dispatch}>
				{children}
			</SocketDisaptchContext.Provider>
		</SocketStateContext.Provider>
	);
}
