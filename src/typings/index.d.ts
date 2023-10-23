import { MathfieldElementAttributes } from 'mathlive';

declare global {
	namespace React.JSX {
		interface IntrinsicElements {
			['math-field']: CustomElement<MathfieldElementAttributes>;
		}
	}
}
