import React, {FormEvent, useEffect, useState} from "react";

type TodoType = {
	id: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	done: boolean;
	projectId: string;
};
export default function TodoTemplate({token, selectedPjt}: {token: string; selectedPjt: string}) {
	const [todos, setTodos] = useState<TodoType[]>([]);

	return (
		<>
			<TodoInput token={token} selectedPjt={selectedPjt} setTodos={setTodos}></TodoInput>
			<TodoList
				selectedPjt={selectedPjt}
				todos={todos}
				token={token}
				setTodos={setTodos}
			></TodoList>
		</>
	);
}

function TodoInput({
	token,
	selectedPjt,
	setTodos,
}: {
	token: string;
	selectedPjt: string;
	setTodos: React.Dispatch<React.SetStateAction<TodoType[]>>;
}) {
	const [input, setInput] = useState("");
	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		console.log(input);
		const res = await fetch("http://10.10.10.56:5555/todos", {
			method: "POST",
			headers: {
				"Content-type": "application/json",
				project_id: selectedPjt,
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
function Todo({todo}: {todo: TodoType}) {
	return (
		<li>
			<div className="left">
				<div>내용: {todo.content}</div>
				<div>projectId: {todo.projectId}</div>
				<div>최신수정날짜: {todo.updatedAt}</div>
			</div>
			<div className="right" style={{color: todo.done ? "blue" : "red"}}>
				{todo.done ? "수행완료" : "미수행"}
			</div>
		</li>
	);
}

function TodoList({
	token,
	selectedPjt,
	todos,
	setTodos,
}: {
	token: string;
	selectedPjt: string;
	todos: TodoType[];
	setTodos: React.Dispatch<React.SetStateAction<TodoType[]>>;
}) {
	useEffect(() => {
		const asyncFetch = async () => {
			const res = await fetch("http://10.10.10.56:5555/todos", {
				headers: {
					"Content-type": "application/json",
					project_id: selectedPjt,
					authorization: token,
				},
			});
			console.log(res);
			if (res.ok) {
				const data = await res.json();
				setTodos(data);
			}
		};
		if (token && selectedPjt) {
			asyncFetch();
		}
	}, [token, selectedPjt, setTodos]);
	return (
		<ul>
			{todos.map((todo) => (
				<Todo key={todo.id} todo={todo}></Todo>
			))}
		</ul>
	);
}
