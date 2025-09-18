if (window.myMeetScraperHasRun) {
  console.warn("Meet Scraper is already running. This instance will terminate.");
} else {
  window.myMeetScraperHasRun = true;
  console.log("Meet Scraper Initializing...");

  const seenCaptions = new Set();

  function enableCaptions() {
    const captionButton = Array.from(document.querySelectorAll("button[aria-label]")).find(btn => {
      const label = btn.getAttribute("aria-label");
      return label && (label.includes("تفعيل") || label.toLowerCase().includes("turn on captions"));
    });
    if (captionButton) {
      captionButton.click();
    } else {
      setTimeout(enableCaptions, 1000);
    }
  }
  enableCaptions();

  function findAndProcessCaptions() {
    const captionBlocks = document.querySelectorAll('.nMcdL');

    for (const block of captionBlocks) {
      const speakerElement = block.querySelector('.NWpY1d');
      const captionElement = block.querySelector('.ygicle');

      if (speakerElement && captionElement) {
        const speaker = speakerElement.textContent.trim();
        const text = captionElement.textContent.trim();
        
        const key = `${speaker}---${text}`;
        
        if (text && !seenCaptions.has(key)) {
          seenCaptions.add(key);
          
          const timestamp = new Date().toLocaleTimeString('en-GB');

          chrome.runtime.sendMessage({
            type: "newCaption",
            payload: { speaker, text, timestamp },
          });
        }
      }
    }
  }

  const observer = new MutationObserver(() => {
    findAndProcessCaptions();
  });

  observer.observe(document.body, {
    childList: true,      
    subtree: true,        
    characterData: true,  
  });
}