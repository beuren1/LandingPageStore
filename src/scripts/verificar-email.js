
const form = document.getElementById('form-verificacao');
const campoCodigo = document.getElementById('codigo');
const mensagem = document.getElementById('mensagem-verificacao');
const botao = document.getElementById('btn-verificar');
const emailDestino = document.getElementById('email-destino');

const email = sessionStorage.getItem('email_verificacao');

// Verifica se o usuario veio do cadastro
if (!email) {
    mensagem.textContent =
        'Nenhum cadastro pendente. Crie uma conta primeiro.';

    botao.disabled = true;
} else {
    emailDestino.textContent = `E-mail: ${email}`;
}

// Aceita somente numeros
campoCodigo.addEventListener('input', () => {
    campoCodigo.value = campoCodigo.value
        .replace(/\D/g, '')
        .slice(0, 6);
});

// Envia o codigo para o Django
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!email) return;

    const codigo = campoCodigo.value.trim();

    if (!/^\d{6}$/.test(codigo)) {
        mensagem.textContent =
            'Digite um código válido de 6 números.';
        return;
    }

    botao.disabled = true;
    mensagem.textContent = 'Verificando código...';

    try {
        const resposta = await fetch(
            'http://127.0.0.1:8000/api/accounts/verify-email/',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    code: codigo
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.error ||
                'Não foi possível verificar o código.'
            );
        }

        sessionStorage.removeItem('email_verificacao');

        mensagem.style.color = '#237a32';
        mensagem.textContent =
            'E-mail confirmado! Sua conta foi ativada.';

        form.reset();
        botao.textContent = 'Conta ativada';
        botao.disabled = true;

    } catch (erro) {
        mensagem.style.color = '#b51c1c';
        mensagem.textContent = erro.message;
        botao.disabled = false;
    }
});
