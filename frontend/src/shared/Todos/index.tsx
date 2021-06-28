import {fetchAPI, useFetch} from "client/utils";
import React, {FormEvent, useEffect, useState} from "react";
import {useProjectSelectState} from "shared/contexts/ProjectSelectContext";
import {useTokenState} from "shared/contexts/TokenContenxt";

type TodoType = {
	id: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	done: boolean;
	projectId: string;
};
export default function TodoTemplate() {
	const [todos, setTodos] = useState<TodoType[]>([]);

	return (
		<>
			<TodoInput setTodos={setTodos}></TodoInput>
			<TodoList todos={todos} setTodos={setTodos}></TodoList>
		</>
	);
}

function TodoInput({setTodos}: {setTodos: React.Dispatch<React.SetStateAction<TodoType[]>>}) {
	const {token} = useTokenState();
	const {projectId} = useProjectSelectState();

	const [input, setInput] = useState("");
	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		console.log(input);
		const res = await fetch("http://localhost:5555/todos", {
			method: "POST",
			headers: {
				"Content-type": "application/json",
				project_id: projectId,
				authorization: token,
			},
			body: JSON.stringify({
				content: input,
			}),
		});
		const todo = await res.json();
		if (res.ok) {
			setInput("");
			setTodos((todos) => [...todos, todo]);
		} else {
			alert(res.statusText);
		}
	};
	return (
		<div>
			<input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
			<button onClick={handleSubmit}>생성</button>
		</div>
	);
}
function Todo({
	todo,
	setTodos,
}: {
	todo: TodoType;
	setTodos: React.Dispatch<React.SetStateAction<TodoType[]>>;
}) {
	const {token} = useTokenState();
	const handleToggle = async (event: FormEvent) => {
		event.preventDefault();
		const res = await fetch(`http://localhost:5555/todos/${todo.id}`, {
			method: "PATCH",
			headers: {
				"Content-type": "application/json",
				project_id: todo.projectId,
				authorization: token,
			},
		});
		const todoId = await res.json();
		if (res.ok) {
			setTodos((todos) => todos.map((t) => (t.id === todoId ? {...t, done: !t.done} : t)));
		} else {
			alert(res.statusText);
		}
	};
	return (
		<li>
			<div className="left">
				<div>todoId: {todo.id}</div>
				<div>내용: {todo.content}</div>
				<div>projectId: {todo.projectId}</div>
				<div>최신수정날짜: {todo.updatedAt}</div>
			</div>
			<div
				className="right"
				style={{color: todo.done ? "blue" : "red", cursor: "pointer"}}
				onClick={handleToggle}
			>
				{todo.done ? "수행완료" : "미수행"}
			</div>
		</li>
	);
}

function TodoList({
	todos,
	setTodos,
}: {
	todos: TodoType[];
	setTodos: React.Dispatch<React.SetStateAction<TodoType[]>>;
}) {
	const {projectId} = useProjectSelectState();
	const {token} = useTokenState();
	useEffect(() => {
		const asyncFetch = async () => {
			const res = await fetch("http://localhost:5555/todos", {
				headers: {
					"Content-type": "application/json",
					project_id: projectId,
					authorization: token,
				},
			});
			console.log(res);
			if (res.ok) {
				const data = await res.json();
				setTodos(data);
			}
		};
		if (token && projectId) {
			asyncFetch();
		}
	}, [token, projectId, setTodos]);
	return (
		<ul>
			{todos.map((todo) => (
				<Todo key={todo.id} todo={todo} setTodos={setTodos}></Todo>
			))}
		</ul>
	);
}
