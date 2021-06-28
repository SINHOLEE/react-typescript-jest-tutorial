import {useEffect, useState} from "react";

export async function fetchAPI<T>(
	url: string,
	token?: string,
	projectId?: string,
): Promise<T | undefined> {
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

		const data = (await res.json()) as T;
		return data;
	} catch (e) {
		throw new Error(`fetch api call has a truoble`);
	}
}

export function useFetch<T>(fetchFn: () => Promise<T>, ...depth: any[]) {
	const [data, setData] = useState<T>();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(false);
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

	return {data, isLoading, error} as const;
}
