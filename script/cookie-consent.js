document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("cookieConsent")) {
    const bar = document.createElement("div");
    bar.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #1f2937;
      color: white;
      padding: 12px 20px;
      text-align: center;
      z-index: 9999;
    `;
    bar.innerHTML = `
      Bu site, kullanıcı deneyimini geliştirmek için çerezler kullanır.
      <button id="acceptCookies" style="margin-left: 10px; background:#10b981; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Tamam</button>
    `;
    document.body.appendChild(bar);

    document.getElementById("acceptCookies").addEventListener("click", () => {
      localStorage.setItem("cookieConsent", "true");
      bar.remove();
    });
  }
});