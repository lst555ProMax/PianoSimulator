// MIDI功能类
class MidiPlayer {
    constructor(piano) {
        this.piano = piano;
        this.midiData = null;
        this.playback = {
            isPlaying: false,
            isPaused: false,
            currentTime: 0,
            pausedTime: 0,
            startTime: 0,
            events: [],
            timeoutIds: []
        };
        
        this.midiFileInput = document.getElementById('midiFileInput');
        this.midiLoadBtn = document.getElementById('midiLoadBtn');
        this.midiPlayBtn = document.getElementById('midiPlayBtn');
        this.midiStopBtn = document.getElementById('midiStopBtn');
        this.playbackSpeed = parseFloat(localStorage.getItem('midiPlaybackSpeed')) || 1.0;
        
        this.init();
    }
    
    init() {
        // 简单检查并绑定事件
        setTimeout(() => {
            console.log('MIDI解析器状态:', window.MidiParser ? '已加载' : '未加载');
            this.bindEvents();
        }, 100);
    }
    
    midiNoteToNoteName(midiNote) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midiNote / 12) - 1;
        const noteName = noteNames[midiNote % 12];
        return noteName + octave;
    }
    
    playMidiNote(midiNote, velocity = 127) {
        const noteName = this.midiNoteToNoteName(midiNote);
        const pianoKey = this.piano.findKeyByNote(noteName);
        
        if (pianoKey) {
            const volume = (velocity / 127) * this.piano.currentVolume;
            this.piano.playKey(pianoKey);
            window.preload.playNote(pianoKey.dataset.note, volume);
            
            setTimeout(() => {
                this.piano.releaseKey(pianoKey);
            }, 150);
        }
    }
    
    parseMidiFile(arrayBuffer) {
        try {
            console.log('开始MIDI解析，检查解析器...');
            console.log('MidiParser类型:', typeof window.MidiParser);
            console.log('MidiParser对象:', window.MidiParser);
            
            if (!window.MidiParser || typeof window.MidiParser.parse !== 'function') {
                console.error('MIDI解析器不可用，尝试使用内置解析器');
                return this.parseWithBuiltinParser(arrayBuffer);
            }
            
            console.log('使用外部MIDI解析器...');
            const midi = window.MidiParser.parse(new Uint8Array(arrayBuffer));
            console.log('解析结果:', midi);
            
            return this.extractEvents(midi);
        } catch (error) {
            console.error('外部解析器失败，尝试内置解析器:', error);
            return this.parseWithBuiltinParser(arrayBuffer);
        }
    }
    
    parseWithBuiltinParser(arrayBuffer) {
        try {
            console.log('使用内置MIDI解析器...');
            const view = new DataView(arrayBuffer);
            
            // 检查MIDI头部
            const header = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
            if (header !== 'MThd') {
                throw new Error('不是有效的MIDI文件');
            }
            
            // 读取基本信息
            const format = view.getUint16(8);
            const trackCount = view.getUint16(10);
            const timeDivision = view.getUint16(12);
            
            console.log(`MIDI信息: 格式${format}, ${trackCount}轨道, 时间分辨率${timeDivision}`);
            
            // 解析轨道数据
            const events = [];
            let offset = 14;
            
            for (let track = 0; track < trackCount && offset < arrayBuffer.byteLength; track++) {
                // 查找轨道头
                while (offset < arrayBuffer.byteLength - 8) {
                    const trackHeader = String.fromCharCode(
                        view.getUint8(offset), view.getUint8(offset + 1),
                        view.getUint8(offset + 2), view.getUint8(offset + 3)
                    );
                    if (trackHeader === 'MTrk') break;
                    offset++;
                }
                
                if (offset >= arrayBuffer.byteLength - 8) break;
                
                const trackLength = view.getUint32(offset + 4);
                offset += 8;
                const trackEnd = offset + trackLength;
                
                let currentTime = 0;
                let runningStatus = 0;
                
                while (offset < trackEnd && offset < arrayBuffer.byteLength) {
                    // 读取delta时间
                    let deltaTime = 0;
                    let byte;
                    do {
                        if (offset >= arrayBuffer.byteLength) break;
                        byte = view.getUint8(offset++);
                        deltaTime = (deltaTime << 7) | (byte & 0x7F);
                    } while (byte & 0x80);
                    
                    currentTime += deltaTime;
                    
                    if (offset >= arrayBuffer.byteLength) break;
                    
                    let status = view.getUint8(offset);
                    if (status < 0x80) {
                        status = runningStatus;
                        offset--;
                    } else {
                        runningStatus = status;
                    }
                    offset++;
                    
                    // Note On事件
                    if ((status & 0xF0) === 0x90) {
                        if (offset + 1 < arrayBuffer.byteLength) {
                            const note = view.getUint8(offset++);
                            const velocity = view.getUint8(offset++);
                            if (velocity > 0) {
                                events.push({
                                    time: currentTime,
                                    type: 'noteOn',
                                    note: note,
                                    velocity: velocity
                                });
                            }
                        }
                    }
                    // Note Off事件
                    else if ((status & 0xF0) === 0x80) {
                        offset += 2; // 跳过note和velocity
                    }
                    // 其他事件
                    else if (status === 0xFF) {
                        if (offset < arrayBuffer.byteLength) {
                            const metaType = view.getUint8(offset++);
                            let length = 0;
                            let lengthByte;
                            do {
                                if (offset >= arrayBuffer.byteLength) break;
                                lengthByte = view.getUint8(offset++);
                                length = (length << 7) | (lengthByte & 0x7F);
                            } while (lengthByte & 0x80);
                            offset += length;
                        }
                    } else {
                        // 跳过其他类型的事件
                        offset += 2;
                    }
                }
            }
            
            console.log(`内置解析器找到${events.length}个音符事件`);
            
            if (events.length === 0) {
                throw new Error('未找到有效的音符事件');
            }
            
            events.sort((a, b) => a.time - b.time);
            return { events, ticksPerQuarter: timeDivision || 480 };
        } catch (error) {
            console.error('内置解析器也失败:', error);
            alert(`MIDI解析失败: ${error.message}`);
            return null;
        }
    }
    
    extractEvents(midi) {
        if (!midi || !midi.track) {
            throw new Error('无效的MIDI文件格式');
        }
        
        const events = [];
        let detectedTempo = null;
        
        midi.track.forEach(track => {
            let currentTime = 0;
            if (track.event) {
                track.event.forEach(event => {
                    currentTime += event.deltaTime || 0;
                    
                    // 检测速度变化事件
                    if (event.type === 255 && event.metaType === 81 && event.data) {
                        const tempo = (event.data[0] << 16) | (event.data[1] << 8) | event.data[2];
                        const bpm = Math.round(60000000 / tempo);
                        console.log(`检测到速度变化: ${tempo}微秒/四分音符 = ${bpm} BPM`);
                        if (!detectedTempo) detectedTempo = tempo;
                    }
                    
                    // 处理音符开始事件
                    if (event.type === 9 && event.data && event.data[1] > 0) {
                        events.push({
                            time: currentTime,
                            type: 'noteOn',
                            note: event.data[0],
                            velocity: event.data[1]
                        });
                    }
                });
            }
        });
        
        if (events.length === 0) {
            throw new Error('未找到有效的音符事件');
        }
        
        events.sort((a, b) => a.time - b.time);
        const finalTempo = detectedTempo || 500000;
        const bpm = Math.round(60000000 / finalTempo);
        console.log(`解析成功，共${events.length}个音符事件，速度: ${bpm} BPM`);
        return { events, ticksPerQuarter: midi.timeDivision || 480, tempo: finalTempo };
    }
    
    play() {
        if (!this.midiData || this.midiData.events.length === 0) return;
        
        this.playback.isPlaying = true;
        this.playback.isPaused = false;
        
        if (this.playback.pausedTime === 0) {
            this.playback.startTime = Date.now();
        } else {
            this.playback.startTime = Date.now() - this.playback.pausedTime;
        }
        
        this.midiPlayBtn.textContent = '⏸️';
        this.midiStopBtn.disabled = false;
        
        // 使用检测到的或默认速度，并应用用户调节的倍率
        const baseTempo = this.midiData.tempo || 500000;
        const adjustedTempo = baseTempo / this.playbackSpeed; // 速度倍率越大，播放越快
        const msPerTick = adjustedTempo / 1000 / this.midiData.ticksPerQuarter;
        const currentPlayTime = this.playback.pausedTime;
        
        const bpm = Math.round(60000000 / adjustedTempo);
        console.log(`播放参数: 速度倍率=${this.playbackSpeed}x, 实际BPM=${bpm}, msPerTick=${msPerTick.toFixed(2)}`);
        
        this.midiData.events.forEach(event => {
            const eventTime = event.time * msPerTick;
            
            if (eventTime > currentPlayTime) {
                const delay = eventTime - currentPlayTime;
                const timeoutId = setTimeout(() => {
                    if (this.playback.isPlaying) {
                        this.playMidiNote(event.note, event.velocity);
                    }
                }, delay);
                this.playback.timeoutIds.push(timeoutId);
            }
        });
        
        const totalDuration = this.midiData.events[this.midiData.events.length - 1].time * msPerTick + 1000;
        if (totalDuration > currentPlayTime) {
            const endTimeoutId = setTimeout(() => {
                this.stop();
            }, totalDuration - currentPlayTime);
            this.playback.timeoutIds.push(endTimeoutId);
        }
    }
    
    pause() {
        if (this.playback.isPlaying) {
            this.playback.isPlaying = false;
            this.playback.isPaused = true;
            this.playback.pausedTime = Date.now() - this.playback.startTime;
            this.playback.timeoutIds.forEach(id => clearTimeout(id));
            this.playback.timeoutIds = [];
            this.midiPlayBtn.textContent = '▶️';
        }
    }
    
    stop() {
        this.playback.isPlaying = false;
        this.playback.isPaused = false;
        this.playback.pausedTime = 0;
        this.playback.timeoutIds.forEach(id => clearTimeout(id));
        this.playback.timeoutIds = [];
        this.midiPlayBtn.textContent = '▶️';
        this.midiStopBtn.disabled = true;
    }
    
    bindEvents() {
        this.midiLoadBtn.addEventListener('click', () => {
            this.midiFileInput.click();
        });

        this.midiFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.midiData = this.parseMidiFile(event.target.result);
                    if (this.midiData) {
                        this.midiPlayBtn.disabled = false;
                        alert(`MIDI文件加载成功！共${this.midiData.events.length}个音符事件`);
                    }
                };
                reader.readAsArrayBuffer(file);
            }
        });

        this.midiPlayBtn.addEventListener('click', () => {
            if (this.playback.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        });

        this.midiStopBtn.addEventListener('click', () => {
            this.stop();
        });
    }
    
    setPlaybackSpeed(speed) {
        const oldSpeed = this.playbackSpeed;
        this.playbackSpeed = speed;
        localStorage.setItem('midiPlaybackSpeed', speed.toString());
        console.log(`MIDI播放速度设置为: ${speed}x`);
        
        // 如果正在播放，重新计算并重启播放
        if (this.playback.isPlaying) {
            this.restartWithNewSpeed(oldSpeed, speed);
        }
    }
    
    getPlaybackSpeed() {
        return this.playbackSpeed;
    }
    
    restartWithNewSpeed(oldSpeed, newSpeed) {
        // 计算当前播放位置（使用tick作为基准单位）
        const currentRealTime = Date.now() - this.playback.startTime;
        const oldBaseTempo = this.midiData.tempo || 500000;
        const oldAdjustedTempo = oldBaseTempo / oldSpeed;
        const oldMsPerTick = oldAdjustedTempo / 1000 / this.midiData.ticksPerQuarter;
        
        // 计算当前tick位置
        const pausedTicks = this.playback.pausedTime / oldMsPerTick;
        const currentTicks = pausedTicks + (currentRealTime / oldMsPerTick);
        
        // 清除所有待执行的事件
        this.playback.timeoutIds.forEach(id => clearTimeout(id));
        this.playback.timeoutIds = [];
        
        // 使用新速度计算新的时间参数
        const newAdjustedTempo = oldBaseTempo / newSpeed;
        const newMsPerTick = newAdjustedTempo / 1000 / this.midiData.ticksPerQuarter;
        const newCurrentMidiTime = currentTicks * newMsPerTick;
        
        // 重新设置播放状态
        this.playback.pausedTime = newCurrentMidiTime;
        this.playback.startTime = Date.now();
        
        // 重新调度事件
        this.midiData.events.forEach(event => {
            const eventTime = event.time * newMsPerTick;
            
            if (eventTime > newCurrentMidiTime) {
                const delay = eventTime - newCurrentMidiTime;
                const timeoutId = setTimeout(() => {
                    if (this.playback.isPlaying) {
                        this.playMidiNote(event.note, event.velocity);
                    }
                }, delay);
                this.playback.timeoutIds.push(timeoutId);
            }
        });
        
        // 重新设置结束事件
        const totalDuration = this.midiData.events[this.midiData.events.length - 1].time * newMsPerTick + 1000;
        if (totalDuration > newCurrentMidiTime) {
            const endTimeoutId = setTimeout(() => {
                this.stop();
            }, totalDuration - newCurrentMidiTime);
            this.playback.timeoutIds.push(endTimeoutId);
        }
        
        console.log(`实时调整速度: ${oldSpeed}x -> ${newSpeed}x, 当前tick: ${currentTicks.toFixed(0)}`);
    }
}