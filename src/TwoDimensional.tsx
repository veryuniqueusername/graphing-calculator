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
	const [isResizing, setIsResizing] = useState(false);
	const [calculatedValues, setCalculatedValues] = useState<number[]>([]);

	const [X_MIN, set_X_MIN] = useState(-10);
	const [X_MAX, set_X_MAX] = useState(10);
	const [Y_MIN, set_Y_MIN] = useState(-10);
	const [Y_MAX, set_Y_MAX] = useState(10);
	const [X_STEP, set_X_STEP] = useState(10);

	const [oldWidth, setOldWidth] = useState(window.innerWidth - mathWidth);

	const canvas = useRef<HTMLCanvasElement>(null);
	const grid = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		set_Y_MAX(10 * (canvas.current!.height / canvas.current!.width));
		set_Y_MIN(-10 * (canvas.current!.height / canvas.current!.width));
	}, []);

	useEffect(() => {
		set_X_STEP(canvas.current!.width);
	}, [mathWidth]);

	// CALCULATE GRAPH IN WEB WORKER
	useEffect(() => {
		if (window.Worker && !isResizing) {
			const myWorker = new Worker(new URL('./worker.ts', import.meta.url), {
				type: 'module',
			});

			myWorker.postMessage({ latex, X_MIN, X_MAX, X_STEP });

			myWorker.onmessage = function (e) {
				setCalculatedValues(e.data);
			};
		}
	}, [X_MAX, X_MIN, X_STEP, isResizing, latex]);

	// GRIDLINES
	useEffect(() => {
		if (!grid.current) return;
		const ctx = grid.current.getContext('2d');
		if (!ctx) return;

		ctx.lineWidth = 1;
		ctx.strokeStyle = '#808080';

		const width = grid.current.width;
		const height = grid.current.height;
		const Y_MULT = height / (Y_MAX - Y_MIN);
		const X_MULT = width / (X_MAX - X_MIN);

		ctx.clearRect(0, 0, width, height);
		ctx.beginPath();
		ctx.moveTo(0, Y_MAX * Y_MULT);
		ctx.lineTo(width, Y_MAX * Y_MULT);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(-X_MIN * X_MULT, 0);
		ctx.lineTo(-X_MIN * X_MULT, height);
		ctx.stroke();
	}, [X_MIN, X_MAX, Y_MAX, Y_MIN, mathWidth]);

	// GRAPH
	useEffect(() => {
		if (!canvas.current) return;
		const ctx = canvas.current.getContext('2d');
		if (!ctx) return;

		ctx.lineWidth = 2;
		ctx.strokeStyle = '#d03030';

		const width = canvas.current.width;
		const height = canvas.current.height;
		const Y_MULT = height / (Y_MAX - Y_MIN);
		ctx.clearRect(0, 0, width, height);
		ctx.beginPath();
		ctx.moveTo(0, height - (calculatedValues[0] - Y_MIN) * Y_MULT);
		for (let i = 0; i <= X_STEP; i += 1) {
			ctx.lineTo(
				(i / X_STEP) * width,
				height - (calculatedValues[i] - Y_MIN) * Y_MULT
			);
		}
		ctx.stroke();
	}, [calculatedValues, X_MIN, X_MAX, X_STEP, Y_MAX, Y_MIN]);

	return (
		<div
			className="root-container"
			onMouseMove={(event) => {
				if (isResizing) {
					event.preventDefault();
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
				<button
					onClick={() => {
						set_X_MAX(10);
						set_X_MIN(-10);
						set_Y_MAX(10 * (canvas.current!.height / canvas.current!.width));
						set_Y_MIN(-10 * (canvas.current!.height / canvas.current!.width));
					}}
				>
					Reset view
				</button>
			</div>
			<div
				style={{ left: mathWidth }}
				className="resize-handle"
				onMouseDown={() => {
					if (!isResizing) setOldWidth(window.innerWidth - mathWidth);
					setIsResizing(true);
				}}
				onMouseUp={() => {
					setIsResizing(false);
					set_Y_MAX(Y_MAX / ((window.innerWidth - mathWidth) / oldWidth));
					set_Y_MIN(Y_MIN / ((window.innerWidth - mathWidth) / oldWidth));
				}}
			></div>
			<div
				className="canvas-container"
				style={{ width: window.innerWidth - mathWidth, left: mathWidth }}
			>
				<canvas
					ref={grid}
					width={window.innerWidth - mathWidth}
					height={window.innerHeight}
					style={{ width: window.innerWidth - mathWidth }}
				></canvas>
				<canvas
					ref={canvas}
					width={window.innerWidth - mathWidth}
					height={window.innerHeight}
					style={{ width: window.innerWidth - mathWidth }}
				/>
			</div>
		</div>
	);
}
