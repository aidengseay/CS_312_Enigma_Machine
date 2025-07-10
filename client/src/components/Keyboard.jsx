// imports /////////////////////////////////////////////////////////////////////

import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

// constants ///////////////////////////////////////////////////////////////////

// none

// keyboard function ///////////////////////////////////////////////////////////

export default function EnigmaKeyboard({ onKeyPress }) {
  
    // define layout with only capital letters
    const layout = {
        default: [
        "Q W E R T Y U I O P",
        "A S D F G H J K L",
        "Z X C V B N M"
        ]
    };

    // handle key press event
    const handleKeyPress = (button) => {
        if (onKeyPress) {
        onKeyPress(button.toUpperCase());
        }
    };

    // display the keyboard layout
    return (
        <div>
        <Keyboard layout={layout} onKeyPress={handleKeyPress}/>
        </div>
    );
}