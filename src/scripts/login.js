
const form = document.getElementById("form-login");
const mensagem = document.getElementById("mensagem-login");
const botao = document.getElementById("btn-login");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    mensagem.textContent = "Entrando...";
    botao.disabled = true;

    try {
        const resposta = await fetch(
            "https://beuren-store-api.onrender.com/api/accounts/login/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.error || "Não foi possível fazer login."
            );
        }

        if (!dados.token) {
            throw new Error("O servidor não retornou um token.");
        }

        sessionStorage.setItem("auth_token", dados.token);

        // Remove a identificação visual antiga.
        sessionStorage.removeItem("usuario_nome");

        window.location.href = "./index.html";

    } catch (erro) {
        mensagem.textContent = erro.message;
        mensagem.style.color = "#b51c1c";
    } finally {
        botao.disabled = false;
    }
});
