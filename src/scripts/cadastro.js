
const form = document.getElementById("form-cadastro");
const mensagem = document.getElementById("mensagem-cadastro");
const botao = document.getElementById("btn-cadastrar");

// ==========================================
// CADASTRO SEM VERIFICACAO DE E-MAIL
// ==========================================

if (form && mensagem && botao) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirm-password").value;

        // ======================================
        // VALIDAR SENHAS
        // ======================================

        if (password !== confirmPassword) {
            mensagem.textContent = "As senhas não coincidem.";
            mensagem.style.color = "red";
            return;
        }

        // ======================================
        // ENVIAR CADASTRO PARA O DJANGO
        // ======================================

        mensagem.textContent = "Criando sua conta...";
        mensagem.style.color = "";
        botao.disabled = true;

        try {
            const resposta = await fetch(
                "https://beuren-store-api.onrender.com/api/accounts/register/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                const erros = Object.values(dados).flat();

                throw new Error(
                    erros.join(" ") || "Não foi possível criar a conta."
                );
            }

            // ======================================
            // CADASTRO REALIZADO
            // ======================================

            sessionStorage.removeItem("email_verificacao");

            mensagem.textContent =
                "Conta criada com sucesso! Redirecionando para o login...";

            mensagem.style.color = "green";

            window.location.href = "./login.html";

        } catch (erro) {
            console.error("Erro no cadastro:", erro);

            mensagem.textContent =
                erro.message || "Erro ao criar a conta.";

            mensagem.style.color = "red";

        } finally {
            botao.disabled = false;
        }
    });
}
