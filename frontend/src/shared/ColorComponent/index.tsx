import React from "react";
import {
	ColorBox,
	ColorProvider,
	ColorSelector,
	ColorBox2,
	ColorProvider2,
	ColorSelector2,
} from "shared/contexts/ColorContext";

// const ColorComponent = () => {
// 	return (
// 		<div>
// 			<div style={{display: "flex", marginBottom: 10}}>
// 				<h3>A 그룹</h3>
// 				<ColorProvider>
// 					<div>
// 						<ColorSelector></ColorSelector>
// 						<br></br>
// 						<ColorBox></ColorBox>
// 						<ColorBox></ColorBox>
// 					</div>
// 				</ColorProvider>
// 			</div>
// 			<ColorBox></ColorBox>
// 		</div>
// 	);
// };
const ColorComponent2 = React.memo(() => {
	return (
		<div style={{display: "flex", justifyContent: "space-around"}}>
			<div style={{display: "flex", marginBottom: 10}}>
				<h3>A 그룹</h3>
				<ColorProvider2>
					<div>
						<ColorSelector2></ColorSelector2>
						<br></br>
						<ColorBox2></ColorBox2>
						<ColorBox2></ColorBox2>
					</div>
				</ColorProvider2>
			</div>
			<div style={{display: "flex", marginBottom: 10}}>
				<h3>B 그룹</h3>
				<ColorProvider>
					<div>
						<ColorSelector></ColorSelector>
						<br></br>
						<ColorBox></ColorBox>
						<ColorBox></ColorBox>
					</div>
				</ColorProvider>
			</div>
		</div>
	);
});

export default ColorComponent2;
