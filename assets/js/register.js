const API_URL = "https://voluntern.onrender.com";

const form = document.querySelector(".form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !email || !password) {
    alert("Bütün sahələri doldurun!");
    return;
  }

  try {
    const res = await axios.post(`${API_URL}/api/auth/register`, {
      username,
      email,
      password,
    });

    alert(res.data.message);

    window.location.href = "login.html";
  } catch (error) {
    if (error.response) {
      alert(error.response.data.message);
    } else {
      alert("Serverə qoşulmaq mümkün olmadı");
    }
  }
});

const togglePassword = document.querySelector(".toggle-password");
const passwordInput = document.querySelector("#password");

togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.classList.remove("fa-eye-slash");
        togglePassword.classList.add("fa-eye");
    } else {
        passwordInput.type = "password";
        togglePassword.classList.remove("fa-eye");
        togglePassword.classList.add("fa-eye-slash");
    }
});

