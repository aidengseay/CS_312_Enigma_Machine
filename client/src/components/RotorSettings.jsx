// imports /////////////////////////////////////////////////////////////////////

    // none

// rotor setting function //////////////////////////////////////////////////////

export default function RotorSettings({ num, values, setValues }) {


    function handleChange(field, value) {

        // copy the current value
        const updatedValues = { ...values };

        // update rotor spec
        if (field === "spec") {
            updatedValues.spec = value;
        
        // assume it is either start pos or ring setting
        } else {
            updatedValues[field] = parseInt(value);
        }

        // update the new value
        setValues(updatedValues);
    }

  return (
    <div className="rotor-options">

        <h3>Rotor {num}</h3>

        {/* get the rotor spec from dropdown */}
        <label>Rotor Type</label>
        <select name={`rotor-${num}`} value={values.spec} onChange={(event) => handleChange("spec", event.target.value)}>
            <option value="I">I</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
            <option value="V">V</option>
        </select>

        {/* get the rotor start position */}
        <label>Start Position</label>
        <select name={`rotor-${num}-pos`} value={values.startPosition} onChange={(event) => handleChange("startPosition", event.target.value)}>
            <option value="0">A</option>
            <option value="1">B</option>
            <option value="2">C</option>
            <option value="3">D</option>
            <option value="4">E</option>
            <option value="5">F</option>
            <option value="6">G</option>
            <option value="7">H</option>
            <option value="8">I</option>
            <option value="9">J</option>
            <option value="10">K</option>
            <option value="11">L</option>
            <option value="12">M</option>
            <option value="13">N</option>
            <option value="14">O</option>
            <option value="15">P</option>
            <option value="16">Q</option>
            <option value="17">R</option>
            <option value="18">S</option>
            <option value="19">T</option>
            <option value="20">U</option>
            <option value="21">V</option>
            <option value="22">W</option>
            <option value="23">X</option>
            <option value="24">Y</option>
            <option value="25">Z</option>
        </select>

        {/* get the rotor ring setting */}
        <label>Ring Setting</label>
        <select name={`rotor-${num}-ring`} value={values.ringSetting} onChange={(event) => handleChange("ringSetting", event.target.value)}>
            <option value="0">A</option>
            <option value="1">B</option>
            <option value="2">C</option>
            <option value="3">D</option>
            <option value="4">E</option>
            <option value="5">F</option>
            <option value="6">G</option>
            <option value="7">H</option>
            <option value="8">I</option>
            <option value="9">J</option>
            <option value="10">K</option>
            <option value="11">L</option>
            <option value="12">M</option>
            <option value="13">N</option>
            <option value="14">O</option>
            <option value="15">P</option>
            <option value="16">Q</option>
            <option value="17">R</option>
            <option value="18">S</option>
            <option value="19">T</option>
            <option value="20">U</option>
            <option value="21">V</option>
            <option value="22">W</option>
            <option value="23">X</option>
            <option value="24">Y</option>
            <option value="25">Z</option>
        </select>
        </div>
  );
}