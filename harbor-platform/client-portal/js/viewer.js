/**
 * Media Viewer - Annotation Overlay
 */

// Class colors
const CLASS_COLORS = {
    person: '#ff6b6b',
    car: '#4ecdc4',
    bicycle: '#45b7d1',
    truck: '#96ceb4',
    motorcycle: '#ffeaa7',
    bus: '#dfe6e9',
    traffic_light: '#fd79a8',
    stop_sign: '#e17055',
    dog: '#a29bfe',
    cat: '#74b9ff',
    default: '#00d4ff',
};

// State
let annotations = {
    detections: [],
    segments: [],
    transcript: [],
    sceneLabels: [],
};
let currentFrame = 0;
let totalFrames = 720; // 24s * 30fps
let showAnnotations = true;
let selectedDetection = null;

// Elements
const video = document.getElementById('videoPlayer');
const canvas = document.getElementById('annotationCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initPlayer();
    loadMockAnnotations();
    renderDetections();
    renderClassSummary();
    renderTranscript();
});

/**
 * Initialize tabs
 */
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
        });
    });
}

/**
 * Initialize video player
 */
function initPlayer() {
    if (!video) return;

    const playPause = document.getElementById('playPause');
    const seekBar = document.getElementById('seekBar');
    const timeDisplay = document.getElementById('timeDisplay');
    const toggleAnnot = document.getElementById('toggleAnnotations');
    const fullscreenBtn = document.getElementById('fullscreen');
    const prevFrame = document.getElementById('prevFrame');
    const nextFrame = document.getElementById('nextFrame');

    // Play/Pause
    playPause?.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playPause.textContent = '⏸';
        } else {
            video.pause();
            playPause.textContent = '▶';
        }
    });

    // Seek
    seekBar?.addEventListener('input', (e) => {
        const time = (e.target.value / 100) * video.duration;
        video.currentTime = time;
    });

    // Time update
    video.addEventListener('timeupdate', () => {
        const progress = (video.currentTime / video.duration) * 100;
        if (seekBar) seekBar.value = progress;
        if (timeDisplay) {
            timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        }

        currentFrame = Math.floor(video.currentTime * 30);
        document.getElementById('frameInfo').textContent = `Frame ${currentFrame} / ${totalFrames}`;

        drawAnnotations();
    });

    // Toggle annotations
    toggleAnnot?.addEventListener('click', () => {
        showAnnotations = !showAnnotations;
        toggleAnnot.classList.toggle('active', showAnnotations);
        drawAnnotations();
    });

    // Fullscreen
    fullscreenBtn?.addEventListener('click', () => {
        const wrapper = document.querySelector('.player-wrapper');
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            wrapper.requestFullscreen();
        }
    });

    // Frame navigation
    prevFrame?.addEventListener('click', () => {
        video.currentTime = Math.max(0, video.currentTime - 1 / 30);
    });

    nextFrame?.addEventListener('click', () => {
        video.currentTime = Math.min(video.duration, video.currentTime + 1 / 30);
    });

    // Resize canvas
    window.addEventListener('resize', resizeCanvas);
    video.addEventListener('loadedmetadata', resizeCanvas);
    resizeCanvas();
}

/**
 * Resize canvas to match video
 */
function resizeCanvas() {
    if (!canvas || !video) return;

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    drawAnnotations();
}

/**
 * Draw annotations on canvas
 */
