(function () {
  "use strict";

  const { REQUIREMENTS, evaluatePosture, bytesToHex, formatBytes } = window.TrustLabLogic;
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const postureState = Object.fromEntries(REQUIREMENTS.map((item) => [item.key, false]));
  let currentFile = null;
  let baseline = null;
  let hashRequestId = 0;

  const requirementButtons = Array.from(document.querySelectorAll(".switch[data-requirement]"));
  const confirmedCount = document.getElementById("confirmedCount");
  const postureResult = document.getElementById("postureResult");
  const postureMessage = document.getElementById("postureMessage");
  const missingRequirements = document.getElementById("missingRequirements");
  const resetPosture = document.getElementById("resetPosture");

  const fileInput = document.getElementById("fileInput");
  const dropZone = document.getElementById("dropZone");
  const fileMeta = document.getElementById("fileMeta");
  const loadSampleA = document.getElementById("loadSampleA");
  const loadSampleB = document.getElementById("loadSampleB");
  const digestOutput = document.getElementById("digestOutput");
  const copyDigest = document.getElementById("copyDigest");
  const setBaseline = document.getElementById("setBaseline");
  const clearBaseline = document.getElementById("clearBaseline");
  const baselineMeta = document.getElementById("baselineMeta");
  const compareBaseline = document.getElementById("compareBaseline");
  const integrityResult = document.getElementById("integrityResult");
  const hashStatus = document.getElementById("hashStatus");
  const hashError = document.getElementById("hashError");

  function renderPosture() {
    const result = evaluatePosture(postureState);
    confirmedCount.textContent = `${result.confirmedCount} of ${result.totalCount}`;
    postureResult.classList.toggle("is-complete", result.complete);
    postureResult.classList.toggle("is-incomplete", !result.complete);

    const heading = postureResult.querySelector("h3");
    if (result.complete) {
      heading.innerHTML = `Public requirements appear satisfied — <span id="confirmedCount">${result.confirmedCount} of ${result.totalCount}</span> groups confirmed.`;
      postureMessage.textContent = "This is not a Vanguard Pre-Check result. Final On-Demand eligibility can only be determined by Vanguard on the actual Windows PC.";
      missingRequirements.replaceChildren();
      postureResult.querySelector(".result-icon").innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.5 12.5 3.5 3.5 7.5-8"></path><circle cx="12" cy="12" r="9"></circle></svg>';
    } else {
      heading.innerHTML = `Checklist incomplete — <span id="confirmedCount">${result.confirmedCount} of ${result.totalCount}</span> public groups confirmed.`;
      postureMessage.textContent = result.confirmedCount === 0
        ? "No attributes are confirmed. This page has not inspected a device."
        : "Unconfirmed means “not entered by the user”; it does not prove that the feature is absent.";
      missingRequirements.replaceChildren(...result.missing.map((item) => {
        const li = document.createElement("li");
        li.textContent = item.label;
        return li;
      }));
      postureResult.querySelector(".result-icon").innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9v4M12 17h.01"></path><circle cx="12" cy="12" r="9"></circle></svg>';
    }
  }

  requirementButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.requirement;
      postureState[key] = !postureState[key];
      button.setAttribute("aria-checked", String(postureState[key]));
      button.querySelector(".switch-label").textContent = postureState[key] ? "On" : "Off";
      renderPosture();
    });
  });

  resetPosture.addEventListener("click", () => {
    requirementButtons.forEach((button) => {
      const key = button.dataset.requirement;
      postureState[key] = false;
      button.setAttribute("aria-checked", "false");
      button.querySelector(".switch-label").textContent = "Off";
    });
    renderPosture();
  });

  function showHashError(message) {
    hashError.textContent = message;
    hashError.hidden = false;
  }

  function clearHashError() {
    hashError.hidden = true;
    hashError.textContent = "";
  }

  function setHashBusy(isBusy) {
    fileInput.disabled = isBusy;
    copyDigest.disabled = isBusy || !currentFile;
    setBaseline.disabled = isBusy || !currentFile;
    compareBaseline.disabled = isBusy || !currentFile || !baseline;
  }

  function resetCurrentFile(message = "No file selected.") {
    currentFile = null;
    fileMeta.textContent = message;
    digestOutput.textContent = "—";
    copyDigest.disabled = true;
    setBaseline.disabled = true;
    compareBaseline.disabled = true;
  }

  function renderBaseline() {
    if (!baseline) {
      baselineMeta.textContent = "No baseline set for this session.";
      clearBaseline.disabled = true;
      compareBaseline.disabled = true;
      return;
    }
    baselineMeta.textContent = `${baseline.name} · ${formatBytes(baseline.size)} · ${baseline.digest.slice(0, 12)}…`;
    clearBaseline.disabled = false;
    compareBaseline.disabled = !currentFile;
  }

  function resetComparison() {
    integrityResult.className = "integrity-result is-idle";
    integrityResult.innerHTML = "<strong>—</strong><span>No comparison yet.</span>";
  }

  async function handleFile(file) {
    if (!file) return;
    const requestId = ++hashRequestId;
    clearHashError();
    resetComparison();

    if (file.size > MAX_FILE_SIZE) {
      resetCurrentFile("File rejected.");
      hashStatus.textContent = "";
      showHashError(`Choose a file no larger than 50 MiB. “${file.name}” is ${formatBytes(file.size)}.`);
      return;
    }

    if (!window.crypto || !window.crypto.subtle) {
      resetCurrentFile("Web Crypto is unavailable.");
      showHashError("This browser does not provide the Web Crypto API required for SHA-256. Open the folder through localhost in a current Safari or Chrome browser.");
      return;
    }

    fileMeta.textContent = `${file.name} · ${formatBytes(file.size)}`;
    digestOutput.textContent = "Calculating…";
    hashStatus.textContent = "Calculating SHA-256 locally. No file data is uploaded.";
    setHashBusy(true);

    try {
      const data = await file.arrayBuffer();
      const digestBuffer = await window.crypto.subtle.digest("SHA-256", data);
      if (requestId !== hashRequestId) return;
      currentFile = { name: file.name, size: file.size, digest: bytesToHex(digestBuffer) };
      digestOutput.textContent = currentFile.digest;
      hashStatus.textContent = "Digest calculated locally. Select “Set as baseline” or compare with the current baseline.";
      copyDigest.disabled = false;
      setBaseline.disabled = false;
      compareBaseline.disabled = !baseline;
    } catch (error) {
      if (requestId !== hashRequestId) return;
      resetCurrentFile("Could not read the selected file.");
      hashStatus.textContent = "";
      showHashError(`The file could not be hashed: ${error instanceof Error ? error.message : "unknown browser error"}`);
    } finally {
      if (requestId === hashRequestId) setHashBusy(false);
      fileInput.value = "";
    }
  }

  fileInput.addEventListener("change", (event) => handleFile(event.target.files?.[0]));

  loadSampleA.addEventListener("click", () => {
    const sample = new File([
      "Vanguard Trust Lab educational sample\nVersion: 1\nIntegrity means detecting unauthorized change.\n",
    ], "trust-lab-sample.txt", { type: "text/plain" });
    handleFile(sample);
  });

  loadSampleB.addEventListener("click", () => {
    const sample = new File([
      "Vanguard Trust Lab educational sample\nVersion: 2\nIntegrity means detecting unauthorized change.\n",
    ], "trust-lab-sample-modified.txt", { type: "text/plain" });
    handleFile(sample);
  });

  ["dragenter", "dragover"].forEach((type) => dropZone.addEventListener(type, (event) => {
    event.preventDefault();
    dropZone.classList.add("is-dragging");
  }));

  ["dragleave", "drop"].forEach((type) => dropZone.addEventListener(type, (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-dragging");
  }));

  dropZone.addEventListener("drop", (event) => handleFile(event.dataTransfer?.files?.[0]));

  copyDigest.addEventListener("click", async () => {
    if (!currentFile) return;
    try {
      await navigator.clipboard.writeText(currentFile.digest);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = currentFile.digest;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    const previous = copyDigest.textContent;
    copyDigest.textContent = "Copied";
    window.setTimeout(() => { copyDigest.textContent = previous; }, 1200);
  });

  setBaseline.addEventListener("click", () => {
    if (!currentFile) return;
    baseline = { ...currentFile };
    renderBaseline();
    resetComparison();
    hashStatus.textContent = "Baseline stored in this tab only. It will be cleared when the page is refreshed.";
  });

  clearBaseline.addEventListener("click", () => {
    baseline = null;
    renderBaseline();
    resetComparison();
    hashStatus.textContent = "Baseline cleared.";
  });

  compareBaseline.addEventListener("click", () => {
    if (!currentFile || !baseline) return;
    const match = currentFile.digest === baseline.digest;
    integrityResult.className = `integrity-result ${match ? "is-match" : "is-mismatch"}`;
    integrityResult.innerHTML = match
      ? "<strong>MATCH</strong><span>The file bytes are identical to the baseline.</span>"
      : "<strong>MISMATCH</strong><span>The file bytes differ from the baseline.</span>";
    hashStatus.textContent = match
      ? "A match does not prove that the baseline is safe, genuine, or digitally signed."
      : "A mismatch proves that bytes changed, but not why or who changed them.";
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("is-active"));
      link.classList.add("is-active");
    });
  });

  renderPosture();
  renderBaseline();
})();
