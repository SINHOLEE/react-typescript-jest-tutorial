import {createContext, Dispatch, ReactNode, useContext, useReducer} from "react";

type ProjectSelectState = {projectId: string};
type ProjectSelectAction = {type: "SET_PROJECT_ID"; value: string} | {type: "RESET"};
type ProjectSelectDispatch = Dispatch<ProjectSelectAction>;

const initProjectSelectState = {projectId: ""};

const ProjectSelectStateContext = createContext<ProjectSelectState>(initProjectSelectState);
const ProjectSelectDispatchContext = createContext<ProjectSelectDispatch>(() => {});

function ProjectSelectReducer(
	state: ProjectSelectState,
	action: ProjectSelectAction,
): ProjectSelectState {
	switch (action.type) {
		case "RESET":
			return {projectId: ""};
		case "SET_PROJECT_ID":
			return {projectId: action.value};
		default:
			throw new Error("no project select action");
	}
}

export function useProjectSelectState() {
	const state = useContext(ProjectSelectStateContext);
	if (!state) {
		throw new Error("no Project Select State");
	}
	return state;
}
export function useProjectSelectDispatch() {
	const dispatch = useContext(ProjectSelectDispatchContext);
	if (!dispatch) {
		throw new Error("no Project Select Dispatch");
	}
	const setProjectId = (value: string) => {
		dispatch({type: "SET_PROJECT_ID", value});
	};
	const resetProjectId = () => {
		dispatch({type: "RESET"});
	};
	return {setProjectId, resetProjectId};
}

export function ProjectSelectProvider({children}: {children: ReactNode}) {
	const [state, disptach] = useReducer(ProjectSelectReducer, initProjectSelectState);
	return (
		<ProjectSelectStateContext.Provider value={state}>
			<ProjectSelectDispatchContext.Provider value={disptach}>
				{children}
			</ProjectSelectDispatchContext.Provider>
		</ProjectSelectStateContext.Provider>
	);
}
