import React, { useState } from "react";
import * as mammoth from "mammoth";
import '@fortawesome/fontawesome-free/css/all.min.css';
import AdminSidebar from "../../components/adminSidebar.jsx";
import axios from 'axios';
import { useTheme } from "../../components/ThemeContext";

const AddChord = () => {
    const { theme } = useTheme();
    const [songName, setSongName] = useState("");
    const [selectedInstrument, setSelectedInstrument] = useState("ukulele");
    const [lyrics, setLyrics] = useState([
        { section: "", lyric: "", chord: "", docxFiles: [] }
    ]);
    const [isOpen, setIsOpen] = useState(true);
    const [chordDiagrams, setChordDiagrams] = useState([]);
    const [dragOver, setDragOver] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInstrumentChange = (e) => {
        setSelectedInstrument(e.target.value);
    };

    const handleChordDiagramUpload = (e) => {
        const files = Array.from(e.target.files);
        setChordDiagrams((prevFiles) => [...new Set([...prevFiles, ...files].map(f => f.name))].map(name => files.find(f => f.name === name) || prevFiles.find(f => f.name === name)));
    };

    const handleDocxUpload = (e, index) => {
        const files = Array.from(e.target.files);
        const updatedLyrics = [...lyrics];
        updatedLyrics[index].docxFiles = [...new Set([...updatedLyrics[index].docxFiles, ...files].map(f => f.name))].map(name => files.find(f => f.name === name) || updatedLyrics[index].docxFiles.find(f => f.name === name));
        setLyrics(updatedLyrics);

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                const arrayBuffer = reader.result;
                mammoth.extractRawText({ arrayBuffer })
                    .then((result) => {
                        const extractedText = result.value;
                        const lyricsLines = parseDocxText(extractedText);
                        updateLyricsWithDocx(index, lyricsLines);
                    })
                    .catch((err) => console.log("Error parsing DOCX:", err));
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const parseDocxText = (text) => {
        const lines = text.split("\n").filter(line => line.trim() !== "");
        const parsedLyrics = lines.map(line => {
            const parts = line.split(":");
            if (parts.length >= 2) {
                const [section, ...rest] = parts;
                const [lyric, chord = ""] = rest.join(":").split(" ");
                return { section: section.trim(), lyric: lyric.trim(), chord: chord.trim() };
            }
            return { section: "", lyric: line.trim(), chord: "" };
        });
        return parsedLyrics;
    };

    const updateLyricsWithDocx = (index, parsedLyrics) => {
        const updatedLyrics = [...lyrics];
        if (parsedLyrics[0]) {
            updatedLyrics[index] = {
                ...updatedLyrics[index],
                section: parsedLyrics[0].section || updatedLyrics[index].section,
                lyric: parsedLyrics[0].lyric || updatedLyrics[index].lyric,
                chord: parsedLyrics[0].chord || updatedLyrics[index].chord
            };
            setLyrics(updatedLyrics);
        }
    };

    const handleLyricsChange = (index, field, value) => {
        const updatedLyrics = [...lyrics];
        updatedLyrics[index][field] = value;
        setLyrics(updatedLyrics);
    };

    const addLine = () => {
        setLyrics([...lyrics, { section: "", lyric: "", chord: "", docxFiles: [] }]);
    };

    const removeLine = (index) => {
        setLyrics(lyrics.filter((_, i) => i !== index));
    };

    const copyLine = (index) => {
        const newLine = {
            section: lyrics[index].section,
            lyric: lyrics[index].lyric,
            chord: lyrics[index].chord,
            docxFiles: []
        };
        setLyrics([...lyrics, newLine]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!songName.trim()) {
            alert("Song title is required.");
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append("songName", songName);
        formData.append("selectedInstrument", selectedInstrument);
        formData.append("lyrics", JSON.stringify(lyrics.map(({ section, lyric, chord }) => ({ section, lyrics: lyric, chord }))));

        chordDiagrams.forEach((file) => {
            formData.append("chordDiagrams", file);
        });

        lyrics.forEach((lyric) => {
            lyric.docxFiles.forEach((file) => {
                formData.append("docxFiles", file);
            });
        });

        try {
            const response = await axios.post("https://localhost:3000/api/songs/create", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200 || response.status === 201) {
                alert("Chords Added Successfully!");
                setSongName("");
                setLyrics([{ section: "", lyric: "", chord: "", docxFiles: [] }]);
                setChordDiagrams([]);
            }
        } catch (error) {
            console.error("Error submitting chord data:", error);
            alert("An error occurred while adding the chord.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSection = () => {
        setIsOpen(!isOpen);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            setChordDiagrams((prevFiles) => [...new Set([...prevFiles, ...files].map(f => f.name))].map(name => files.find(f => f.name === name) || prevFiles.find(f => f.name === name)));
        }
    };

    const removeFile = (fileName) => {
        setChordDiagrams(chordDiagrams.filter(file => file.name !== fileName));
    };

    const getInstrumentIcon = (instrument) => {
        switch (instrument) {
            case 'ukulele': return '🎸';
            case 'guitar': return '🎸';
            case 'piano': return '🎹';
            default: return '🎵';
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
            <AdminSidebar />
            <div className="flex-1 flex justify-center items-center p-4">
                <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 p-6 text-white">
                        <h2 className="text-3xl font-bold mb-2">Add New Chord</h2>
                        <p className="text-purple-100 dark:text-purple-200">Create beautiful chord charts for your favorite songs</p>
                    </div>

                    {/* Main Content with Scroll */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Song Title */}
                            <div className="group">
                                <label className="flex items-center text-gray-700 dark:text-gray-300 font-semibold mb-3">
                                    <i className="fas fa-file-audio mr-2 text-purple-500"></i>
                                    Song Title
                                </label>
                                <input
                                    type="text"
                                    value={songName}
                                    onChange={(e) => setSongName(e.target.value)}
                                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm dark:bg-gray-700 dark:text-gray-300 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 bg-white/50 dark:bg-gray-700/50"
                                    placeholder="Enter the song title..."
                                />
                            </div>

                            {/* Instrument Selection */}
                            <div className="group">
                                <label className="flex items-center text-gray-700 dark:text-gray-300 font-semibold mb-3">
                                    <i className="fas fa-guitar mr-2 text-purple-500"></i>
                                    Select Instrument
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedInstrument}
                                        onChange={handleInstrumentChange}
                                        className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-gray-300 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 bg-white/50 dark:bg-gray-700/50 appearance-none cursor-pointer"
                                    >
                                        <option value="ukulele">🎸 Ukulele</option>
                                        <option value="guitar">🎸 Guitar</option>
                                        <option value="piano">🎹 Piano</option>
                                    </select>
                                    <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                                </div>
                            </div>

                            {/* Chord Diagrams Upload */}
                            <div className="group">
                                <label className="flex items-center text-gray-700 dark:text-gray-300 font-semibold mb-3">
                                    <i className="fas fa-images mr-2 text-purple-500"></i>
                                    Chord Diagrams
                                </label>
                                <div 
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                                        dragOver 
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                                            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleChordDiagramUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center">
                                        <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                                            Drop images here or click to browse
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                            PNG, JPG, JPEG up to 10MB each
                                        </p>
                                    </div>
                                </div>
                                
                                {chordDiagrams.length > 0 && (
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {chordDiagrams.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                                <div className="flex items-center">
                                                    <i className="fas fa-image text-purple-500 mr-2"></i>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                        {file.name}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(file.name)}
                                                    className="text-red-500 hover:text-red-700 ml-2"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Lyrics and Chords Section */}
                            <div className="group">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="flex items-center text-xl font-semibold text-gray-800 dark:text-gray-200">
                                        <i className="fas fa-music mr-2 text-purple-500"></i>
                                        Lyrics and Chords
                                    </h2>
                                    <button 
                                        type="button"
                                        onClick={toggleSection} 
                                        className="flex items-center px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-200"
                                    >
                                        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} mr-2`}></i>
                                        {isOpen ? 'Collapse' : 'Expand'}
                                    </button>
                                </div>

                                <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {isOpen && (
                                        <div className="space-y-4">
                                            {lyrics.map((item, index) => (
                                                <div key={index} className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                                            Section {index + 1}
                                                        </span>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => copyLine(index)}
                                                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                                                                title="Copy section"
                                                            >
                                                                <i className="fas fa-copy"></i>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeLine(index)}
                                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                                                title="Remove section"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <input
                                                            type="text"
                                                            value={item.section}
                                                            onChange={(e) => handleLyricsChange(index, "section", e.target.value)}
                                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-gray-300 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                                                            placeholder="Section title (e.g., Verse 1, Chorus, Bridge)"
                                                        />
                                                        
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept=".docx"
                                                                multiple
                                                                onChange={(e) => handleDocxUpload(e, index)}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            />
                                                            <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 transition-colors duration-200">
                                                                <i className="fas fa-file-word text-blue-500 mr-2"></i>
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    Upload DOCX files for this section
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {item.docxFiles && item.docxFiles.length > 0 && (
                                                            <div className="space-y-2">
                                                                {item.docxFiles.map((file, idx) => (
                                                                    <div key={idx} className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                                        <i className="fas fa-file-word text-blue-500 mr-2"></i>
                                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                            {file.name}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={addLine}
                                                className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                                            >
                                                <i className="fas fa-plus mr-2"></i>
                                                Add New Section
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-6">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save mr-2"></i>
                                            Save Chord Chart
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddChord;