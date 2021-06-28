import {createContext, Dispatch, ReactNode, useContext, useReducer} from "react";
type TokenState = {isLogedIn: boolean; token: string};
type TokenAction = {type: "SET_LOGIN"; value: string} | {type: "LOGOUT"};
type TokenDispatch = Dispatch<TokenAction>;
const token = localStorage.getItem("token") || "";

const initTokenState = {isLogedIn: !!token, token};

const TokenStateContext = createContext<TokenState>(initTokenState);
const TokenDispatchContenxt = createContext<TokenDispatch>(() => {});

function TokenReducer(state: TokenState, action: TokenAction): TokenState {
	switch (action.type) {
		case "LOGOUT":
			localStorage.removeItem("token");
			return {...state, isLogedIn: false, token: ""};
		case "SET_LOGIN":
			localStorage.setItem("token", action.value);
			return {isLogedIn: true, token: action.value};
		default:
			throw new Error("TokenAction Error");
	}
}

export function useTokenState() {
	const state = useContext(TokenStateContext);
	if (!state) throw new Error("no Token State");
	return state;
}

export function useTokenDispatch() {
	const dispatch = useContext(TokenDispatchContenxt);
	const login = (token: string) => {
		dispatch({type: "SET_LOGIN", value: token});
	};
	const logout = () => {
		dispatch({type: "LOGOUT"});
	};
	return {login, logout};
}

export function TokenProvider({children}: {children: ReactNode}) {
	const [state, dispatch] = useReducer(TokenReducer, initTokenState);
	return (
		<TokenStateContext.Provider value={state}>
			<TokenDispatchContenxt.Provider value={dispatch}>
				{children}
			</TokenDispatchContenxt.Provider>
		</TokenStateContext.Provider>
	);
}
