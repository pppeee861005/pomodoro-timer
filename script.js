class PomodoroTimer {
    constructor() {
        this.workTime = 25 * 60; // 25分鐘，單位：秒
        this.shortBreak = 5 * 60; // 5分鐘
        this.longBreak = 15 * 60; // 15分鐘
        this.currentTime = this.workTime;
        this.isRunning = false;
        this.isPaused = false;
        this.mode = 'work'; // 'work', 'shortBreak', 'longBreak'
        this.tomatoCount = 0;
        this.workSessionCount = 0;
        this.interval = null;
        this.focusTips = {
            work: [
                '把任務分成 3 步，讓番茄兔悄悄幫你記住。',
                '閉上眼深呼吸 3 次，讓專注慢慢回來。',
                '想像自己拿著可愛番茄筆寫下第一行。'
            ],
            shortBreak: [
                '蹦跳一下，用小動作和身體說謝謝。',
                '喝一口水，讓腦袋也喝彩。',
                '觀察窗外 5 秒，輕鬆呼吸。'
            ],
            longBreak: [
                '站起來伸展雙手，給肩膀一點愛。',
                '準備一杯茶或咖啡，慢慢品味。',
                '跟朋友說句「我完成一個番茄啦！」。'
            ]
        };
        this.previousHintMode = '';
        this.toastTimeout = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadSettings();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.timeElement = document.getElementById('time');
        this.modeElement = document.getElementById('mode');
        this.progressBar = document.getElementById('progressBar');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.tomatoCountElement = document.getElementById('tomatoCount');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.saveBtn = document.getElementById('saveBtn');
        this.workTimeInput = document.getElementById('workTime');
        this.shortBreakInput = document.getElementById('shortBreak');
        this.longBreakInput = document.getElementById('longBreak');
        this.focusHintElement = document.getElementById('focusHint');
        this.toastElement = document.getElementById('toast');
        this.closeSettingsBtn = document.getElementById('closeSettings');
    }
    
    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.settingsBtn.addEventListener('click', () => this.toggleSettings());
        this.saveBtn.addEventListener('click', () => this.saveSettings());
        this.closeSettingsBtn?.addEventListener('click', () => this.toggleSettings());
        this.settingsPanel?.addEventListener('click', (event) => {
            if (event.target === this.settingsPanel) {
                this.toggleSettings();
            }
        });
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.startBtn.style.display = 'none';
            this.pauseBtn.style.display = 'inline-block';
            
            this.interval = setInterval(() => {
                this.tick();
            }, 1000);
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            this.startBtn.style.display = 'inline-block';
            this.pauseBtn.style.display = 'none';
            clearInterval(this.interval);
        }
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
        clearInterval(this.interval);
        
        // 重置到當前模式的初始時間
        if (this.mode === 'work') {
            this.currentTime = this.workTime;
        } else if (this.mode === 'shortBreak') {
            this.currentTime = this.shortBreak;
        } else {
            this.currentTime = this.longBreak;
        }
        
        this.updateDisplay();
    }
    
    tick() {
        if (this.currentTime > 0) {
            this.currentTime--;
            this.updateDisplay();
        } else {
            this.complete();
        }
    }
    
    complete() {
        clearInterval(this.interval);
        this.isRunning = false;
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
        
        // 播放提示音（使用 Web Audio API 生成簡單音效）
        this.playNotificationSound();
        
        // 添加完成動畫效果
        this.timeElement.style.animation = 'bounce 0.5s ease-in-out 3';
        
        // 切換模式
        if (this.mode === 'work') {
            this.workSessionCount++;
            this.tomatoCount++;
            this.updateTomatoCount();
            
            // 每4個番茄後長休息，否則短休息
            if (this.workSessionCount % 4 === 0) {
                this.mode = 'longBreak';
                this.currentTime = this.longBreak;
            } else {
                this.mode = 'shortBreak';
                this.currentTime = this.shortBreak;
            }
        } else {
            // 休息結束，回到工作模式
            this.mode = 'work';
            this.currentTime = this.workTime;
        }
        
        this.updateDisplay();
        
        // 顯示通知
        setTimeout(() => {
            const message = this.mode === 'work'
                ? '休息結束！新的工作段出發囉！'
                : '辛苦了！讓心情放鬆一下～';
            this.showToast(message);
        }, 500);
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timeElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // 更新模式顯示
        const modeText = {
            'work': '工作時間',
            'shortBreak': '短休息',
            'longBreak': '長休息'
        };
        this.modeElement.textContent = modeText[this.mode];
        
        // 更新進度條
        const totalTime = this.mode === 'work' ? this.workTime : 
                         this.mode === 'shortBreak' ? this.shortBreak : this.longBreak;
        const progress = ((totalTime - this.currentTime) / totalTime) * 100;
        this.progressBar.style.width = `${progress}%`;
        
        // 根據模式改變顏色和動畫
        if (this.mode === 'work') {
            this.timeElement.style.color = '#4ecdc4';
            this.progressBar.style.background = 'linear-gradient(90deg, #ff6b6b 0%, #ff8e8e 100%)';
            // 工作模式：紅色脈衝
            if (this.currentTime <= 60 && this.isRunning) {
                this.timeElement.style.animation = 'pulse 0.5s ease-in-out infinite';
            } else {
                this.timeElement.style.animation = 'pulse 2s ease-in-out infinite';
            }
        } else {
            this.timeElement.style.color = '#95e1d3';
            this.progressBar.style.background = 'linear-gradient(90deg, #4ecdc4 0%, #6edcd4 100%)';
            // 休息模式：較慢的脈衝
            this.timeElement.style.animation = 'pulse 3s ease-in-out infinite';
        }

        this.updateFocusHint();
    }

    updateFocusHint(force = false) {
        if (!this.focusHintElement) return;
        if (!force && this.previousHintMode === this.mode) return;
        const hints = this.focusTips[this.mode] || [];
        if (!hints.length) return;
        const nextHint = hints[Math.floor(Math.random() * hints.length)];
        this.focusHintElement.textContent = nextHint;
        this.previousHintMode = this.mode;
    }
    
    updateTomatoCount() {
        this.tomatoCountElement.textContent = this.tomatoCount;
        // 添加动画效果
        this.tomatoCountElement.style.animation = 'none';
        setTimeout(() => {
            this.tomatoCountElement.style.animation = 'bounce 0.5s ease-in-out';
        }, 10);
        // 保存到本地存储
        this.saveSettingsToLocal();
    }
    
    toggleSettings() {
        if (!this.settingsPanel) return;
        this.settingsPanel.classList.toggle('hidden');
    }
    
    saveSettings() {
        this.workTime = parseInt(this.workTimeInput.value) * 60;
        this.shortBreak = parseInt(this.shortBreakInput.value) * 60;
        this.longBreak = parseInt(this.longBreakInput.value) * 60;
        
        // 如果當前是工作模式且未運行，更新當前時間
        if (this.mode === 'work' && !this.isRunning) {
            this.currentTime = this.workTime;
        } else if (this.mode === 'shortBreak' && !this.isRunning) {
            this.currentTime = this.shortBreak;
        } else if (this.mode === 'longBreak' && !this.isRunning) {
            this.currentTime = this.longBreak;
        }
        
        this.saveSettingsToLocal();
        this.updateDisplay();
        this.toggleSettings();
        this.showToast('設定已儲存囉！');
    }
    
    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.workTime = settings.workTime * 60;
            this.shortBreak = settings.shortBreak * 60;
            this.longBreak = settings.longBreak * 60;
            this.workTimeInput.value = settings.workTime;
            this.shortBreakInput.value = settings.shortBreak;
            this.longBreakInput.value = settings.longBreak;
        }
        
        const savedCount = localStorage.getItem('tomatoCount');
        if (savedCount) {
            this.tomatoCount = parseInt(savedCount);
            this.updateTomatoCount();
        }
    }
    
    saveSettingsToLocal() {
        const settings = {
            workTime: this.workTime / 60,
            shortBreak: this.shortBreak / 60,
            longBreak: this.longBreak / 60
        };
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        localStorage.setItem('tomatoCount', this.tomatoCount.toString());
    }
    
    showToast(message) {
        if (!this.toastElement) return;
        clearTimeout(this.toastTimeout);
        this.toastElement.textContent = message;
        this.toastElement.classList.add('visible');
        this.toastTimeout = setTimeout(() => {
            if (this.toastElement) {
                this.toastElement.classList.remove('visible');
            }
        }, 2600);
    }
    
    playNotificationSound() {
        // 使用 Web Audio API 生成簡單的提示音
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

// 初始化番茄鐘
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});

