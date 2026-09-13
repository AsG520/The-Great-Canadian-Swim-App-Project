let getStarted = document.getElementById("get-started");

function callWelcomePage() {
    window.location.href = "index-welcome-page.html";
}

getStarted.addEventListener("click", callWelcomePage);

window.addEventListener("load", () => {
    const loader = document.querySelector(".loader");
    loader.classList.add("loader-hidden");
});
