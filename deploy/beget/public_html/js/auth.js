const getForm = (id) => document.getElementById(id);

const showError = (element, message) => {
  element.textContent = message;
  element.hidden = !message;
};

const submitRegister = async (event) => {
  event.preventDefault();
  const form = event.target;
  const errorBox = document.getElementById("register-error");
  const data = new FormData(form);
  if (data.get("password") !== data.get("confirm")) {
    showError(errorBox, "Пароли не совпадают.");
    return;
  }
  try {
    const response = await fetch("/api/auth-register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: data.get("email"),
        password: data.get("password"),
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Ошибка регистрации");
    window.location.href = "/dashboard.html";
  } catch (error) {
    showError(errorBox, error.message);
  }
};

const submitLogin = async (event) => {
  event.preventDefault();
  const form = event.target;
  const errorBox = document.getElementById("login-error");
  const data = new FormData(form);
  try {
    const response = await fetch("/api/auth-login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: data.get("email"),
        password: data.get("password"),
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Ошибка входа");
    window.location.href = "/dashboard.html";
  } catch (error) {
    showError(errorBox, error.message);
  }
};

const registerForm = getForm("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", submitRegister);
}

const loginForm = getForm("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", submitLogin);
}
