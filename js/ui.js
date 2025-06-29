// UI控制类
class UIController {
    constructor(piano, midiPlayer) {
        this.piano = piano;
        this.midiPlayer = midiPlayer;
        this.scrollSensitivity = parseFloat(localStorage.getItem('scrollSensitivity')) || 1.0;
        this.volumeDebounceTimer = null;
        
        this.initElements();
        this.initSettings();
        this.bindEvents();
    }
    
    initElements() {
        this.scrollSensitivityInput = document.getElementById('scrollSensitivity');
        this.scrollIcon = document.getElementById('scrollIcon');
        this.scrollPanel = document.getElementById('scrollPanel');
        
        this.volumeControlInput = document.getElementById('volumeControl');
        this.volumeIcon = document.getElementById('volumeIcon');
        this.volumePanel = document.getElementById('volumePanel');
        
        this.keyboardSizeInput = document.getElementById('keyboardSizeControl');
        this.sizeIcon = document.getElementById('sizeIcon');
        this.sizePanel = document.getElementById('sizePanel');
        
        this.showKeyboardMappingCheckbox = document.getElementById('showKeyboardMapping');
        this.noteDisplaySelect = document.getElementById('noteDisplaySelect');
        this.keyEffectSelect = document.getElementById('keyEffectSelect');
        
        this.midiSpeedInput = document.getElementById('midiSpeedControl');
        this.midiSpeedIcon = document.getElementById('midiSpeedIcon');
        this.midiSpeedPanel = document.getElementById('midiSpeedPanel');
        this.midiSpeedDisplay = document.getElementById('midiSpeedDisplay');
    }
    
    initSettings() {
        this.scrollSensitivityInput.value = this.scrollSensitivity;
        this.volumeControlInput.value = this.piano.currentVolume;
        this.keyboardSizeInput.value = this.piano.keyboardSizeRatio;
        this.showKeyboardMappingCheckbox.checked = this.piano.showKeyboardMapping;
        
        if (this.midiPlayer) {
            this.midiSpeedInput.value = this.midiPlayer.getPlaybackSpeed();
            this.midiSpeedDisplay.textContent = this.midiPlayer.getPlaybackSpeed().toFixed(1) + 'x';
        }
        
        this.sizeIcon.title = `键盘尺寸 (当前: ${this.piano.keyboardSizeRatio.toFixed(1)}，全屏显示时为1)`;
        
        this.initCustomSelect(this.noteDisplaySelect, this.piano.currentNoteDisplayMode, (value) => {
            this.piano.currentNoteDisplayMode = value;
            localStorage.setItem('noteDisplayMode', value);
            this.piano.generatePianoKeys();
        });
        
        this.initCustomSelect(this.keyEffectSelect, this.piano.currentKeyEffectMode, (value) => {
            this.piano.currentKeyEffectMode = value;
            localStorage.setItem('keyEffectMode', value);
        });
    }
    
