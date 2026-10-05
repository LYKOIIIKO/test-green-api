import {createRoot} from 'react-dom/client';
// Components
import {App} from './App';
// Styles
import '@gravity-ui/uikit/styles/styles.css';
import '@gravity-ui/uikit/styles/fonts.css';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (rootElement) {
	createRoot(rootElement).render(<App />);
}
