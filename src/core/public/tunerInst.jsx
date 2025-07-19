import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../components/ThemeContext";
import Sidebar from "../../components/sidebar.jsx";
import Swal from "sweetalert2";

const instruments = {
  guitar: ["E (Low)", "A", "D", "G", "B", "E (High)"],
  ukulele: ["G", "C", "E", "A"],
};

const tuningFrequencies = {
  guitar: {
    "E (Low)": 82.41,
    A: 110.0,
    D: 146.83,
    G: 196.0,
    B: 246.94,
    "E (High)": 329.63,
  },
  ukulele: {
    G: 196.0,
    C: 261.63,
    E: 329.63,
    A: 440.0,
  },
};

class Tuner {
  constructor(a4) {
    this.middleA = a4 || 440;
    this.semitone = 69;
    this.bufferSize = 4096;
    this.noteStrings = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
    this.initGetUserMedia();
  }

  initGetUserMedia() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!window.AudioContext) {
      return alert("AudioContext not supported");
    }

    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }

    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function (constraints) {
        const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!getUserMedia) {
          alert("getUserMedia is not implemented in this browser");
        }
        return new Promise(function (resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }
  }

  startRecord() {
    const self = this;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        self.audioContext.createMediaStreamSource(stream).connect(self.analyser);
        self.analyser.connect(self.scriptProcessor);
        self.scriptProcessor.connect(self.audioContext.destination);
        self.scriptProcessor.addEventListener("audioprocess", function (event) {
          const frequency = self.pitchDetector.do(event.inputBuffer.getChannelData(0));
          if (frequency && self.onNoteDetected) {
            const note = self.getNote(frequency);
            self.onNoteDetected({
              name: self.noteStrings[note % 12],
              value: note,
              cents: self.getCents(frequency, note),
              octave: parseInt(note / 12) - 1,
              frequency: frequency,
            });
          }
        });
      })
      .catch(function (error) {
        alert(error.name + ": " + error.message);
      });
  }

  init() {
    this.audioContext = new window.AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.scriptProcessor = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1);

    const self = this;

    return new Promise((resolve) => {
      const aubioScript = document.createElement("script");
      aubioScript.src = "https://cdn.jsdelivr.net/npm/aubiojs@0.1.1/build/aubio.min.js";
      aubioScript.onload = function () {
        window.aubio().then(function (aubio) {
          self.pitchDetector = new aubio.Pitch(
            "default",
            self.bufferSize,
            1,
            self.audioContext.sampleRate
          );
          self.startRecord();
          resolve();
        });
      };
      document.body.appendChild(aubioScript);
    });
  }

  getNote(frequency) {
    const note = 12 * (Math.log(frequency / this.middleA) / Math.log(2));
    return Math.round(note) + this.semitone;
  }

  getStandardFrequency(note) {
    return this.middleA * Math.pow(2, (note - this.semitone) / 12);
  }

  getCents(frequency, note) {
    return Math.floor(
      (1200 * Math.log(frequency / this.getStandardFrequency(note))) / Math.log(2)
    );
  }

  play(frequency) {
    if (!this.oscillator) {
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.connect(this.audioContext.destination);
      this.oscillator.start();
    }
    this.oscillator.frequency.value = frequency;
  }

  playSuccessSound() {
    const audio = new Audio("/src/assets/audio/correct.mp3");
    audio.play().catch((err) => console.error("Error playing success sound:", err));
  }

  stopOscillator() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator = null;
    }
  }
}

const Meter = ({ cents, isInTune }) => {
  const rotation = (cents / 50) * 45;
  
  return (
    <div className="meter relative w-full h-64 mx-auto my-8">
      <div className={`meter-pointer absolute w-1 h-full transition-transform duration-300 ${
        isInTune ? 'bg-green-500' : 'bg-gray-800 dark:bg-gray-200'
      }`}
           style={{ transform: `rotate(${rotation}deg)`, right: '50%', transformOrigin: 'bottom' }}></div>
      <div className="meter-dot absolute w-3 h-3 bg-gray-800 dark:bg-gray-200 rounded-full bottom-0"
           style={{ right: '50%', marginRight: '-5px' }}></div>
      {[...Array(11)].map((_, i) => (
        <div key={i} 
             className={`meter-scale absolute w-1 h-full border-t-8 border-gray-800 dark:border-gray-200 transition-transform duration-200`}
             style={{ 
               transform: `rotate(${i * 9 - 45}deg)`, 
               right: '50%', 
               transformOrigin: 'bottom',
               borderTopWidth: i % 5 === 0 ? '16px' : '8px'
             }}></div>
      ))}
    </div>
  );
};

