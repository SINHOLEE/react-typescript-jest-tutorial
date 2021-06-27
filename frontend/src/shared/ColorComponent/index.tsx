import { ColorBox, ColorProvider, ColorSelector } from 'shared/ColorContext';

const ColorComponent = () => {
	return (
		<div>
			<div style={{ display: 'flex', marginBottom: 10 }}>
				<h3>A 그룹</h3>
				<ColorProvider>
					<div>
						<ColorSelector></ColorSelector>
						<br></br>
						<ColorBox></ColorBox>
						<ColorBox></ColorBox>
					</div>
				</ColorProvider>
			</div>
			<ColorBox></ColorBox>
		</div>
	);
};
const ColorComponent2 = () => {
	return (
		<div>
			<div style={{ display: 'flex', marginBottom: 10 }}>
				<h3>A 그룹</h3>
				<ColorProvider>
					<div>
						<ColorSelector></ColorSelector>
						<br></br>
						<ColorBox></ColorBox>
						<ColorBox></ColorBox>
					</div>
				</ColorProvider>
			</div>
			<ColorBox></ColorBox>
		</div>
	);
};

export default ColorComponent;
