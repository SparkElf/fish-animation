import React from "react"
import { app } from "./main"
var containerCSS = {
    width: '100%',
    height: '50%',
    transform: 'translateY(450px)',
    margin: '0',
    padding: '0',
    backgroundColor: '#FFFFFF',
}
export const FishAnimation = (props) => {
    React.useEffect(() => {
        app.launch()
    }, [])
    return (
        <div id="fish-container" className={props.className} style={containerCSS}>
            <canvas id="fish-canvas">
            </canvas>
        </div>
    )
}