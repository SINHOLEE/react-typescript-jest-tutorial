import React from "react";
import {Link} from "react-router-dom";

import {useProjectSelectDispatch} from "shared/contexts/ProjectSelectContext";
import {useSocket} from "shared/contexts/SocketContext";
import {useTokenDispatch, useTokenState} from "shared/contexts/TokenContenxt";

const liStyle = {
	marginRight: 20,
};

export default function Menu() {
	const {disconect} = useSocket();
	const {isLogedIn} = useTokenState();
	const {resetProjectId} = useProjectSelectDispatch();

	const {logout} = useTokenDispatch();
	return (
		<ul style={{display: "flex", justifyContent: "flex-start", marginRight: 30}}>
			{isLogedIn ? (
				<li
					style={{...liStyle}}
					onClick={() => {
						logout();
						resetProjectId();
						disconect();
					}}
				>
					<Link to="/">logout</Link>
				</li>
			) : (
				<li style={{...liStyle}}>
					<Link to="/">login</Link>
				</li>
			)}
			<li style={{...liStyle}}>
				<Link to="/color">color</Link>
			</li>
			{isLogedIn && (
				<>
					<li style={{...liStyle}}>
						<Link to="/projects">pojects</Link>
					</li>
					<li style={{...liStyle}}>
						<Link to="/todos">todos</Link>
					</li>
				</>
			)}
		</ul>
	);
}
