// imports /////////////////////////////////////////////////////////////////////

// Import the virtual keyboard component and its CSS
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

// constants ///////////////////////////////////////////////////////////////////
// none

// EnigmaKeyboard component ////////////////////////////////////////////////////
// This component renders a virtual QWERTY keyboard for the Enigma machine UI
export default function EnigmaKeyboard({ onKeyPress }) {
  
    // Define the keyboard layout: three rows of capital letters and a space bar
    const layout = {
        default: [
        "Q W E R T Y U I O P",
        "A S D F G H J K L",
        "Z X C V B N M {space}"
        ]
    };

    // Handle key press events from the virtual keyboard
    // - If the space bar is pressed, send a space character
    // - Otherwise, send the uppercase letter
    const handleKeyPress = (button) => {
        if (onKeyPress) {
            if (button === "{space}") {
                onKeyPress(" ");
            } else {
                onKeyPress(button.toUpperCase());
            }
        }
    };

    // Render the virtual keyboard with the specified layout and handler
    return (
        <div className="big-keyboard">
            <Keyboard layout={layout} onKeyPress={handleKeyPress}/>
        </div>
    );
}