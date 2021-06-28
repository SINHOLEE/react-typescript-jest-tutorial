import React, {MouseEvent, useEffect, useRef, useState} from "react";
import socketIOClient, {Socket} from "socket.io-client";
import TodoTemplate from "shared/Todos";
import "./App.css";
import {Route, useHistory} from "react-router";
import ColorCompoent from "shared/ColorComponent";
import {Link} from "react-router-dom";
import {TokenProvider, useTokenDispatch, useTokenState} from "./contexts/TokenContenxt";
import {
	ProjectSelectProvider,
	useProjectSelectDispatch,
	useProjectSelectState,
} from "./contexts/ProjectSelectContext";
import {fetchAPI, useFetch} from "client/utils";

type ProjectType = {
	id: string;
	related_users: string[];
};

function ProjectList() {
	const {token} = useTokenState();
	const {setProjectId} = useProjectSelectDispatch();
	const {projectId} = useProjectSelectState();

	const {
		data: projects,
		error,
		isLoading,
	} = useFetch<ProjectType[] | undefined>(async () =>
		fetchAPI("http://localhost:5555/projects", token),
	);
	return (
		<>
			{error && <h1>에러발생!!</h1>}
			{isLoading && <h2>프로젝트 로딩중</h2>}
			{projectId && <div>{projectId}</div>}
			{projects && (
				<ul>
					{projects.map((project, idx) => (
						<li key={project.id}>
							<div className="pjt">
								<span>{`project_id: ${project.id}`}</span>
								<button onClick={() => setProjectId(project.id)}>선택</button>
							</div>
							{project.related_users.map((user) => (
								<p key={user}>{user}</p>
							))}
						</li>
					))}
				</ul>
			)}
		</>
	);
}

function LoginPage({socket}: {socket: Socket}) {
	const {resetProjectId} = useProjectSelectDispatch();
	const {isLogedIn, token} = useTokenState();
	const {login, logout} = useTokenDispatch();
	const idRef = useRef<HTMLInputElement | null>(null);
	const pwRef = useRef<HTMLInputElement | null>(null);
	const history = useHistory();
	const handleSubmit = async (event: MouseEvent) => {
		event.preventDefault();
		const res = await fetch("http://localhost:5555/login/", {
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
			socket.emit("send message", {
				message: "로그인 ok",
				tokenId: data.auth_key,
			});
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
const liStyle = {
	marginRight: 20,
};

function Menu() {
	const {isLogedIn} = useTokenState();
	const {resetProjectId} = useProjectSelectDispatch();

	const {logout} = useTokenDispatch();
	return (
		<ul style={{display: "flex", justifyContent: "flex-start", marginRight: 30}}>
			{isLogedIn ? (
				<li
					style={{...liStyle}}
					onClick={() => {
						logout();
						resetProjectId();
					}}
				>
					<Link to="/">logout</Link>
				</li>
			) : (
				<li style={{...liStyle}}>
					<Link to="/">login</Link>
				</li>
			)}
			<li style={{...liStyle}}>
				<Link to="/color">color</Link>
			</li>
			{isLogedIn && (
				<>
					<li style={{...liStyle}}>
						<Link to="/projects">pojects</Link>
					</li>
					<li style={{...liStyle}}>
						<Link to="/todos">todos</Link>
					</li>
				</>
			)}
		</ul>
	);
}

function State() {
	const {projectId} = useProjectSelectState();
	const {token, isLogedIn} = useTokenState();

	return (
		<div>
			<h2>state</h2>
			<div>{`project id: ${projectId ? projectId : "선택 ㄴ"}`}</div>
			<div>{`token id: ${token ? token : "선택 ㄴ"}`}</div>
			<div>{`is loged in: ${isLogedIn ? "로그인 함" : "로그인 안함"}`}</div>
		</div>
	);
}

function App() {
	const socket = socketIOClient("localhost:5555");
	console.log(socket);
	return (
		<>
			<TokenProvider>
				<ProjectSelectProvider>
					<Menu></Menu>
					<div style={{display: "flex", padding: 10}}>
						<div style={{border: "1px solid black", marginRight: 10}}>
							<State></State>
						</div>
						<aside style={{border: "1px solid black", marginRight: 10}}>
							오른편에 알람 보여주기
						</aside>
					</div>
					<Route path="/" exact component={() => <LoginPage socket={socket} />}></Route>
					<Route path="/color" component={ColorCompoent}></Route>
					<Route path="/projects" component={ProjectList}></Route>
					<Route path="/todos" component={TodoTemplate}></Route>
				</ProjectSelectProvider>
			</TokenProvider>
		</>
	);
}

export default App;
