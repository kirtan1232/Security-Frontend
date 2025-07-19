import React from "react";

// eslint-disable-next-line react/prop-types
const Note = ({ name, octave }) => {
    // eslint-disable-next-line react/prop-types
    const noteParts = name.match(/^([A-G#]+)(\d+)$/);
    const noteName = noteParts ? noteParts[1] : name;
    const noteOctave = noteParts ? noteParts[2] : octave;

    return (
        <div style={styles.note}>
            <span style={styles.name}>{noteName[0]}</span>
            {noteName.length > 1 && <span style={styles.sharp}>{noteName.slice(1)}</span>}
            <span style={styles.octave}>{noteOctave}</span>
        </div>
    );
};

const styles = {
    note: {
        fontSize: "64px",
        fontWeight: "bold",
        color: "#c62828",
        textAlign: "center",
    },
    sharp: {
        fontSize: "32px",
        verticalAlign: "super",
        marginLeft: "5px",
    },
    octave: {
        fontSize: "32px",
        marginLeft: "10px",
    },
};

export default Note;
