import {fetchAPI, useFetch} from "client/utils";
import React, {FormEvent, useRef, useState} from "react";
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
	const {token} = useTokenState();
	const {projectId} = useProjectSelectState();

	const {
		data: todos,
		error,
		isLoading,
		addItem: addTodo,
		toggle: toggleTodo,
		remove: removeTodo,
	} = useFetch<TodoType>(async () => fetchAPI("http://10.10.10.56:5555/todos", token, projectId));

	return (
		<>
			<TodoInput isLoading={isLoading} addTodo={addTodo}></TodoInput>
			<TodoList
				toggleTodo={toggleTodo}
				todos={todos}
				isLoading={isLoading}
				error={error}
				removeTodo={removeTodo}
			></TodoList>
		</>
	);
}

interface ITodoInput {
	isLoading: boolean;
	addTodo: (item: TodoType) => void;
}

function TodoInput({isLoading, addTodo}: ITodoInput) {
	const {token} = useTokenState();
	const {projectId} = useProjectSelectState();
	const [input, setInput] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const handleSubmit = async (event: FormEvent) => {
		if (isLoading) return;
		if (!input) return;
		event.preventDefault();
		console.log(input);
		const res = await fetch("http://10.10.10.56:5555/todos", {
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
			addTodo(todo);
			inputRef.current?.focus();
		} else {
			alert(res.statusText);
		}
	};
	return (
		<div>
			<input
				ref={inputRef}
				type="text"
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyPress={(e) => (e.key === "Enter" ? handleSubmit(e) : null)}
			/>
			<button onClick={handleSubmit}>생성</button>
		</div>
	);
}
function Todo({
	todo,
	toggleTodo,
	removeTodo,
}: {
	todo: TodoType;
	toggleTodo: (toggleMapFn: (item: TodoType) => TodoType) => void;
	removeTodo: (removeFilterFn: (item: TodoType) => boolean) => void;
}) {
	const {token} = useTokenState();

	const handleToggle = async (event: FormEvent) => {
		event.preventDefault();
		const res = await fetch(`http://10.10.10.56:5555/todos/${todo.id}`, {
			method: "PATCH",
			headers: {
				"Content-type": "application/json",
				project_id: todo.projectId,
				authorization: token,
			},
		});
		const todoId = await res.json();
		if (res.ok) {
			toggleTodo((currentTodo) =>
				currentTodo.id === todoId ? {...currentTodo, done: !currentTodo.done} : currentTodo,
			);
		} else {
			alert(res.statusText);
		}
	};
	const handleDelete = async (event: FormEvent) => {
		event.preventDefault();
		const res = await fetch(`http://10.10.10.56:5555/todos/${todo.id}`, {
			method: "DELETE",
			headers: {
				"Content-type": "application/json",
				project_id: todo.projectId,
				authorization: token,
			},
		});
		await res.json();
		if (res.ok) {
			removeTodo((currentTodo) => currentTodo.id !== todo.id);
		} else {
			alert(res.statusText);
		}
	};
	return (
		<li style={{display: "flex"}}>
			<div className="left">
				<div>todoId: {todo.id}</div>
				<div>내용: {todo.content}</div>
				<div>projectId: {todo.projectId}</div>
				<div>최신수정날짜: {todo.updatedAt}</div>
				<div
					className="right"
					style={{color: todo.done ? "blue" : "red", cursor: "pointer"}}
					onClick={handleToggle}
				>
					{todo.done ? "수행완료" : "미수행"}
				</div>
			</div>
			<button style={{color: "red"}} onClick={handleDelete}>
				삭제
			</button>
		</li>
	);
}

interface ITodoList {
	todos: TodoType[];
	toggleTodo: (toggleMapFn: (item: TodoType) => TodoType) => void;
	removeTodo: (removeFilterFn: (item: TodoType) => boolean) => void;
	isLoading: boolean;
	error: boolean;
}
function TodoList(props: ITodoList) {
	const {error, isLoading, todos, toggleTodo, removeTodo} = props;
	return (
		<>
			{error && <div>error</div>}
			{isLoading && <div>todos loading...</div>}
			{todos && (
				<ul>
					{todos.map((todo) => (
						<Todo
							removeTodo={removeTodo}
							key={todo.id}
							todo={todo}
							toggleTodo={toggleTodo}
						></Todo>
					))}
				</ul>
			)}
		</>
	);
}
