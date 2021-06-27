import React, {
	createContext,
	MouseEvent,
	useEffect,
	useRef,
	useState,
} from 'react';
import socketIOClient, { Socket } from 'socket.io-client';
import TodoTemplate from 'shared/Todos';
import './App.css';
import { Route, useHistory } from 'react-router';
import ColorCompoent from 'shared/ColorComponent';

type ProjectType = {
	id: string;
	related_users: string[];
};

function ProjectList({
	token,
	setSelectedPjt,
}: {
	token: string;
	setSelectedPjt: (pjtId: string) => void;
}) {
	const [projects, setProjects] = useState<ProjectType[]>([]);

	useEffect(() => {
		const asyncFetch = async () => {
			const res = await fetch('http://localhost:5555/projects', {
				headers: {
					'Content-type': 'application/json',
					authorization: token,
				},
			});
			if (res.ok) {
				const data = await res.json();
				console.log(data);
				setProjects(data);
			}
		};
		if (token) {
			asyncFetch();
		}
	}, [token]);
	return (
		<ul>
			{projects &&
				projects.map((project, idx) => (
					<li key={project.id}>
						<div className="pjt">
							<span>{`project_id: ${project.id}`}</span>
							<button onClick={() => setSelectedPjt(project.id)}>선택</button>
						</div>
						{project.related_users.map((user) => (
							<p key={user}>{user}</p>
						))}
					</li>
				))}
		</ul>
	);
}
function LoginPage({ socket }: { socket: Socket }) {
	const [selectedPjt, setSelectedPjt] = useState('');
	const [isLogedIn, setIsLogedIn] = useState(false);
	const [token, setToken] = useState<string | undefined>();
	const idRef = useRef<HTMLInputElement | null>(null);
	const pwRef = useRef<HTMLInputElement | null>(null);
	const history = useHistory();
	const handleSubmit = async (event: MouseEvent) => {
		event.preventDefault();
		const res = await fetch('http://localhost:5555/login/', {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
			},
			body: JSON.stringify({
				username: idRef.current?.value,
				password: pwRef.current?.value,
			}),
		});
		if (res.ok) {
			console.log(res.body);
			const data = await res.json();
			setToken(data.auth_key);
			alert('로그인됨');
			setIsLogedIn((flag) => !flag);
			socket.emit('send message', {
				message: '로그인 ok',
				tokenId: data.auth_key,
			});
			history.push('/projects');
		} else {
			alert(res.statusText);
		}
	};
	return (
		<>
			<ColorCompoent></ColorCompoent>
			<div className="token">{`token: ${token}`}</div>
			{!isLogedIn ? (
				<>
					<div>로그인 되었다 치고,</div>
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
						setIsLogedIn(false);
						setToken(undefined);
						setSelectedPjt('');
					}}
				>
					로그아웃
				</button>
			)}
			<Route
				path="/projects"
				component={() =>
					token ? (
						<ProjectList
							token={token}
							setSelectedPjt={setSelectedPjt}
						></ProjectList>
					) : null
				}
			></Route>
			<div>{`slected project: ${
				selectedPjt === '' ? '선택된 프로젝트 없음' : selectedPjt
			}`}</div>
			{token && selectedPjt && (
				<TodoTemplate token={token} selectedPjt={selectedPjt}></TodoTemplate>
			)}
		</>
	);
}
const tokenContext = createContext('');
function App() {
	const socket = socketIOClient('localhost:5555');
	return (
		<>
			<Route path="/" component={() => <LoginPage socket={socket} />}></Route>
		</>
	);
}

export default App;
