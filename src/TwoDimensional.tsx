import React, { useEffect, useRef, useState } from 'react';
import 'mathlive';
import './App.scss';
import 'mathlive/fonts.css';

export type Complex = {
	re: number;
	im: number;
};

export default function TwoDimensional() {
	const [latex, setLatex] = useState('');
	const [mathWidth, setMathWidth] = useState(400);
	const [isResizing, SetisResizing] = useState(false);
	const [calculatedValues, setCalculatedValues] = useState<number[]>([]);

	const [X_MIN, set_X_MIN] = useState(-10);
	const [X_MAX, set_X_MAX] = useState(10);
	const [Y_MIN, set_Y_MIN] = useState(-10);
	const [Y_MAX, set_Y_MAX] = useState(10);
	const [X_STEP, set_X_STEP] = useState(1 / 1000);

	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (window.Worker) {
			const myWorker = new Worker(new URL('./worker.ts', import.meta.url), {
				type: 'module',
			});

			myWorker.postMessage({ latex, X_MIN, X_MAX, X_STEP });

			myWorker.onmessage = function (e) {
				setCalculatedValues(e.data);
			};
		}
	}, [X_MAX, X_MIN, X_STEP, latex]);

	useEffect(() => {
		const startTime = Date.now();
		console.log(calculatedValues);

		if (!canvas.current) return;
		const ctx = canvas.current.getContext('2d');
		if (!ctx) return;
		const width = canvas.current.width;
		const height = canvas.current.height;
		const X_MULT = width / (X_MAX - X_MIN);
		const Y_MULT = height / (Y_MAX - Y_MIN);
		ctx.clearRect(0, 0, width, height);
		ctx.beginPath();
		ctx.moveTo(X_MIN, height - calculatedValues[0]);
		for (let i = 0; i <= (X_MAX - X_MIN) / X_STEP; i += 1) {
			ctx.lineTo(
				i * X_STEP * X_MULT,
				height - (calculatedValues[i] - Y_MIN) * Y_MULT
			);
		}
		ctx.stroke();

		console.log('Time: ' + (Date.now() - startTime));
	}, [calculatedValues, X_MIN, X_MAX, X_STEP, Y_MAX, Y_MIN]);

	return (
		<div
			className="root-container"
			onMouseMove={(event) => {
				if (isResizing) {
					setMathWidth(Math.max(100, event.clientX));
				}
			}}
		>
			<div className="math-container" style={{ width: mathWidth }}>
				<math-field
					class="math-field"
					onInput={(evt: React.ChangeEvent<HTMLInputElement>) =>
						setLatex(evt.target.value)
					}
				>
					{latex}
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
				style={{ width: window.innerWidth - mathWidth, left: mathWidth }}
			>
				<canvas
					ref={canvas}
					width={window.innerWidth - mathWidth}
					height={window.innerHeight}
					style={{ width: window.innerWidth - mathWidth, left: mathWidth }}
				/>
			</div>
		</div>
	);
}
