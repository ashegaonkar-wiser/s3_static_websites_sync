function initWebRTC() {
  function renderResults(results) {
    const container = document.getElementById("web-rtc-container");
    container.innerHTML = "";
    container.textContent = JSON.stringify(results, null, 2);
  }

  console.log("Running WebRTC tests");

  const testResults = {
    webRTCAvailable: null,
    candidate: null,
    error: null,
  };

  if (window.RTCPeerConnection) {
    console.log("Web RTC is available");
    testResults.webRTCAvailable = true;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    function handleCandidate(candidate) {
      console.log("Handling candidate", candidate);
      testResults.candidate = candidate;
      renderResults(testResults);
    }

    pc.onicecandidate = function (ice) {
      console.log("Handling ice", ice);
      if (ice.candidate) {
        handleCandidate(ice.candidate.candidate);
      } else {
        renderResults(testResults);
      }
    };

    pc.createDataChannel("");

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch((error) => {
        console.error("Error creating offer", error);
        testResults.error = error;
        renderResults(testResults);
      });
  } else {
    console.log("Web RTC is not available");
    testResults.webRTCAvailable = false;
    renderResults(testResults);
  }
}

window.addEventListener("DOMContentLoaded", () => initWebRTC());