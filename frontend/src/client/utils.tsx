import {Reducer, useCallback, useEffect, useReducer} from "react";

export async function fetchAPI<T>(url: string, token?: string, projectId?: string) {
	try {
		const headers: any = {
			"Content-type": "application/json",
		};
		if (token) {
			headers["authorization"] = token;
		}
		if (projectId) {
			headers["project_id"] = projectId;
		}

		const res = await fetch(url, {
			headers,
		});

		const data = (await res.json()) as T[];
		return data;
	} catch (e) {
		throw new Error(`fetch api ${url} call has a truoble`);
	}
}
type FetchState<T> = {
	data: T[];
	isLoading: boolean;
	error: boolean;
};
type FetchAction<T> =
	| {type: "SET_LOADING"; loading_state: boolean}
	| {type: "SET_ERROR"; error_state: boolean}
	| {type: "SET_DATA"; data: T[]}
	| {type: "ADD_ITEM"; data: T}
	| {type: "TOGGLE"; toggleMapFn: (item: T) => T}
	| {type: "REMOVE"; removeFilterFn: (item: T) => boolean};

function fetchReducer<T>(state: FetchState<T>, action: FetchAction<T>): FetchState<T> {
	switch (action.type) {
		case "TOGGLE":
			return {...state, data: state.data.map(action.toggleMapFn)};
		case "REMOVE":
			return {...state, data: state.data.filter(action.removeFilterFn)};
		case "SET_DATA":
			return {...state, data: action.data};
		case "ADD_ITEM":
			return {...state, data: [...state.data, action.data]};
		case "SET_ERROR":
			return {...state, error: action.error_state};
		case "SET_LOADING":
			return {...state, isLoading: action.loading_state};
		default:
			throw new Error("no fetch action");
	}
}
const initFetchState = {
	data: [] as never,
	isLoading: false,
	error: false,
};

export function useFetch<T>(fetchFn: () => Promise<T[]>, ...depth: any[]) {
	const [{data, error, isLoading}, dispatch] = useReducer<Reducer<FetchState<T>, FetchAction<T>>>(
		fetchReducer,
		initFetchState,
	);
	const setIsLoading = useCallback((value: boolean) => {
		dispatch({type: "SET_LOADING", loading_state: value});
	}, []);
	const setError = useCallback((value: boolean) => {
		dispatch({type: "SET_ERROR", error_state: value});
	}, []);
	const setData = useCallback((data: T[]) => {
		dispatch({type: "SET_DATA", data});
	}, []);
	const addItem = useCallback((item: T) => {
		dispatch({type: "ADD_ITEM", data: item});
	}, []);
	const toggle = useCallback((toggleMapFn: (item: T) => T) => {
		dispatch({type: "TOGGLE", toggleMapFn});
	}, []);
	const remove = useCallback((removeFilterFn: (item: T) => boolean) => {
		dispatch({type: "REMOVE", removeFilterFn});
	}, []);
	useEffect(() => {
		const asyncFetch = async () => {
			setIsLoading(true);
			try {
				const data = await fetchFn();
				if (data) {
					setData(data);
				}
			} catch (e) {
				setError(true);
				alert(e.message);
			} finally {
				console.log("로딩 끝");
				setIsLoading(false);
			}
		};

		asyncFetch();
	}, []);

	return {data, isLoading, error, addItem, toggle, remove} as const;
}
