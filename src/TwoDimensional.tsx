import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'mathlive';
import './App.scss';
import 'mathlive/fonts.css';
import { ComputeEngine } from '@cortex-js/compute-engine';

export type Complex = {
	re: number;
	im: number;
};

export default function TwoDimensional() {
	const [value, setValue] = useState('');
	const [mathWidth, setMathWidth] = useState(400);
	const [isResizing, SetisResizing] = useState(false);
	const [calculatedValues, setCalculatedValues] = useState<number[]>([]);

	const [X_MIN, set_X_MIN] = useState(-10);
	const [X_MAX, set_X_MAX] = useState(10);
	const [Y_MIN, set_Y_MIN] = useState(-10);
	const [Y_MAX, set_Y_MAX] = useState(10);
	const [X_STEP, set_X_STEP] = useState(1 / 1000);

	const canvas = useRef<HTMLCanvasElement>(null);

	const worker: Worker = useMemo(
		() =>
			new Worker('worker.js', {
				type: 'module',
			}),
		[]
	);

	useEffect(() => {
		if (window.Worker) {
			worker.postMessage({ value, X_MIN, X_MAX, X_STEP });
		}
		console.log('sent!');
	}, [value, X_MIN, X_MAX, X_STEP, worker]);

	useEffect(() => {
		if (window.Worker) {
			worker.onmessage = (e) => {
				setCalculatedValues(e.data);
				console.log(e.data);
			};
		}
	}, [worker]);

	useEffect(() => {
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
			ctx.lineTo(i * X_STEP * X_MULT, height - calculatedValues[i]);
		}
		ctx.stroke();
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
