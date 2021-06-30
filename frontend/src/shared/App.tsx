import {useEffect, useState} from "react";
import TodoTemplate from "shared/Todos";
import "./App.css";
import {Route} from "react-router";
import ColorCompoent from "shared/ColorComponent";
import {TokenProvider, useTokenState} from "./contexts/TokenContenxt";
import {
	ProjectSelectProvider,
	useProjectSelectDispatch,
	useProjectSelectState,
} from "./contexts/ProjectSelectContext";
import {fetchAPI, useFetch} from "client/utils";
import SocketProvider, {
	SocketMessage,
	useSocket,
	useSocketDispatch,
	useSocketMessages,
} from "shared/contexts/SocketContext";
import LoginPage from "shared/LoginPage";
import Menu from "shared/MenuComponent";
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
	} = useFetch<ProjectType>(async () => fetchAPI("http://10.10.10.56:5555/projects", token));

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

function Alret() {
	const {socket} = useSocket();
	const messages = useSocketMessages();
	const {addMessage} = useSocketDispatch();
	useEffect(() => {
		socket.on("ADD_SOCKET_MESSAGE", (message: SocketMessage) => {
			addMessage(message);
		});
	}, []);

	return (
		<div style={{display: "flex", padding: 10}}>
			<div style={{border: "1px solid black", marginRight: 10}}>
				<State></State>
			</div>
			<aside style={{border: "1px solid black", marginRight: 10}}>
				오른편에 알람 보여주기
				<ul>
					{messages.map((message) => (
						<li key={message.id}>
							{`type: ${message.type} created_at: ${message.created_at} userid: ${message.user_id} `}
							{message.checking_users.map((item, index) => (
								<div key={index}>
									<span>{item.checked}</span>
									<span>{item.user_id}</span>
								</div>
							))}
						</li>
					))}
				</ul>
			</aside>
		</div>
	);
}

function App() {
	return (
		<>
			<SocketProvider>
				<TokenProvider>
					<ProjectSelectProvider>
						<Menu></Menu>
						<Alret></Alret>
						<Route path="/" exact component={() => <LoginPage />}></Route>
						<Route path="/color" component={ColorCompoent}></Route>
						<Route path="/projects" component={ProjectList}></Route>
						<Route path="/todos" component={TodoTemplate}></Route>
					</ProjectSelectProvider>
				</TokenProvider>
			</SocketProvider>
		</>
	);
}

export default App;
