"use strict";

const GOOGLE_SHEETS_CONFIG = {
    webAppUrl: "https://script.google.com/macros/s/AKfycbz-U_uDOv-gGBQpbp4NHZeybcsy9AbexHhVM-mgVH-C0rek8yLLJ5VglR-504AxXYnj/exec"
};

const loginPanel = document.getElementById("loginPanel");
const resetPanel = document.getElementById("resetPanel");
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const message = document.getElementById("message");
const forgotPasswordButton = document.getElementById("forgotPasswordButton");
const backToLoginButton = document.getElementById("backToLoginButton");
const resetPasswordForm = document.getElementById("resetPasswordForm");
const resetUsernameInput = document.getElementById("resetUsername");
const registeredPhoneInput = document.getElementById("registeredPhone");
const newPasswordInput = document.getElementById("newPassword");
const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
const resetPasswordButton = document.getElementById("resetPasswordButton");
const resetMessage = document.getElementById("resetMessage");

function isGoogleSheetsConnected_() {
    return /^https:\/\/script\.google\.com\/macros\/s\//.test(
        GOOGLE_SHEETS_CONFIG.webAppUrl
    );
}

async function postToGoogleSheets_(payload) {
    if (!isGoogleSheetsConnected_()) {
        throw new Error("Google Sheets login service is not configured.");
    }

    const response = await fetch(GOOGLE_SHEETS_CONFIG.webAppUrl, {
        method: "POST",
        headers: {"Content-Type": "text/plain;charset=utf-8"},
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Login service request failed (${response.status}).`);
    }

    return response.json();
}

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    clearMessage(message);

    if (!username || !password) {
        showMessage(message, "Please enter both username and password.", "error");
        return;
    }

    setButtonLoading_(loginButton, true, "CHECKING...");

    try {
        const result = await postToGoogleSheets_({
            action: "login",
            username,
            password
        });

        if (!result.success) {
            throw new Error(result.message || "Incorrect username or password.");
        }

        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("loggedInUser", result.username || username);
        showMessage(message, "Login successful. Opening dashboard...", "success");

        window.setTimeout(function () {
            window.location.href = "dashboard.html";
        }, 650);
    } catch (error) {
        showMessage(message, error.message || "Login failed.", "error");
        passwordInput.value = "";
        passwordInput.focus();
    } finally {
        setButtonLoading_(loginButton, false, "LOGIN");
    }
});

resetPasswordForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = resetUsernameInput.value.trim();
    const phone = registeredPhoneInput.value.trim();
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmNewPasswordInput.value;
    clearMessage(resetMessage);

    if (!username || !phone || !newPassword || !confirmPassword) {
        showMessage(resetMessage, "Please complete every reset field.", "error");
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage(resetMessage, "The new passwords do not match.", "error");
        return;
    }

    if (
        newPassword.length < 8 ||
        !/[A-Za-z]/.test(newPassword) ||
        !/\d/.test(newPassword)
    ) {
        showMessage(
            resetMessage,
            "Use at least 8 characters with a letter and a number.",
            "error"
        );
        return;
    }

    setButtonLoading_(resetPasswordButton, true, "RESETTING...");

    try {
        const result = await postToGoogleSheets_({
            action: "resetPassword",
            username,
            phone,
            newPassword
        });

        if (!result.success) {
            throw new Error(result.message || "Password reset failed.");
        }

        showMessage(
            resetMessage,
            "Password reset successfully. Returning to login...",
            "success"
        );

        passwordInput.value = "";
        usernameInput.value = result.username || username;

        window.setTimeout(function () {
            showLoginPanel_();
            passwordInput.focus();
        }, 1000);
    } catch (error) {
        showMessage(
            resetMessage,
            error.message || "Password reset failed.",
            "error"
        );
    } finally {
        setButtonLoading_(resetPasswordButton, false, "RESET PASSWORD");
    }
});

forgotPasswordButton.addEventListener("click", function () {
    resetUsernameInput.value = usernameInput.value.trim();
    clearMessage(message);
    clearMessage(resetMessage);
    loginPanel.classList.add("hidden-panel");
    resetPanel.classList.remove("hidden-panel");
    resetUsernameInput.focus();
});

backToLoginButton.addEventListener("click", showLoginPanel_);

function showLoginPanel_() {
    resetPanel.classList.add("hidden-panel");
    loginPanel.classList.remove("hidden-panel");
    registeredPhoneInput.value = "";
    newPasswordInput.value = "";
    confirmNewPasswordInput.value = "";
    clearMessage(resetMessage);
}

function connectPasswordToggle_(button, input) {
    button.addEventListener("click", function () {
        const hidden = input.type === "password";
        input.type = hidden ? "text" : "password";
        button.textContent = hidden ? "Hide" : "Show";
    });
}

connectPasswordToggle_(document.getElementById("showPassword"), passwordInput);
connectPasswordToggle_(document.getElementById("showNewPassword"), newPasswordInput);
connectPasswordToggle_(
    document.getElementById("showConfirmNewPassword"),
    confirmNewPasswordInput
);

function setButtonLoading_(button, loading, text) {
    button.disabled = loading;
    button.textContent = text;
}

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = type;
}

function clearMessage(element) {
    element.textContent = "";
    element.className = "";
}
