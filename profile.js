const pencile = document.getElementById("pencile-icon");
const profile = document.getElementById("img-profile");
const input = document.getElementById("select-file");

input.addEventListener("change", () => {
    const file = input.files && input.files[0];

    if (file && file.type.startsWith("image/")) {
        profile.src = URL.createObjectURL(file);
    }
});

pencile.addEventListener("click", () => {
    input.click();
});
