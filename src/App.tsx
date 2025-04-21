import { useSelector } from 'react-redux'
import './App.css'
import CanvasComponent from './CanvasPanel/CanvasComponent'
import InfoPanel from './InfoPanel/InfoPanel'
import Toolbar from './Toolbar/Toolbar'
import { RootState } from '../store'
import { useEffect, useState } from 'react'
import ClipPathConversion from './ClipPathConversion/ClipPathConversion'

function App() {
  const convertState = useSelector((state: RootState) => state.appSlice.showConversions)
  const [showConversions, setShowConversions] = useState(false)

  useEffect(() => {
    setShowConversions(convertState)
  }, [convertState])
  return (
    <>
       <div className='app-container'>
          <div className='left-sidebar'></div>
          <div className='main-content'>
        {showConversions && (
          // <button ><h1>Hello</h1></button>
          <ClipPathConversion />
        )}
            <div className='page-header'>
              {/* <h1>Outliner</h1> */}
            </div>
            <div className='tool-bar'>
              <Toolbar />
            </div>
            <div className='workspace'>
              <div className='canvas-area'>
                <CanvasComponent />
              </div>
              <div className='info-panel'>
                <InfoPanel />
              </div>
            </div>
          </div>
          <div className='right-sidebar'>
          </div>
       </div>
    </>
  )
}

export default App
