import React, {
	createContext,
	Dispatch,
	ReactElement,
	useContext,
	useReducer,
	useState,
} from 'react';
type ColorState = {
	color: string;
	subColor: string;
};
type ColorActions = {
	setColor: React.Dispatch<React.SetStateAction<string>>;
	setSubColor: React.Dispatch<React.SetStateAction<string>>;
};

type ColorActions2 =
	| { type: 'SET_COLOR'; value: string }
	| { type: 'SET_SUB_COLOR'; value: string }
	| { type: 'DEFAULT' };

type ColorDispatch = Dispatch<ColorActions2>;
// default 선언
// 이때 action은 임의의 값을 삽입했는데, 필요없어보인다 이걸 어떻게 처리해야할까?
const initColor = {
	color: 'red',
	subColor: 'black',
};

const ColorStateContext = createContext<ColorState>(initColor);
const ColorDispatchContext = createContext<ColorDispatch>(() => {});

function ColorReducer(state: ColorState, action: ColorActions2): ColorState {
	switch (action.type) {
		case 'DEFAULT':
			return { ...state };
		case 'SET_COLOR':
			return { ...state, color: action.value };
		case 'SET_SUB_COLOR':
			return { ...state, subColor: action.value };
		default:
			throw new Error('Color Reducer Error');
	}
}

const ColorContext = createContext<{
	state: ColorState;
	actions: ColorActions;
}>({
	//init value
	state: { color: 'pink', subColor: 'green' },
	actions: { setColor: () => {}, setSubColor: () => {} },
});

type Props = {
	children: ReactElement;
};

// 비즈니스 로직 삽입
export function ColorProvider({ children }: Props) {
	const [color, setColor] = useState('black');
	const [subColor, setSubColor] = useState('red');

	const value = {
		state: { color, subColor },
		actions: {
			setColor,
			setSubColor,
		},
	};

	return (
		<ColorContext.Provider value={value}>{children}</ColorContext.Provider>
	);
}
export function ColorProvider2({ children }: Props) {
	const [state, dispatch] = useReducer(ColorReducer, initColor);
	return (
		<ColorStateContext.Provider value={state}>
			<ColorDispatchContext.Provider value={dispatch}>
				{children}
			</ColorDispatchContext.Provider>
		</ColorStateContext.Provider>
	);
}

function useColorState() {
	const state = useContext(ColorStateContext);
	if (!state) throw new Error('no Color State');
	return state;
}

function useColorAction() {
	const dispatch = useContext(ColorDispatchContext);
	if (!dispatch) throw new Error('no Color Dispatch');
	const setColor = (value: string) => {
		dispatch({ type: 'SET_COLOR', value });
	};
	const setSubColor = (value: string) => {
		dispatch({ type: 'SET_SUB_COLOR', value });
	};
	return { setSubColor, setColor };
}
const colors = ['#ef4348', '#bdeb34', '#5d7da8', '#975da8'];
export function ColorSelector() {
	const { actions } = useContext(ColorContext);
	return (
		<div style={{ display: 'flex' }}>
			{colors.map((color) => (
				<div
					key={color}
					style={{
						backgroundColor: color,
						width: 40,
						height: 40,
						margin: 10,
						overflow: 'auto',
					}}
					onClick={() => {
						actions.setColor(color);
						console.log(color);
					}}
					onContextMenu={(e) => {
						e.preventDefault();
						actions.setSubColor(color);
					}}
				>
					<span style={{}}>{color}</span>
				</div>
			))}
		</div>
	);
}
export function ColorSelector2() {
	const actions = useColorAction();
	return (
		<div style={{ display: 'flex' }}>
			{colors.map((color) => (
				<div
					key={color}
					style={{
						backgroundColor: color,
						width: 40,
						height: 40,
						margin: 10,
						overflow: 'auto',
					}}
					onClick={() => {
						actions.setColor(color);
						console.log(color);
					}}
					onContextMenu={(e) => {
						e.preventDefault();
						actions.setSubColor(color);
					}}
				>
					<span style={{}}>{color}</span>
				</div>
			))}
		</div>
	);
}

export function ColorBox() {
	const { state } = useContext(ColorContext);
	return (
		<>
			<div
				style={{
					width: 100,
					height: 100,
					backgroundColor: state.color,
				}}
			></div>
			<div
				style={{
					width: 200,
					height: 200,
					backgroundColor: state.subColor,
				}}
			></div>
		</>
	);
}
export function ColorBox2() {
	const state = useColorState();
	return (
		<>
			<div
				style={{
					width: 100,
					height: 100,
					backgroundColor: state.color,
				}}
			></div>
			<div
				style={{
					width: 200,
					height: 200,
					backgroundColor: state.subColor,
				}}
			></div>
		</>
	);
}
