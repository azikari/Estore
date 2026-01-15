

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

    // Email verification gözlənilir
    window.location.href = "login.html";
  } catch (error) {
    if (error.response) {
      alert(error.response.data.message);
    } else {
      alert("Serverə qoşulmaq mümkün olmadı");
    }
  }
});
