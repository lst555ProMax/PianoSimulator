const path = require('path');
const { Howl, Howler } = require('howler');

// 定义音符映射数据
const noteMapping = [
  {id: 1, name: 'C2', keyCode: '49', key: '1', url: 'a49.mp3', type: 'white'},
  {id: 2, name: 'D2', keyCode: '50', key: '2', url: 'a50.mp3', type: 'white'},
  {id: 3, name: 'E2', keyCode: '51', key: '3', url: 'a51.mp3', type: 'white'},
  {id: 4, name: 'F2', keyCode: '52', key: '4', url: 'a52.mp3', type: 'white'},
  {id: 5, name: 'G2', keyCode: '53', key: '5', url: 'a53.mp3', type: 'white'},
  {id: 6, name: 'A2', keyCode: '54', key: '6', url: 'a54.mp3', type: 'white'},
  {id: 7, name: 'B2', keyCode: '55', key: '7', url: 'a55.mp3', type: 'white'},
  {id: 8, name: 'C3', keyCode: '56', key: '8', url: 'a56.mp3', type: 'white'},
  {id: 9, name: 'D3', keyCode: '57', key: '9', url: 'a57.mp3', type: 'white'},
  {id: 10, name: 'E3', keyCode: '48', key: '0', url: 'a48.mp3', type: 'white'},
  {id: 26, name: 'F3', keyCode: '81', key: 'Q', url: 'a81.mp3', type: 'white'},
  {id: 32, name: 'G3', keyCode: '87', key: 'W', url: 'a87.mp3', type: 'white'},
  {id: 14, name: 'A3', keyCode: '69', key: 'E', url: 'a69.mp3', type: 'white'},
  {id: 27, name: 'B3', keyCode: '82', key: 'R', url: 'a82.mp3', type: 'white'},
  {id: 29, name: 'C4', keyCode: '84', key: 'T', url: 'a84.mp3', type: 'white'},
  {id: 34, name: 'D4', keyCode: '89', key: 'Y', url: 'a89.mp3', type: 'white'},
  {id: 30, name: 'E4', keyCode: '85', key: 'U', url: 'a85.mp3', type: 'white'},
  {id: 18, name: 'F4', keyCode: '73', key: 'I', url: 'a73.mp3', type: 'white'},
  {id: 24, name: 'G4', keyCode: '79', key: 'O', url: 'a79.mp3', type: 'white'},
  {id: 25, name: 'A4', keyCode: '80', key: 'P', url: 'a80.mp3', type: 'white'},
  {id: 10, name: 'B4', keyCode: '65', key: 'A', url: 'a65.mp3', type: 'white'},
  {id: 28, name: 'C5', keyCode: '83', key: 'S', url: 'a83.mp3', type: 'white'},
  {id: 13, name: 'D5', keyCode: '68', key: 'D', url: 'a68.mp3', type: 'white'},
  {id: 15, name: 'E5', keyCode: '70', key: 'F', url: 'a70.mp3', type: 'white'},
  {id: 16, name: 'F5', keyCode: '71', key: 'G', url: 'a71.mp3', type: 'white'},
  {id: 17, name: 'G5', keyCode: '72', key: 'H', url: 'a72.mp3', type: 'white'},
  {id: 19, name: 'A5', keyCode: '74', key: 'J', url: 'a74.mp3', type: 'white'},
  {id: 20, name: 'B5', keyCode: '75', key: 'K', url: 'a75.mp3', type: 'white'},
  {id: 21, name: 'C6', keyCode: '76', key: 'L', url: 'a76.mp3', type: 'white'},
  {id: 35, name: 'D6', keyCode: '90', key: 'Z', url: 'a90.mp3', type: 'white'},
  {id: 33, name: 'E6', keyCode: '88', key: 'X', url: 'a88.mp3', type: 'white'},
  {id: 12, name: 'F6', keyCode: '67', key: 'C', url: 'a67.mp3', type: 'white'},
  {id: 31, name: 'G6', keyCode: '86', key: 'V', url: 'a86.mp3', type: 'white'},
  {id: 11, name: 'A6', keyCode: '66', key: 'B', url: 'a66.mp3', type: 'white'},
  {id: 23, name: 'B6', keyCode: '78', key: 'N', url: 'a78.mp3', type: 'white'},
  {id: 22, name: 'C7', keyCode: '77', key: 'M', url: 'a77.mp3', type: 'white'},

  {id: 36, name: 'C#2', keyCode: 'b49', key: '⇧+1', url: 'b49.mp3', type: 'black'},
  {id: 37, name: 'D#2', keyCode: 'b50', key: '⇧+2', url: 'b50.mp3', type: 'black'},
  {id: 38, name: 'F#2', keyCode: 'b52', key: '⇧+4', url: 'b52.mp3', type: 'black'},
  {id: 39, name: 'G#2', keyCode: 'b53', key: '⇧+5', url: 'b53.mp3', type: 'black'},
  {id: 40, name: 'A#2', keyCode: 'b54', key: '⇧+6', url: 'b54.mp3', type: 'black'},
  {id: 41, name: 'C#3', keyCode: 'b56', key: '⇧+8', url: 'b56.mp3', type: 'black'},
  {id: 42, name: 'D#3', keyCode: 'b57', key: '⇧+9', url: 'b57.mp3', type: 'black'},
  {id: 43, name: 'F#3', keyCode: 'b81', key: '⇧+Q', url: 'b81.mp3', type: 'black'},
  {id: 44, name: 'G#3', keyCode: 'b87', key: '⇧+W', url: 'b87.mp3', type: 'black'},
  {id: 45, name: 'A#3', keyCode: 'b69', key: '⇧+E', url: 'b69.mp3', type: 'black'},
  {id: 46, name: 'C#4', keyCode: 'b84', key: '⇧+T', url: 'b84.mp3', type: 'black'},
  {id: 47, name: 'D#4', keyCode: 'b89', key: '⇧+Y', url: 'b89.mp3', type: 'black'},
  {id: 48, name: 'F#4', keyCode: 'b73', key: '⇧+I', url: 'b73.mp3', type: 'black'},
  {id: 49, name: 'G#4', keyCode: 'b79', key: '⇧+O', url: 'b79.mp3', type: 'black'},
  {id: 50, name: 'A#4', keyCode: 'b80', key: '⇧+P', url: 'b80.mp3', type: 'black'},
  {id: 51, name: 'C#5', keyCode: 'b83', key: '⇧+S', url: 'b83.mp3', type: 'black'},
  {id: 52, name: 'D#5', keyCode: 'b68', key: '⇧+D', url: 'b68.mp3', type: 'black'},
  {id: 53, name: 'F#5', keyCode: 'b71', key: '⇧+G', url: 'b71.mp3', type: 'black'},
  {id: 54, name: 'G#5', keyCode: 'b72', key: '⇧+H', url: 'b72.mp3', type: 'black'},
  {id: 55, name: 'A#5', keyCode: 'b74', key: '⇧+J', url: 'b74.mp3', type: 'black'},
  {id: 56, name: 'C#6', keyCode: 'b76', key: '⇧+L', url: 'b76.mp3', type: 'black'},
  {id: 57, name: 'D#6', keyCode: 'b90', key: '⇧+Z', url: 'b90.mp3', type: 'black'},
  {id: 58, name: 'F#6', keyCode: 'b67', key: '⇧+C', url: 'b67.mp3', type: 'black'},
  {id: 59, name: 'G#6', keyCode: 'b86', key: '⇧+V', url: 'b86.mp3', type: 'black'},
  {id: 60, name: 'A#6', keyCode: 'b66', key: '⇧+B', url: 'b66.mp3', type: 'black'},
];

