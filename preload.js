const { contextBridge } = require('electron'); 
const path = require('path');
const { Howl, Howler } = require('howler');

// 定义音符映射数据
const noteMapping = [
  {id: 1, name: 'C2', keyCode: '49', key: '1', url: 'C2.mp3', type: 'white'},
  {id: 2, name: 'D2', keyCode: '50', key: '2', url: 'D2.mp3', type: 'white'},
  {id: 3, name: 'E2', keyCode: '51', key: '3', url: 'E2.mp3', type: 'white'},
  {id: 4, name: 'F2', keyCode: '52', key: '4', url: 'F2.mp3', type: 'white'},
  {id: 5, name: 'G2', keyCode: '53', key: '5', url: 'G2.mp3', type: 'white'},
  {id: 6, name: 'A2', keyCode: '54', key: '6', url: 'A2.mp3', type: 'white'},
  {id: 7, name: 'B2', keyCode: '55', key: '7', url: 'B2.mp3', type: 'white'},
  {id: 8, name: 'C3', keyCode: '56', key: '8', url: 'C3.mp3', type: 'white'},
  {id: 9, name: 'D3', keyCode: '57', key: '9', url: 'D3.mp3', type: 'white'},
  {id: 10, name: 'E3', keyCode: '48', key: '0', url: 'E3.mp3', type: 'white'},
  {id: 26, name: 'F3', keyCode: '81', key: 'Q', url: 'F3.mp3', type: 'white'},
  {id: 32, name: 'G3', keyCode: '87', key: 'W', url: 'G3.mp3', type: 'white'},
  {id: 14, name: 'A3', keyCode: '69', key: 'E', url: 'A3.mp3', type: 'white'},
  {id: 27, name: 'B3', keyCode: '82', key: 'R', url: 'B3.mp3', type: 'white'},
  {id: 29, name: 'C4', keyCode: '84', key: 'T', url: 'C4.mp3', type: 'white'},
  {id: 34, name: 'D4', keyCode: '89', key: 'Y', url: 'D4.mp3', type: 'white'},
  {id: 30, name: 'E4', keyCode: '85', key: 'U', url: 'E4.mp3', type: 'white'},
  {id: 18, name: 'F4', keyCode: '73', key: 'I', url: 'F4.mp3', type: 'white'},
  {id: 24, name: 'G4', keyCode: '79', key: 'O', url: 'G4.mp3', type: 'white'},
  {id: 25, name: 'A4', keyCode: '80', key: 'P', url: 'A4.mp3', type: 'white'},
  {id: 10, name: 'B4', keyCode: '65', key: 'A', url: 'B4.mp3', type: 'white'},
  {id: 28, name: 'C5', keyCode: '83', key: 'S', url: 'C5.mp3', type: 'white'},
  {id: 13, name: 'D5', keyCode: '68', key: 'D', url: 'D5.mp3', type: 'white'},
  {id: 15, name: 'E5', keyCode: '70', key: 'F', url: 'E5.mp3', type: 'white'},
  {id: 16, name: 'F5', keyCode: '71', key: 'G', url: 'F5.mp3', type: 'white'},
  {id: 17, name: 'G5', keyCode: '72', key: 'H', url: 'G5.mp3', type: 'white'},
  {id: 19, name: 'A5', keyCode: '74', key: 'J', url: 'A5.mp3', type: 'white'},
  {id: 20, name: 'B5', keyCode: '75', key: 'K', url: 'B5.mp3', type: 'white'},
  {id: 21, name: 'C6', keyCode: '76', key: 'L', url: 'C6.mp3', type: 'white'},
  {id: 35, name: 'D6', keyCode: '90', key: 'Z', url: 'D6.mp3', type: 'white'},
  {id: 33, name: 'E6', keyCode: '88', key: 'X', url: 'E6.mp3', type: 'white'},
  {id: 12, name: 'F6', keyCode: '67', key: 'C', url: 'F6.mp3', type: 'white'},
  {id: 31, name: 'G6', keyCode: '86', key: 'V', url: 'G6.mp3', type: 'white'},
  {id: 11, name: 'A6', keyCode: '66', key: 'B', url: 'A6.mp3', type: 'white'},
  {id: 23, name: 'B6', keyCode: '78', key: 'N', url: 'B6.mp3', type: 'white'},
  {id: 22, name: 'C7', keyCode: '77', key: 'M', url: 'C7.mp3', type: 'white'},

  {id: 36, name: 'C#2', keyCode: 'b49', key: '⇧+1', url: 'Cs2.mp3', type: 'black'},
  {id: 37, name: 'D#2', keyCode: 'b50', key: '⇧+2', url: 'Ds2.mp3', type: 'black'},
  {id: 38, name: 'F#2', keyCode: 'b52', key: '⇧+4', url: 'Fs2.mp3', type: 'black'},
  {id: 39, name: 'G#2', keyCode: 'b53', key: '⇧+5', url: 'Gs2.mp3', type: 'black'},
  {id: 40, name: 'A#2', keyCode: 'b54', key: '⇧+6', url: 'As2.mp3', type: 'black'},
  {id: 41, name: 'C#3', keyCode: 'b56', key: '⇧+8', url: 'Cs3.mp3', type: 'black'},
  {id: 42, name: 'D#3', keyCode: 'b57', key: '⇧+9', url: 'Ds3.mp3', type: 'black'},
  {id: 43, name: 'F#3', keyCode: 'b81', key: '⇧+Q', url: 'Fs3.mp3', type: 'black'},
  {id: 44, name: 'G#3', keyCode: 'b87', key: '⇧+W', url: 'Gs3.mp3', type: 'black'},
  {id: 45, name: 'A#3', keyCode: 'b69', key: '⇧+E', url: 'As3.mp3', type: 'black'},
  {id: 46, name: 'C#4', keyCode: 'b84', key: '⇧+T', url: 'Cs4.mp3', type: 'black'},
  {id: 47, name: 'D#4', keyCode: 'b89', key: '⇧+Y', url: 'Ds4.mp3', type: 'black'},
  {id: 48, name: 'F#4', keyCode: 'b73', key: '⇧+I', url: 'Fs4.mp3', type: 'black'},
  {id: 49, name: 'G#4', keyCode: 'b79', key: '⇧+O', url: 'Gs4.mp3', type: 'black'},
  {id: 50, name: 'A#4', keyCode: 'b80', key: '⇧+P', url: 'As4.mp3', type: 'black'},
  {id: 51, name: 'C#5', keyCode: 'b83', key: '⇧+S', url: 'Cs5.mp3', type: 'black'},
  {id: 52, name: 'D#5', keyCode: 'b68', key: '⇧+D', url: 'Ds5.mp3', type: 'black'},
  {id: 53, name: 'F#5', keyCode: 'b71', key: '⇧+G', url: 'Fs5.mp3', type: 'black'},
  {id: 54, name: 'G#5', keyCode: 'b72', key: '⇧+H', url: 'Gs5.mp3', type: 'black'},
  {id: 55, name: 'A#5', keyCode: 'b74', key: '⇧+J', url: 'As5.mp3', type: 'black'},
  {id: 56, name: 'C#6', keyCode: 'b76', key: '⇧+L', url: 'Cs6.mp3', type: 'black'},
  {id: 57, name: 'D#6', keyCode: 'b90', key: '⇧+Z', url: 'Ds6.mp3', type: 'black'},
  {id: 58, name: 'F#6', keyCode: 'b67', key: '⇧+C', url: 'Fs6.mp3', type: 'black'},
  {id: 59, name: 'G#6', keyCode: 'b86', key: '⇧+V', url: 'Gs6.mp3', type: 'black'},
  {id: 60, name: 'A#6', keyCode: 'b66', key: '⇧+B', url: 'As6.mp3', type: 'black'},
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

const api = {
  playNote: playNote,
  getNoteMapping: getNoteMapping,
  setGlobalVolume: setGlobalVolume,
};

try {
  // 尝试使用现代的 contextBridge API
  console.log("Attempting to use contextBridge...");
  contextBridge.exposeInMainWorld('preload', api);
  console.log("contextBridge succeeded.");
} catch (error) {
  // 如果失败（比如在旧的、contextIsolation=false 的环境中），回退到旧方法
  console.warn("contextBridge failed, falling back to legacy window exposure. Error:", error.message);
  window.preload = api;
}