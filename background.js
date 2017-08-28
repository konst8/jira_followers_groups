
chrome.tabs.onUpdated.addListener(getIconStatus);
chrome.tabs.onActivated.addListener(getIconStatus);

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.runtime.openOptionsPage();
});

function getIconStatus(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {message: "loaded?"}, function(response) {
      if (response) {
        chrome.browserAction.setBadgeBackgroundColor({color:'lightgreen'});
        chrome.browserAction.setBadgeText({text:" "});
      } else {
        chrome.browserAction.setBadgeText({text:""});
      }
    });
  });
}