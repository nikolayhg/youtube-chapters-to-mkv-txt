// Select all chapter items
const chapterElements = document.querySelectorAll("ytd-macro-markers-list-item-renderer");

// Helper: convert timestamp string "MM:SS" or "HH:MM:SS" to seconds for sorting
function timeToSeconds(timeStr) {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];        // MM:SS
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    return 0;
}

// Helper: convert seconds to HH:MM:SS.mmm
function secondsToMKVTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = 0; // MKV chapters support milliseconds, we set to 000
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${millis.toString().padStart(3,'0')}`;
}

// Extract chapters and remove duplicates
const chaptersSet = new Set();
chapterElements.forEach(item => {
    const time = item.querySelector("#time")?.textContent.trim();
    const title = item.querySelector("h4.macro-markers")?.textContent.trim();
    if (time && title) chaptersSet.add(`${time} ${title}`);
});

// Convert set to array and sort by time
const chaptersArray = Array.from(chaptersSet);
chaptersArray.sort((a, b) => {
    const timeA = timeToSeconds(a.split(' ')[0]);
    const timeB = timeToSeconds(b.split(' ')[0]);
    return timeA - timeB;
});

// Convert chapters to MKV format
const mkvChapters = chaptersArray.map((ch, index) => {
    const [time, ...titleParts] = ch.split(' ');
    const title = titleParts.join(' ');
    const seconds = timeToSeconds(time);
    const mkvTime = secondsToMKVTime(seconds);
    const chapterNumber = String(index + 1).padStart(2, '0');
    return `CHAPTER${chapterNumber}=${mkvTime}\nCHAPTER${chapterNumber}NAME=${title}`;
});

// Join all chapters into a single string
const mkvChapterText = mkvChapters.join('\n');

// --- Create and download MKV-compatible .txt file ---
const blob = new Blob([mkvChapterText], { type: 'text/plain' });
const url = URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = 'chapters_mkv.txt';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);

console.log('MKV chapter file downloaded as chapters_mkv.txt');