// A map to store pre-loaded audio Howl objects
const notesAudio = {};

// Function to load all audio files.
function loadAllNotes() {
  const fs = require('fs');
  const sampleDir = path.join(__dirname, 'samples', 'piano');

  try {
    noteMapping.forEach(note => {
      const filePath = path.join(sampleDir, note.url);
      if (fs.existsSync(filePath)) {
        notesAudio[note.url.replace('.mp3', '')] = new Howl({
          src: [filePath],
        });
      } else {
        console.warn(`Audio file not found: ${filePath}`);
      }
    });
    console.log("Audio files loaded:", Object.keys(notesAudio));
  } catch (error) {
    console.error("Error loading audio files from path:", sampleDir, error);
  }
}

// Load notes when the preload script runs
loadAllNotes();

// Function to play a specific note
function playNote(noteFileNameWithoutExtension, volume = 1.0) {
  if (notesAudio[noteFileNameWithoutExtension]) {
    const sound = notesAudio[noteFileNameWithoutExtension];
    sound.volume(volume); // 设置单个音符的音量
    sound.play();
  } else {
    console.warn(`Note ${noteFileNameWithoutExtension} not found or not loaded.`);
  }
}

// 新增：设置全局音量函数
function setGlobalVolume(volume) {
    Howler.volume(volume); // 使用 Howler.js 的全局音量控制
}

// Function to get the list of all loaded notes (now from noteMapping)
function getNoteMapping() {
  return noteMapping;
}

// Expose functions to the renderer process (index.html)
window.preload = {
  playNote: playNote,
  getNoteMapping: getNoteMapping,
  setGlobalVolume: setGlobalVolume, // 暴露新的全局音量设置函数
}; 