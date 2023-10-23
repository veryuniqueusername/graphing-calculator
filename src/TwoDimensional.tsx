import React, { useEffect, useRef, useState } from 'react';
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

	useEffect(() => {
		const ce = new ComputeEngine({ numericMode: 'complex' });
		ce.pushScope();
		const expr = ce.parse(value);
		const newCalculatedValues: number[] = [];

		// const variables = [];
		// if (expr.unknowns.length > variables.length + 1) return;

		const startTime = Date.now();

		console.log(expr.toJSON());
		for (let x = X_MIN; x <= X_MAX; x += X_STEP) {
			ce.assign('x', x);

			const numericalValue = expr.N().simplify().N().numericValue;
			let value = 0;
			if (numericalValue === null) value = NaN;
			else if (ce.isComplex(numericalValue)) {
				value = (numericalValue as Complex).re;
			} else {
				value = numericalValue as number;
			}

			newCalculatedValues.push(value);
		}
		setCalculatedValues(newCalculatedValues);

		console.log(Date.now() - startTime);
	}, [value, X_MIN, X_MAX, X_STEP]);

	useEffect(() => {
		const CHUNKS = 10;

		if (!canvas.current) return;
		const ctx = canvas.current.getContext('2d');
		if (!ctx) return;
		const width = canvas.current.width;
		const height = canvas.current.height;
		const X_MULT = width / (X_MAX - X_MIN);
		const Y_MULT = height / (Y_MAX - Y_MIN);
		ctx.clearRect(0, 0, width, height);
		for (let chunk = 0; chunk < CHUNKS; chunk += 1) {
			ctx.beginPath();
			ctx.moveTo(X_MIN, height - calculatedValues[chunk]);
			for (let i = 0; i <= (X_MAX - X_MIN) / CHUNKS / X_STEP; i += 1) {
				ctx.lineTo(
					(i * X_STEP + chunk) * X_MULT,
					height - calculatedValues[i + chunk]
				);
			}
			ctx.stroke();
		}
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
