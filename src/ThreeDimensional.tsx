import React, { useState } from 'react';
import 'mathlive';
import './App.scss';
import 'mathlive/fonts.css';
import { Canvas } from '@react-three/fiber';
import { CameraControls, OrthographicCamera } from '@react-three/drei';

export default function ThreeDimensional() {
	const [value, setValue] = useState('');
	const [mathWidth, setMathWidth] = useState(400);
	const [isResizing, SetisResizing] = useState(false);

	return (
		<div
			className="root-container"
			onMouseMove={(event) => {
				if (isResizing) {
					setMathWidth(Math.min(1200, Math.max(100, event.clientX)));
					if (event.clientX > 1220) SetisResizing(false);
				}
			}}
		>
			<div className="math-container" style={{ width: mathWidth }}>
				<math-field
					class="math-field"
					onInput={(evt: React.ChangeEvent<HTMLInputElement>) =>
						setValue(evt.target.value)
					}
				>
					{value}
				</math-field>
			</div>
			<div
				style={{ left: mathWidth }}
				className="resize-handle"
				onMouseDown={() => SetisResizing(true)}
				onMouseUp={() => SetisResizing(false)}
			></div>
			<div
				className="canvas-container"
				style={{ width: window.innerWidth - mathWidth }}
			>
				<Canvas camera={{ manual: true }}>
					<OrthographicCamera
						makeDefault
						position={[0, 0, 200]}
						near={0}
						zoom={1}
					/>
					<CameraControls />
					<ambientLight intensity={1} color={'white'} />
					<mesh>
						<boxGeometry args={[300, 500, 100]} />
						<meshStandardMaterial color={'#ff0000'} />
					</mesh>
				</Canvas>
			</div>
		</div>
	);
}
