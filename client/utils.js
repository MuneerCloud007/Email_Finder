function sendMessageToExtension(data) {
    const extensionId = 'flddanldfhnnnehmoofobllfmdcinjlj';
    
    console.log(data);
    const message = { action: 'setData',data:data };
  
    chrome.runtime.sendMessage(extensionId, message, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
      } else {
        console.log('Response from extension:', response);
      }
    });
  }

  function sendMessageTOLogoutExtension(){
    const extensionId = 'flddanldfhnnnehmoofobllfmdcinjlj';
    const message = { action: 'logout'};

    chrome.runtime.sendMessage(extensionId, message, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError);
        } else {
          console.log('Response from extension:', response);
        }
      });


  }

export {sendMessageToExtension,sendMessageTOLogoutExtension} 
