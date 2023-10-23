import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './App.tsx';
import TwoDimensional from './TwoDimensional.tsx';
import ThreeDimensional from './ThreeDimensional.tsx';
import './index.scss';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Root />,
		errorElement: <Root />,
	},
	{
		path: '/2d',
		element: <TwoDimensional />,
	},
	{
		path: '/3d',
		element: <ThreeDimensional />,
	},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
