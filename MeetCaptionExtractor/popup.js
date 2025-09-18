

const captionsContainer = document.getElementById('captions-container');
const downloadBtn = document.getElementById('download-btn');

function render(historyArray) {
  if (!captionsContainer) return;
  captionsContainer.innerHTML = '';
  
  if (historyArray && historyArray.length > 0) {
    historyArray.forEach(caption => {
      const p = document.createElement('p');
      p.className = 'caption';

      
      
      p.innerHTML = `
        <div class="caption-header">
          <span class="speaker">[${caption.speaker}]</span>
          <span class="timestamp">(${caption.timestamp})</span>
        </div>
        <div class="text">
          ${caption.text}
        </div>
      `;
      

      captionsContainer.appendChild(p);
    });
    captionsContainer.scrollTop = captionsContainer.scrollHeight;
  } else {
    captionsContainer.innerHTML = '<p style="color: #888; text-align: center; padding-top: 20px;">Waiting for captions...</p>';
  }
}

downloadBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'downloadTranscript' });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'liveUpdate') {
    render(message.payload);
  }
});

chrome.storage.session.get(['sessionData'], (result) => {
  if (result.sessionData) {
    render(result.sessionData);
  }
});