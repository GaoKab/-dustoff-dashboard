/**
 * DustOff – Quiz Results Download Button
 *
 * Drop this script on any page that calls the quiz-submit Edge Function.
 * It wraps the existing fetch so that, after a successful submission,
 * a "Download your results" button automatically appears inside
 * .quiz-results (or any element you choose via RESULTS_CONTAINER).
 *
 * HOW TO USE
 * ----------
 * 1. Copy this file (or its contents) into your frontend.
 * 2. Replace SUPABASE_ANON_KEY and SUPABASE_FUNCTIONS_URL with your values.
 * 3. Make sure this script runs AFTER the DOM loads.
 * 4. Your existing form submit code can stay as-is — the patched fetch
 *    intercepts the quiz-submit call transparently.
 *
 * If you are already calling the Edge Function yourself, skip the fetch
 * patch and call `handleQuizResponse(responseData)` directly after your
 * own fetch resolves.
 */

(function () {
  "use strict";

  // ── Config ─────────────────────────────────────────────────────────────────
  const SUPABASE_FUNCTIONS_URL =
    "https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/quiz-submit";
  const SUPABASE_ANON_KEY = "<YOUR_SUPABASE_ANON_KEY>";
  // Selector of the element that already shows quiz results on screen
  const RESULTS_CONTAINER = ".quiz-results";
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Inject the download button into the results container.
   * @param {string} pdfUrl – public URL returned by the Edge Function
   */
  function injectDownloadButton(pdfUrl) {
    const container = document.querySelector(RESULTS_CONTAINER);
    if (!container) {
      console.warn("[DustOff] Results container not found:", RESULTS_CONTAINER);
      return;
    }

    // Don't add a second button if already present
    if (container.querySelector(".dustoff-download-btn")) return;

    const btn = document.createElement("a");
    btn.className = "dustoff-download-btn";
    btn.href = pdfUrl;
    btn.download = "DustOff-Quiz-Results.pdf";
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.textContent = "Download your results";

    // Minimal inline styles – override these with your own CSS class
    Object.assign(btn.style, {
      display: "inline-block",
      marginTop: "16px",
      padding: "12px 24px",
      background: "#0cc",
      color: "#000",
      fontWeight: "700",
      fontSize: "15px",
      borderRadius: "6px",
      textDecoration: "none",
      cursor: "pointer",
    });

    container.appendChild(btn);
  }

  /**
   * Call this with the parsed JSON body from the Edge Function response.
   * @param {object} data – { success, lead_id, pdf_url }
   */
  function handleQuizResponse(data) {
    if (data && data.pdf_url) {
      injectDownloadButton(data.pdf_url);
    } else {
      console.warn("[DustOff] No pdf_url in response:", data);
    }
  }

  // ── Fetch patch ──────────────────────────────────────────────────────────
  // Intercepts any fetch() call that targets the quiz-submit function so that
  // handleQuizResponse is called automatically, with no changes needed to
  // existing page scripts.
  const _nativeFetch = window.fetch.bind(window);

  window.fetch = async function (input, init) {
    const url = typeof input === "string" ? input : input.url;
    const isQuizSubmit =
      url && url.includes("quiz-submit");

    const response = await _nativeFetch(input, init);

    if (isQuizSubmit && response.ok) {
      // Clone so the original caller can still read the body
      const clone = response.clone();
      clone.json().then(handleQuizResponse).catch(() => {});
    }

    return response;
  };

  // ── Public API ─────────────────────────────────────────────────────────────
  // Expose for manual use, e.g. window.DustOff.handleQuizResponse(data)
  window.DustOff = window.DustOff || {};
  window.DustOff.handleQuizResponse = handleQuizResponse;
  window.DustOff.injectDownloadButton = injectDownloadButton;
})();
