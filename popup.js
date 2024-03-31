document.querySelector("#submit").addEventListener("click", function (e) {
  e.preventDefault();
  const openai_key = document.querySelector('input[name="openai_key"]').value;
  alert(openai_key);
  chrome.storage.sync.set({ openai_key });
});

chrome.storage.sync.get("openai_key", function (result) {
  if (result.openai_key) {
    document.querySelector('input[name="openai_key"]').value =
      result.openai_key;
  }
});


chrome.storage.local.get("response", function (result) {
  if (result.response) {
    document.querySelector("#response").innerText = result.response;
    document.querySelector("#response").style.display = "block";
    document.querySelector("#submit").style.display = "none";
    document.querySelector('input[name="openai_key"]').style.display = "none";
    chrome.storage.local.remove("response");
  }
});
