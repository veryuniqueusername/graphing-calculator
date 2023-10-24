import { ComputeEngine } from '@cortex-js/compute-engine';
import { Complex } from './TwoDimensional';

onmessage = (e) => {
	if (!e) return;

	const {
		latex,
		X_MIN,
		X_MAX,
		X_STEP,
	}: { latex: string; X_MIN: number; X_MAX: number; X_STEP: number } = e.data;
	const ce = new ComputeEngine({ numericMode: 'complex' });
	ce.pushScope();
	const expr = ce.parse(latex);
	const newCalculatedValues: number[] = [];

	const variables = [];
	if (expr.unknowns.length > variables.length + 1) return;

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

	postMessage(newCalculatedValues);
};