    initCustomSelect(selectElement, currentValue, onChangeCallback) {
        const trigger = selectElement.querySelector('.custom-select-trigger');
        const options = selectElement.querySelector('.custom-select-options');
        const optionElements = selectElement.querySelectorAll('.custom-select-option');
        
        const initialOption = selectElement.querySelector(`[data-value="${currentValue}"]`);
        if (initialOption) {
            trigger.textContent = initialOption.textContent;
            optionElements.forEach(opt => opt.classList.remove('selected'));
            initialOption.classList.add('selected');
        }
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-select-options.show').forEach(opt => {
                if (opt !== options) opt.classList.remove('show');
            });
            options.classList.toggle('show');
        });
        
        optionElements.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                const text = option.textContent;
                
                trigger.textContent = text;
                optionElements.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                options.classList.remove('show');
                
                onChangeCallback(value);
            });
        });
    }
    
    bindEvents() {
        // 滚动功能
        window.addEventListener('wheel', (e) => {
            if (this.piano.scrollContainer && this.piano.scrollContainer.scrollWidth > this.piano.scrollContainer.clientWidth) {
                e.preventDefault();
                this.piano.scrollContainer.scrollBy({
                    left: e.deltaY * this.scrollSensitivity,
                    behavior: 'smooth'
                });
            }
        }, { passive: false });
        
        // 控制面板切换
        this.scrollIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel(this.scrollPanel, this.scrollIcon);
        });
        
        this.volumeIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel(this.volumePanel, this.volumeIcon);
        });
        
        this.sizeIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel(this.sizePanel, this.sizeIcon);
        });
        
        if (this.midiSpeedIcon) {
            this.midiSpeedIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePanel(this.midiSpeedPanel, this.midiSpeedIcon);
            });
        }
        
        // 点击其他地方隐藏面板
        document.addEventListener('click', () => {
            this.hideAllPanels();
            document.querySelectorAll('.custom-select-options.show').forEach(options => {
                options.classList.remove('show');
            });
        });
        
        // 阻止面板内部点击冒泡
        [this.scrollPanel, this.volumePanel, this.sizePanel, this.midiSpeedPanel].forEach(panel => {
            if (panel) panel.addEventListener('click', (e) => e.stopPropagation());
        });
        
        // 滑动条事件
        this.scrollSensitivityInput.addEventListener('input', (e) => {
            this.scrollSensitivity = parseFloat(e.target.value);
            localStorage.setItem('scrollSensitivity', this.scrollSensitivity.toString());
        });
        
        this.volumeControlInput.addEventListener('input', (e) => {
            this.updateVolume(parseFloat(e.target.value));
        });
        
        this.keyboardSizeInput.addEventListener('input', (e) => {
            this.piano.keyboardSizeRatio = parseFloat(e.target.value);
            localStorage.setItem('keyboardSizeRatio', this.piano.keyboardSizeRatio.toString());
            this.sizeIcon.title = `键盘尺寸 (当前: ${this.piano.keyboardSizeRatio.toFixed(1)}，全屏显示时为1)`;
            this.piano.generatePianoKeys();
        });
        
        this.showKeyboardMappingCheckbox.addEventListener('change', (e) => {
            this.piano.showKeyboardMapping = e.target.checked;
            localStorage.setItem('showKeyboardMapping', this.piano.showKeyboardMapping.toString());
            this.piano.generatePianoKeys();
        });
        
        if (this.midiSpeedInput && this.midiPlayer) {
            this.midiSpeedInput.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                this.midiPlayer.setPlaybackSpeed(speed);
                this.midiSpeedDisplay.textContent = speed.toFixed(1) + 'x';
            });
        }
        
        // 面板滚轮事件
        this.scrollPanel.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newValue = Math.max(0.1, Math.min(3, this.scrollSensitivity + delta));
            this.scrollSensitivity = newValue;
            this.scrollSensitivityInput.value = newValue;
            localStorage.setItem('scrollSensitivity', this.scrollSensitivity.toString());
        }, { passive: false });
        
        this.volumePanel.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            const newValue = Math.max(0, Math.min(1, this.piano.currentVolume + delta));
            this.volumeControlInput.value = newValue;
            this.updateVolume(newValue);
        }, { passive: false });
        
        this.sizePanel.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newValue = Math.max(0.5, Math.min(2.0, this.piano.keyboardSizeRatio + delta));
            this.piano.keyboardSizeRatio = newValue;
            this.keyboardSizeInput.value = newValue;
            localStorage.setItem('keyboardSizeRatio', this.piano.keyboardSizeRatio.toString());
            this.sizeIcon.title = `键盘尺寸 (当前: ${this.piano.keyboardSizeRatio.toFixed(1)}，全屏显示时为1)`;
            this.piano.generatePianoKeys();
        }, { passive: false });
        
        if (this.midiSpeedPanel && this.midiPlayer) {
            this.midiSpeedPanel.addEventListener('wheel', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                const newValue = Math.max(0.5, Math.min(2.0, this.midiPlayer.getPlaybackSpeed() + delta));
                this.midiPlayer.setPlaybackSpeed(newValue);
                this.midiSpeedInput.value = newValue;
                this.midiSpeedDisplay.textContent = newValue.toFixed(1) + 'x';
            }, { passive: false });
        }
    }
    
    togglePanel(panel, icon) {
        const isVisible = panel.classList.contains('show');
        this.hideAllPanels();
        
        if (!isVisible) {
            panel.classList.add('show');
            icon.classList.add('active');
        }
    }
    
    updateVolume(volume) {
        this.piano.currentVolume = volume;
        localStorage.setItem('currentVolume', volume.toString());
        window.preload.setGlobalVolume(volume);
        
        if (this.volumeDebounceTimer) {
            clearTimeout(this.volumeDebounceTimer);
        }
        this.volumeDebounceTimer = setTimeout(() => {
            window.preload.playNote('C4', volume);
        }, 300);
    }
    
    hideAllPanels() {
        [this.scrollPanel, this.volumePanel, this.sizePanel, this.midiSpeedPanel].forEach(panel => {
            if (panel) panel.classList.remove('show');
        });
        [this.scrollIcon, this.volumeIcon, this.sizeIcon, this.midiSpeedIcon].forEach(icon => {
            if (icon) icon.classList.remove('active');
        });
    }
}