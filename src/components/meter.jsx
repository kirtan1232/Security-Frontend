import React from "react";

const Meter = ({ cents }) => {
    const rotation = Math.max(-50, Math.min(50, cents));

    return (
        <div style={styles.meter}>
            <div style={{ ...styles.pointer, transform: `rotate(${rotation}deg)` }} />
        </div>
    );
};

const styles = {
    meter: {
        width: "200px",
        height: "100px",
        position: "relative",
        borderBottom: "5px solid black",
        margin: "20px auto",
    },
    pointer: {
        width: "5px",
        height: "50px",
        backgroundColor: "red",
        position: "absolute",
        bottom: "0",
        left: "50%",
        transformOrigin: "bottom",
    },
};

export default Meter;
