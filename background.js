chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "showSelectedText",
    title: "Process selected text",
    contexts: ["selection"],
  });
});

// コンテキストメニューの項目がクリックされたときのアクションを定義
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "showSelectedText") {
    // 選択したテキストをアラートで表示
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        const selection = window.getSelection().toString();

        chrome.storage.sync.get("openai_key", (result) => {
          if (result.openai_key === undefined) {
            alert("OpenAI API key is not set.");
            const api_key = prompt("Please enter your OpenAI API key:");
            chrome.storage.sync.set({ openai_key: api_key });
            return;
          }
          const messages = [
            {
              role: "user",
              content: selection,
            },
          ];
          const payload = {
            messages: messages,
            temperature: 0.5,
            max_tokens: 4096,
            model: "gpt-4-turbo-preview",
          };
          const OPEN_AI_API_URL = "https://api.openai.com/v1/chat/completions";

          fetch(OPEN_AI_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${result.openai_key}`,
            },
            body: JSON.stringify(payload),
          })
            .then((response) => response.json())
            .then((data) => {
              const response = data.choices[0].message.content;
              // copy to clipboard
              navigator.clipboard.writeText(response);
              const html = `
                <html>
                  <head>
                    <title>AI Response</title>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                      }
                      .message {
                        margin: 10px;
                        padding: 10px;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                      }
                      .user {
                        background-color: #f0f0f0;
                      }
                      .ai {
                        background-color: #f9f9f9;
                      }
                    </style>
                  </head>
                  <body>
                    <h1>AI Response</h1>
                    <pre class="message user">${selection}</pre>
                    <hr />
                    <textarea class="message ai" style="width: 100%; height: 200px;">${response}</textarea>
                  </body>
                </html>
              `;
              // Open new window (popup window, size 800x600)
              const newWindow = window.open(
                "",
                "_blank",
                "width=800,height=600,menubar=no,toolbar=no,location=no,status=no",
              );
              newWindow.document.open();
              newWindow.document.write(html);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        });
      },
    });
  }
});
