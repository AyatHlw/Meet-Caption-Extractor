

let sessionHistory = [];

function sanitizeSpeakerName(speaker) {
  if (typeof speaker !== 'string') return '';
  return speaker.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'newCaption') {

    const { speaker, text, timestamp } = message.payload;
    const cleanSpeaker = sanitizeSpeakerName(speaker);
    if (!cleanSpeaker || !text) return true;

    const lastEntry = sessionHistory.length > 0 ? sessionHistory[sessionHistory.length - 1] : null;

    if (lastEntry && lastEntry.speaker === cleanSpeaker) {
      
      lastEntry.text = text;
    } else {
      
      sessionHistory.push({ speaker: cleanSpeaker, text: text, timestamp: timestamp });
    }
    
    chrome.runtime.sendMessage({ type: 'liveUpdate', payload: sessionHistory });
  } 
  else if (message.type === 'downloadTranscript') {
    
    const transcriptText = sessionHistory
        .map(entry => `(${entry.timestamp}) [${entry.speaker}]: ${entry.text}`)
        .join('\n\n');
    
    const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(transcriptText);
    
    chrome.downloads.download({
      url: dataUrl,
      filename: `meet_transcript_${Date.now()}.txt`,
      saveAs: true
    });
  }
  return true;
});