function drawAnnotations() {
    if (!ctx || !showAnnotations) {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get detections for current frame (or nearby)
    const frameRange = document.getElementById('showAllFrames')?.checked ? 1000 : 2;
    const visibleDetections = annotations.detections.filter(d =>
        Math.abs(d.frame - currentFrame) <= frameRange
    );

    // Scale factor
    const scaleX = canvas.width / 3840; // Assume 4K source
    const scaleY = canvas.height / 2160;

    visibleDetections.forEach((det, i) => {
        const color = CLASS_COLORS[det.label] || CLASS_COLORS.default;
        const isSelected = selectedDetection === i;

        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeRect(
            det.x * scaleX,
            det.y * scaleY,
            det.w * scaleX,
            det.h * scaleY
        );

        // Draw label
        ctx.fillStyle = color;
        const labelWidth = ctx.measureText(`${det.label} ${Math.round(det.conf * 100)}%`).width + 20;
        ctx.fillRect(det.x * scaleX, det.y * scaleY - 24, labelWidth, 22);

        ctx.fillStyle = '#000';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(
            `${det.label} ${Math.round(det.conf * 100)}%`,
            det.x * scaleX + 6,
            det.y * scaleY - 8
        );
    });
}

/**
 * Load mock annotation data
 */
function loadMockAnnotations() {
    // Mock detections
    annotations.detections = [
        { id: 1, label: 'person', conf: 0.94, x: 500, y: 400, w: 200, h: 500, frame: 0 },
        { id: 2, label: 'person', conf: 0.91, x: 1200, y: 450, w: 180, h: 480, frame: 0 },
        { id: 3, label: 'car', conf: 0.89, x: 2000, y: 600, w: 600, h: 400, frame: 0 },
        { id: 4, label: 'bicycle', conf: 0.87, x: 800, y: 500, w: 250, h: 300, frame: 30 },
        { id: 5, label: 'person', conf: 0.92, x: 1500, y: 380, w: 190, h: 520, frame: 60 },
        { id: 6, label: 'car', conf: 0.88, x: 2500, y: 550, w: 550, h: 420, frame: 90 },
        { id: 7, label: 'truck', conf: 0.85, x: 3000, y: 500, w: 700, h: 500, frame: 120 },
        { id: 8, label: 'traffic_light', conf: 0.93, x: 100, y: 100, w: 80, h: 200, frame: 150 },
    ];

    // Mock transcript
    annotations.transcript = [
        { start: 0, end: 3.5, text: "The busy intersection shows typical afternoon traffic." },
        { start: 3.5, end: 7.2, text: "Pedestrians cross at the marked crosswalk." },
        { start: 7.2, end: 12.0, text: "A cyclist navigates through the street." },
        { start: 12.0, end: 18.5, text: "Traffic signals change as vehicles wait at the intersection." },
        { start: 18.5, end: 24.0, text: "The scene captures urban life in motion." },
    ];
}

/**
 * Render detection list
 */
function renderDetections() {
    const list = document.getElementById('detectionList');
    if (!list) return;

    list.innerHTML = annotations.detections.map((det, i) => `
        <div class="detection-item" data-index="${i}" onclick="selectDetection(${i})">
            <div class="detection-color" style="background: ${CLASS_COLORS[det.label] || CLASS_COLORS.default}"></div>
            <span class="detection-label">${det.label}</span>
            <span class="detection-conf">${Math.round(det.conf * 100)}%</span>
            <span class="detection-frame">F${det.frame}</span>
        </div>
    `).join('');

    // Filter
    document.getElementById('classFilter')?.addEventListener('input', (e) => {
        const filter = e.target.value.toLowerCase();
        list.querySelectorAll('.detection-item').forEach(item => {
            const label = item.querySelector('.detection-label').textContent.toLowerCase();
            item.style.display = label.includes(filter) ? 'flex' : 'none';
        });
    });
}

/**
 * Select a detection
 */
function selectDetection(index) {
    selectedDetection = selectedDetection === index ? null : index;

    document.querySelectorAll('.detection-item').forEach((item, i) => {
        item.classList.toggle('selected', i === selectedDetection);
    });

    // Jump to frame
    if (selectedDetection !== null) {
        const det = annotations.detections[selectedDetection];
        video.currentTime = det.frame / 30;
    }

    drawAnnotations();
}

/**
 * Render class summary
 */
function renderClassSummary() {
    const summary = document.getElementById('classSummary');
    if (!summary) return;

    const counts = {};
    annotations.detections.forEach(det => {
        counts[det.label] = (counts[det.label] || 0) + 1;
    });

    const max = Math.max(...Object.values(counts));

    summary.innerHTML = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => `
            <div class="class-row">
                <span class="class-name">${label}</span>
                <div class="class-bar">
                    <div class="class-fill" style="width: ${(count / max) * 100}%; background: ${CLASS_COLORS[label] || CLASS_COLORS.default}"></div>
                </div>
                <span class="class-count">${count}</span>
            </div>
        `).join('');
}

/**
 * Render transcript
 */
function renderTranscript() {
    const list = document.getElementById('transcriptList');
    if (!list) return;

    list.innerHTML = annotations.transcript.map((entry, i) => `
        <div class="transcript-item" data-index="${i}" onclick="jumpToTranscript(${i})">
            <span class="transcript-time">${formatTime(entry.start)}</span>
            <span class="transcript-text">${entry.text}</span>
        </div>
    `).join('');

    // Copy button
    document.getElementById('copyTranscript')?.addEventListener('click', () => {
        const text = annotations.transcript.map(e => e.text).join(' ');
        navigator.clipboard.writeText(text);
        alert('Transcript copied!');
    });

    // Export SRT
    document.getElementById('exportSRT')?.addEventListener('click', () => {
        let srt = '';
        annotations.transcript.forEach((entry, i) => {
            srt += `${i + 1}\n`;
            srt += `${formatSRTTime(entry.start)} --> ${formatSRTTime(entry.end)}\n`;
            srt += `${entry.text}\n\n`;
        });

        const blob = new Blob([srt], { type: 'text/srt' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transcript.srt';
        a.click();
    });
}

/**
 * Jump to transcript segment
 */
function jumpToTranscript(index) {
    const entry = annotations.transcript[index];
    video.currentTime = entry.start;
    video.play();

    document.querySelectorAll('.transcript-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
}

/**
 * Format time as M:SS
 */
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format time for SRT (HH:MM:SS,mmm)
 */
function formatSRTTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

// Expose for inline handlers
window.selectDetection = selectDetection;
window.jumpToTranscript = jumpToTranscript;
