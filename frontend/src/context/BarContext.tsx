

import { createContext } from 'react'


const LayoutContext = createContext<{
	showSidebar: boolean
	setShowSidebar: (value: boolean) => void
} | null>(null)


export default LayoutContext;