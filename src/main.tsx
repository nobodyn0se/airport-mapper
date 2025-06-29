import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import GCMapper from './GCMapper.tsx'

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Root element is not defined');
}

createRoot(rootElement).render(
    <StrictMode>
        <GCMapper/>
    </StrictMode>,
)
