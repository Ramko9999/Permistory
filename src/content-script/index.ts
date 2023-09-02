import { MediaEvent, Permission, PermissionEvent } from "../shared/interface";
import { storeMediaEvent } from "../shared/store";

function injectScript() {
  const container = document.createElement("script");
  container.src = chrome.runtime.getURL("js/injectScript.js");
  (document.head || document.documentElement).appendChild(container);
}

injectScript();
window.addEventListener("message", async (event) => {
  if (event.source != window) {
    return;
  }

  const permissionEvent: PermissionEvent = event.data;
  console.log(permissionEvent);
  if (
    permissionEvent.permission === Permission.AUDIO ||
    permissionEvent.permission === Permission.VIDEO
  ) {
    await storeMediaEvent(permissionEvent as MediaEvent);
  }
});
