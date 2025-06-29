// 钢琴核心功能
class Piano {
    constructor() {
        this.piano = document.getElementById('piano');
        this.pressedKeys = new Set();
        this.keyboardToNoteMap = {};
        this.activeMouseKey = null;
        this.scrollContainer = document.querySelector('.scroll-container');
        
        // 配置变量
        this.keyboardSizeRatio = parseFloat(localStorage.getItem('keyboardSizeRatio')) || 1.2;
        this.showKeyboardMapping = localStorage.getItem('showKeyboardMapping') !== 'false';
        this.currentNoteDisplayMode = localStorage.getItem('noteDisplayMode') || 'full';
        this.currentKeyEffectMode = localStorage.getItem('keyEffectMode') || 'colorAndAnimation';
        this.currentVolume = parseFloat(localStorage.getItem('currentVolume')) || 1.0;
        
        // 键的尺寸
        this.BASE_WHITE_KEY_WIDTH = 48;
        this.BASE_BLACK_KEY_WIDTH = 28;
        this.BASE_BLACK_KEY_OFFSET = this.BASE_WHITE_KEY_WIDTH - 0.5 * this.BASE_BLACK_KEY_WIDTH;
        this.PIANO_HORIZONTAL_PADDING = 13.5;
        
        // 激活颜色
        this.activeColors = ['#FF6B6B', '#FFA07A', '#FFD54F', '#62D2A2', '#007bff', '#A06CD5', '#FF8AD8'];
        
        // 音符顺序
        this.semiToneOrder = [
            'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2',
            'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
            'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
            'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
            'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6'
        ];
        
        this.init();
    }
    
    init() {
        this.generatePianoKeys();
        this.bindEvents();
    }
    
    getScaledDimensions() {
        return {
            whiteKeyWidth: this.BASE_WHITE_KEY_WIDTH * this.keyboardSizeRatio,
            blackKeyWidth: this.BASE_BLACK_KEY_WIDTH * this.keyboardSizeRatio,
            blackKeyOffset: this.BASE_BLACK_KEY_OFFSET * this.keyboardSizeRatio
        };
    }
    
    getRandomActiveColor() {
        const randomIndex = Math.floor(Math.random() * this.activeColors.length);
        return this.activeColors[randomIndex];
    }
    