const Note = ({ name, octave }) => {
  return (
    <div className="note text-center my-4">
      <span className="text-6xl font-bold text-gray-800 dark:text-gray-100">
        {name[0]}
        {name[1] && <span className="text-4xl">{name[1]}</span>}
        <span className="text-2xl align-bottom">{octave}</span>
      </span>
    </div>
  );
};

const TunerComponent = () => {
  const { theme } = useTheme();
  const [instrument, setInstrument] = useState("guitar");
  const [selectedString, setSelectedString] = useState(0);
  const [note, setNote] = useState({ name: "A", octave: 4, frequency: 440, cents: 0 });
  const [tuningComplete, setTuningComplete] = useState(false);
  const [tuningMessage, setTuningMessage] = useState("");
  const [messageVisible, setMessageVisible] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [a4, setA4] = useState(440);
  const navigate = useNavigate();
  const stringNotes = instruments[instrument];
  const currentStringNote = stringNotes[selectedString];
  const [userProfile, setUserProfile] = useState(null);
  const tunerRef = useRef(null);
  const hasPlayedSuccessSound = useRef(false);

  useEffect(() => {
    const initializeTuner = async () => {
      try {
        const tunerInstance = new Tuner(a4);
        tunerInstance.onNoteDetected = (detectedNote) => {
          if (isAutoMode) {
            setNote({
              name: detectedNote.name,
              octave: detectedNote.octave,
              frequency: detectedNote.frequency,
              cents: detectedNote.cents,
            });
          }
        };
        
        await tunerInstance.init();
        tunerRef.current = tunerInstance;
        
        Swal.fire("Welcome to the Anna tuner!");
      } catch (error) {
        console.error("Tuner initialization failed:", error);
        alert("Failed to initialize tuner: " + error.message);
      }
    };

    initializeTuner();

    return () => {
      if (tunerRef.current) {
        tunerRef.current.stopOscillator();
        if (tunerRef.current.audioContext) {
          tunerRef.current.audioContext.close().catch((err) => console.error("Error closing audio context:", err));
        }
      }
    };
  }, [a4]);

  useEffect(() => {
    const correctFrequency = tuningFrequencies[instrument][currentStringNote];
    if (note.frequency && Math.abs(note.frequency - correctFrequency) <= 1) {
      if (!hasPlayedSuccessSound.current) {
        setTuningComplete(true);
        setTuningMessage(`${currentStringNote} is in tune!`);
        setMessageVisible(true);
        
        if (tunerRef.current) {
          tunerRef.current.playSuccessSound();
        }
        hasPlayedSuccessSound.current = true;

        const timer = setTimeout(() => {
          setMessageVisible(false);
          setTuningMessage("");
          handleNextString();
          hasPlayedSuccessSound.current = false;
        }, 3000);

        return () => clearTimeout(timer);
      }
    } else {
      setTuningComplete(false);
      setMessageVisible(false);
      setTuningMessage("");
      hasPlayedSuccessSound.current = false;
    }
  }, [note, currentStringNote, instrument]);

  const handleNextString = () => {
    if (selectedString < stringNotes.length - 1) {
      setSelectedString(selectedString + 1);
      setTuningComplete(false);
      setTuningMessage("");
      setMessageVisible(false);
    } else {
      Swal.fire({
        title: 'Tuning Complete!',
        text: 'All strings are now in tune!',
        icon: 'success'
      });
      setSelectedString(0);
    }
  };

  const handleSelectString = (index) => {
    setSelectedString(index);
    setTuningComplete(false);
    setTuningMessage("");
    setMessageVisible(false);
    hasPlayedSuccessSound.current = false;
    
    if (!isAutoMode) {
      const noteName = stringNotes[index];
      const frequency = tuningFrequencies[instrument][noteName];
      tunerRef.current.play(frequency);
      setNote({
        name: noteName.split(" ")[0], // Remove "(Low)" or "(High)" from note name
        octave: Math.floor(Math.log2(frequency / 440) + 4),
        frequency: frequency,
        cents: 0,
      });
    }
  };

  const toggleAutoMode = () => {
    if (!isAutoMode) {
      tunerRef.current.stopOscillator();
    }
    setIsAutoMode(!isAutoMode);
  };

  const updateA4 = () => {
    Swal.fire({
      title: 'Set A4 Frequency',
      input: 'number',
      inputValue: a4,
      inputAttributes: {
        min: 400,
        max: 500,
        step: '0.1'
      },
      showCancelButton: true
    }).then(({ value }) => {
      if (!value || parseInt(value) === a4) return;
      const newA4 = parseInt(value);
      setA4(newA4);
      localStorage.setItem("a4", newA4);
      if (tunerRef.current) {
        tunerRef.current.middleA = newA4;
      }
    });
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("https://localhost:3000/api/auth/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    const savedA4 = parseInt(localStorage.getItem("a4"));
    if (savedA4) {
      setA4(savedA4);
    }
    fetchUserProfile();
  }, []);

  return (
    <div className={`h-screen flex ${theme === 'light' ? 'bg-gradient-to-br from-purple-100 to-blue-100' : 'bg-gradient-to-br from-gray-900 to-gray-800'}`}>
      <Sidebar />
      <main className="flex-1 p-6 flex justify-center items-start mt-4">
        <div className={`bg-white bg-opacity-60 backdrop-blur-lg dark:bg-gray-800 dark:bg-opacity-80 rounded-3xl shadow-lg p-8 w-full max-w-7xl h-[85vh]`}>
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={updateA4}
              className="text-gray-700 dark:text-gray-200 font-medium"
            >
              A<sub>4</sub> = <span className="text-red-500">{a4}</span> Hz
            </button>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              Turn On/Off
              <input 
                type="checkbox" 
                checked={isAutoMode}
                onChange={toggleAutoMode}
                className="w-5 h-5"
              />
            </label>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-400 dark:text-gray-200 mb-4 text-center">Instrument Tuner</h2>
          <div className="flex gap-2 mb-4 justify-center">
            {Object.keys(instruments).map((inst) => (
              <button
                key={inst}
                onClick={() => {
                  setInstrument(inst);
                  setSelectedString(0);
                }}
                className={`px-4 py-2 rounded-lg text-lg font-medium transition-all duration-300 shadow-md ${
                  instrument === inst
                    ? "bg-blue-200 text-black dark:bg-blue-600 dark:text-white"
                    : "bg-gray-300 text-gray-700 hover:bg-purple-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-purple-600"
                }`}
              >
                {inst.charAt(0).toUpperCase() + inst.slice(1)}
              </button>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">Select String</h3>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {stringNotes.map((stringNote, index) => (
              <button
                key={index}
                onClick={() => handleSelectString(index)}
                className={`px-4 py-2 rounded-lg text-lg font-medium transition-all duration-300 shadow-md ${
                  selectedString === index
                    ? "bg-purple-300 text-white dark:bg-purple-600 dark:text-white"
                    : "bg-gray-400 text-white hover:bg-gray-600 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                }`}
              >
                {stringNote}
              </button>
            ))}
          </div>
          
          <Meter cents={note.cents} isInTune={tuningComplete} />
          <Note name={note.name} octave={note.octave} />
          <p className="text-xl text-gray-900 dark:text-gray-100 mt-2 font-semibold text-center">{note.frequency.toFixed(1)} Hz</p>
          
          {messageVisible && (
            <div className="mt-4 text-center">
              <p className="text-green-500 dark:text-green-400 font-semibold text-lg">{tuningMessage}</p>
            </div>
          )}
        </div>
      </main>
      <aside className="w-36 bg-white bg-opacity-10 backdrop-blur-lg dark:bg-gray-900 dark:bg-opacity-50 p-2 flex flex-col items-center">
        {userProfile && userProfile.profilePicture ? (
          <img
            src={`https://localhost:3000/${userProfile.profilePicture}`}
            alt="Profile"
            className="w-16 h-16 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer mt-4"
            onClick={() => navigate("/profile")}
          />
        ) : (
          <img
            src="src/assets/images/profile.png"
            alt="Profile"
            className="w-16 h-16 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer mt-4"
            onClick={() => navigate("/profile")}
          />
        )}
      </aside>
    </div>
  );
};

export default TunerComponent;