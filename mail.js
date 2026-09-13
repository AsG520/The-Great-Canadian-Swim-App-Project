(function () {
    if (typeof emailjs === "undefined") {
        console.error("EmailJS SDK is not loaded.");
        return;
    }

    emailjs.init("oVoKJHuUyYjVcJC6b");
})();

window.onload = function () {
    const form = document.querySelector("form");

    if (!form) {
        console.error("Contact form was not found.");
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (typeof emailjs === "undefined") {
            alert("Email service is unavailable right now.");
            return;
        }

        const templateParams = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            title: document.getElementById("subject").value,
            message: document.getElementById("message").value,
        };

        emailjs.send("service_9jnheth", "template_f5i2tdw", templateParams).then(
            function (response) {
                alert("Email sent successfully!");
                console.log("SUCCESS!", response.status, response.text);
            },
            function (error) {
                alert("Failed to send email. Check console for details.");
                console.error("FAILED...", error);
            },
        );
    });
};
