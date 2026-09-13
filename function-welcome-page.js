let createAnAccount = document.getElementById("create-an-account");
let signIn = document.getElementById("sign-in");
let buildCommunityOption = document.getElementById("build-community-option");
let swimAcrossCanadaOption = document.getElementById("swim-across-canada-option");
let makeADifferenceOption = document.getElementById("make-a-difference-option");

function callAccountRegistrationPage() {
    window.location.href = "index-account-registration.html";
}

function callLoginPage() {
    window.location.href = "index-login-page.html";
}

function callSwimAcrossCanadaPage() {
    window.location.href = "index-swim-across-canada-page.html";
}

function callMakeADifferencePage() {
    window.location.href = "index-make-a-difference-page.html";
}

function callBuildCommunityPage() {
    window.location.href = "index-build-community-page.html";
}

createAnAccount.addEventListener("click", callAccountRegistrationPage);
signIn.addEventListener("click", callLoginPage);
swimAcrossCanadaOption.addEventListener("click", callSwimAcrossCanadaPage);
makeADifferenceOption.addEventListener("click", callMakeADifferencePage);
buildCommunityOption.addEventListener("click", callBuildCommunityPage);