    async generatePianoKeys() {
        const noteMappingData = await window.preload.getNoteMapping();
        if (!noteMappingData || noteMappingData.length === 0) {
            console.error("无法从 preload.js 加载音符映射数据。");
            this.piano.innerHTML = "<p>无法加载钢琴音符映射，请检查 preload.js。</p>";
            return;
        }

        this.piano.innerHTML = '';

        const musicalNoteNameToDataMap = new Map();
        noteMappingData.forEach(note => {
            musicalNoteNameToDataMap.set(note.name, note);
        });

        const whiteKeyLayoutInfo = new Map();
        let currentWhiteKeyLeftOffset = 0;

        // 生成白键
        for (const musicalNoteName of this.semiToneOrder) {
            const noteData = musicalNoteNameToDataMap.get(musicalNoteName);
            if (!noteData || noteData.type !== 'white') continue;

            const dimensions = this.getScaledDimensions();
            const keyDiv = this.createKeyElement(noteData, dimensions.whiteKeyWidth, 'white');
            keyDiv.style.left = `${currentWhiteKeyLeftOffset + this.PIANO_HORIZONTAL_PADDING}px`;
            this.piano.appendChild(keyDiv);

            whiteKeyLayoutInfo.set(noteData.name, {
                leftPos: currentWhiteKeyLeftOffset + this.PIANO_HORIZONTAL_PADDING
            });

            currentWhiteKeyLeftOffset += dimensions.whiteKeyWidth;
        }

        this.piano.style.width = `${currentWhiteKeyLeftOffset + (2 * this.PIANO_HORIZONTAL_PADDING)}px`;

        // 初始滚动到中心
        if (this.scrollContainer && this.scrollContainer.scrollWidth > this.scrollContainer.clientWidth) {
            this.scrollContainer.scrollLeft = (this.scrollContainer.scrollWidth - this.scrollContainer.clientWidth) / 2;
        }

        // 生成黑键
        for (const musicalNoteName of this.semiToneOrder) {
            const noteData = musicalNoteNameToDataMap.get(musicalNoteName);
            if (!noteData || noteData.type !== 'black') continue;

            const dimensions = this.getScaledDimensions();
            const keyDiv = this.createKeyElement(noteData, dimensions.blackKeyWidth, 'black');

            const blackNoteMusicalBase = musicalNoteName.slice(0, 2);
            const blackNoteOctave = musicalNoteName.slice(-1);

            let precedingWhiteNoteName;
            switch (blackNoteMusicalBase) {
                case 'C#': precedingWhiteNoteName = 'C' + blackNoteOctave; break;
                case 'D#': precedingWhiteNoteName = 'D' + blackNoteOctave; break;
                case 'F#': precedingWhiteNoteName = 'F' + blackNoteOctave; break;
                case 'G#': precedingWhiteNoteName = 'G' + blackNoteOctave; break;
                case 'A#': precedingWhiteNoteName = 'A' + blackNoteOctave; break;
                default: continue;
            }

            const associatedWhiteKeyInfo = whiteKeyLayoutInfo.get(precedingWhiteNoteName);
            if (associatedWhiteKeyInfo) {
                const whiteKeyLeft = associatedWhiteKeyInfo.leftPos;
                const blackKeyComputedLeft = whiteKeyLeft + dimensions.blackKeyOffset;
                keyDiv.style.left = `${blackKeyComputedLeft}px`;
                this.piano.appendChild(keyDiv);
            }
        }

        this.assignKeyboardShortcuts(noteMappingData);
    }
    
    createKeyElement(noteData, width, type) {
        const keyDiv = document.createElement('div');
        keyDiv.classList.add('key', type);
        keyDiv.dataset.note = noteData.url.replace('.mp3', '');
        keyDiv.dataset.key = noteData.key.toLowerCase().replace(/<br>/g, '').replace(/\s/g, '');
        keyDiv.style.width = `${width}px`;

        let noteText = '';
        if (this.currentNoteDisplayMode === 'full') {
            noteText = `${noteData.name}`;
        } else if (this.currentNoteDisplayMode === 'nameOnly') {
            noteText = `${noteData.name.replace(/[0-9]/g, '')}`;
        }

        if (noteData.name === 'C4' && this.currentNoteDisplayMode !== 'none') {
            noteText = '中央C<br/>' + noteText;
        }

        noteText += '<br/>';
        if (this.showKeyboardMapping && noteData.key) {
            noteText += `<span class="keyboard-mapping">${noteData.key}</span>`;
        }

        keyDiv.innerHTML = noteText;
        return keyDiv;
    }
    
    assignKeyboardShortcuts(mapping) {
        this.keyboardToNoteMap = {};
        mapping.forEach(note => {
            const cleanedKey = note.key.toLowerCase().replace(/<br>/g, '').replace(/\s/g, '');
            this.keyboardToNoteMap[cleanedKey] = note.url.replace('.mp3', '');
        });
    }
    
    playKey(key, isMouseClick = false) {
        const applyColor = this.currentKeyEffectMode === 'colorAndAnimation' || this.currentKeyEffectMode === 'colorOnly';
        const applyAnimation = this.currentKeyEffectMode === 'colorAndAnimation';

        if (isMouseClick && this.activeMouseKey && this.activeMouseKey !== key) {
            this.activeMouseKey.classList.remove('active');
            this.activeMouseKey.style.backgroundColor = '';
        }

        if (applyColor) {
            key.classList.add('active');
            const activeColor = this.getRandomActiveColor();
            key.style.backgroundColor = activeColor;
        } else {
            key.classList.add('active');
        }

        window.preload.playNote(key.dataset.note, this.currentVolume);

        if (isMouseClick) {
            this.activeMouseKey = key;
        }

        if (applyAnimation) {
            this.createFlyingNote(key, key.style.backgroundColor);
        }
    }
    
