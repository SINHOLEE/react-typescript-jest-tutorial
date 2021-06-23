import React, {MouseEvent, useEffect, useRef, useState} from "react";
import "./App.css";
type ProjectType = {
	id: string;
	related_users: string[];
};

function ProjectList({token}: {token: string}) {
	const [projects, setProjects] = useState<ProjectType[]>([]);
	useEffect(() => {
		const asyncFetch = async () => {
			const res = await fetch("http://10.10.10.56:5555/projects", {
				headers: {
					"Content-type": "application/json",
					authorization: token,
				},
			});
			console.log(res);
			if (res.ok) {
				const data = await res.json();
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
						<div className="pjt">{`project_id: ${project.id}`}</div>
						{project.related_users.map((user) => (
							<p key={user}>{user}</p>
						))}
					</li>
				))}
		</ul>
	);
}

function App() {
	const [isLogedIn, setIsLogedIn] = useState(false);
	const [token, setToken] = useState<string | undefined>();
	const idRef = useRef<HTMLInputElement | null>(null);
	const pwRef = useRef<HTMLInputElement | null>(null);
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
			setToken(data.auth_key);
			alert("로그인됨");
			setIsLogedIn((flag) => !flag);
		} else {
			alert(res.statusText);
		}
	};
	return (
		<>
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
					}}
				>
					로그아웃
				</button>
			)}
			{token && <ProjectList token={token}></ProjectList>}
		</>
	);
}

export default App;
