import {MouseEvent, useEffect, useRef} from "react";
import {useHistory} from "react-router-dom";
import {useProjectSelectDispatch} from "shared/contexts/ProjectSelectContext";
import {useSocket} from "shared/contexts/SocketContext";
import {useTokenDispatch, useTokenState} from "shared/contexts/TokenContenxt";

export default function LoginPage() {
	const {socket, connect} = useSocket();
	const {resetProjectId} = useProjectSelectDispatch();
	const {isLogedIn, token} = useTokenState();
	const {login, logout} = useTokenDispatch();
	const idRef = useRef<HTMLInputElement | null>(null);
	const pwRef = useRef<HTMLInputElement | null>(null);
	const history = useHistory();
	useEffect(() => {
		connect();
	}, [connect]);
	const handleSubmit = async (event: MouseEvent) => {
		event.preventDefault();
		const res = await fetch("http://10.10.10.56:5555/login/", {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				username: idRef.current?.value,
				password: pwRef.current?.value,
			}),
		});
		if (res.ok) {
			console.log(res.body);
			const data = await res.json();
			login(data.auth_key);
			alert("로그인됨");

			socket.emit("join_rooms", data);
			history.push("/projects");
		} else {
			alert(res.statusText);
		}
	};
	return (
		<>
			<div className="token">{`token: ${token}`}</div>
			{!isLogedIn ? (
				<>
					<div>로그인 폼</div>
					<div className="form">
						<input type="text" ref={idRef} className="id" />
						<input type="text" ref={pwRef} className="password" />
						<button type="submit" onClick={handleSubmit}>
							로그인
						</button>
					</div>
				</>
			) : (
				<button
					onClick={() => {
						logout();
						resetProjectId();
					}}
				>
					로그아웃
				</button>
			)}
		</>
	);
}