    releaseKey(key) {
        key.classList.remove('active');
        key.style.backgroundColor = '';
        if (this.activeMouseKey === key) {
            this.activeMouseKey = null;
        }
    }
    
    createFlyingNote(keyElement, color) {
        const flyingNote = document.createElement('div');
        flyingNote.classList.add('flying-note');
        flyingNote.textContent = '♪';
        flyingNote.style.color = color;

        const keyRect = keyElement.getBoundingClientRect();
        const leftOffset = keyRect.left + keyRect.width / 2;
        const topOffset = keyRect.top;

        flyingNote.style.left = `${leftOffset}px`;
        flyingNote.style.top = `${topOffset}px`;
        flyingNote.style.transform = `translateX(-50%)`;

        document.body.appendChild(flyingNote);
        void flyingNote.offsetWidth;
        flyingNote.style.animation = 'fly-up 4s ease-out forwards';

        flyingNote.addEventListener('animationend', () => {
            flyingNote.remove();
        });
    }
    
    bindEvents() {
        // 鼠标事件
        this.piano.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                const key = e.target.closest('.key');
                if (key) {
                    this.playKey(key, true);
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.activeMouseKey) {
                this.releaseKey(this.activeMouseKey);
            }
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (!e.repeat) {
                let keyChar;
                if (e.shiftKey && e.key !== 'Shift') {
                    if (e.code.startsWith('Digit')) {
                        const digit = e.code.replace('Digit', '');
                        keyChar = '⇧+' + digit;
                    } else {
                        keyChar = '⇧+' + e.key.toLowerCase();
                    }
                } else if (e.key === 'Shift') {
                    return;
                } else {
                    keyChar = e.key.toLowerCase();
                }

                const targetNoteFileName = this.keyboardToNoteMap[keyChar];
                if (targetNoteFileName && !this.pressedKeys.has(keyChar)) {
                    const pianoKey = document.querySelector(`.key[data-note="${targetNoteFileName}"]`);
                    if (pianoKey) {
                        this.playKey(pianoKey);
                        this.pressedKeys.add(keyChar);
                        e.preventDefault();
                    }
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') {
                const shiftKeys = Array.from(this.pressedKeys).filter(key => key.startsWith('⇧+'));
                shiftKeys.forEach(shiftKey => {
                    const targetNoteFileName = this.keyboardToNoteMap[shiftKey];
                    if (targetNoteFileName) {
                        const pianoKey = document.querySelector(`.key[data-note="${targetNoteFileName}"]`);
                        if (pianoKey) {
                            this.releaseKey(pianoKey);
                            this.pressedKeys.delete(shiftKey);
                        }
                    }
                });
                return;
            }

            let keyChar = e.key.toLowerCase();
            let shiftKeyChar;
            if (e.code && e.code.startsWith('Digit')) {
                const digit = e.code.replace('Digit', '');
                shiftKeyChar = '⇧+' + digit;
            } else {
                shiftKeyChar = '⇧+' + e.key.toLowerCase();
            }

            if (this.pressedKeys.has(shiftKeyChar)) {
                keyChar = shiftKeyChar;
            }

            const targetNoteFileName = this.keyboardToNoteMap[keyChar];
            if (targetNoteFileName) {
                const pianoKey = document.querySelector(`.key[data-note="${targetNoteFileName}"]`);
                if (pianoKey) {
                    this.releaseKey(pianoKey);
                    this.pressedKeys.delete(keyChar);
                }
            }
        });
    }
    

    
    findKeyByNote(noteName) {
        const fileName = noteName.replace('#', 's');
        return document.querySelector(`.key[data-note="${fileName}"]`);
    }
}