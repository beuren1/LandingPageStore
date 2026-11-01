
import { cartRequest, getToken } from "./cart-api.js";

const form = document.getElementById("form-checkout");
const mensagem = document.getElementById("mensagem-checkout");
const botao = document.getElementById("btn-confirmar-pedido");
const lista = document.getElementById("checkout-itens");
const totalElemento = document.getElementById("checkout-total");

const API_CHECKOUT = "https://beuren-store-api.onrender.com/api/orders/checkout/";

let podeConfirmar = false;
let enviando = false;

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.style.color = erro ? "#b51c1c" : "#237a32";
}

async function carregarResumo() {
  botao.disabled = true;

  if (!getToken()) {
    lista.textContent = "Faça login para finalizar o pedido.";
    mostrarMensagem("Você precisa entrar na sua conta.", true);
    return;
  }

  try {
    const carrinho = await cartRequest();

    lista.innerHTML = "";

    if (!carrinho.items.length) {
      lista.textContent = "Seu carrinho está vazio.";
      mostrarMensagem("Adicione produtos antes de finalizar.", true);
      return;
    }

    let total = 0;

    for (const item of carrinho.items) {
      const subtotal = Number(item.price) * Number(item.quantity);
      total += subtotal;

      const linha = document.createElement("div");
      linha.className = "checkout-item";

      const nome = document.createElement("span");
      nome.textContent = `${item.name} × ${item.quantity}`;

      const preco = document.createElement("strong");
      preco.textContent = formatarPreco(subtotal);

      linha.append(nome, preco);
      lista.appendChild(linha);
    }

    totalElemento.textContent = formatarPreco(total);

    podeConfirmar = true;
    botao.disabled = false;

  } catch (erro) {
    console.error(erro);
    lista.textContent = "Não foi possível carregar o carrinho.";
    mostrarMensagem(erro.message, true);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!podeConfirmar || enviando || !getToken()) return;

  const campos = [
    "recipient_name",
    "zip_code",
    "street",
    "number",
    "complement",
    "neighborhood",
    "city",
    "state"
  ];

  const endereco = {};

  campos.forEach((campo) => {
    endereco[campo] = document.getElementById(campo).value.trim();
  });

  endereco.state = endereco.state.toUpperCase();

  if (!/^\d{5}-?\d{3}$/.test(endereco.zip_code)) {
    mostrarMensagem("Digite um CEP válido com 8 números.", true);
    return;
  }

  if (!/^[A-Z]{2}$/.test(endereco.state)) {
    mostrarMensagem("Digite uma UF válida, como MG.", true);
    return;
  }

  enviando = true;
  botao.disabled = true;
  botao.textContent = "Registrando pedido...";

  try {
    const resposta = await fetch(API_CHECKOUT, {
      method: "POST",
      headers: {
        Authorization: `Token ${getToken()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(endereco)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.error ||
        JSON.stringify(dados) ||
        "Erro ao criar pedido."
      );
    }

    podeConfirmar = false;

    mostrarMensagem(
      `Pedido #${dados.id} registrado com sucesso!`
    );

    lista.textContent = "Pedido registrado.";
    totalElemento.textContent = formatarPreco(dados.total);
    botao.textContent = "Pedido registrado";
    form.reset();

    // Redireciona para o histórico de pedidos.
    window.location.replace("./meus-pedidos.html");

  } catch (erro) {
    console.error(erro);
    mostrarMensagem(erro.message, true);
    botao.textContent = "Confirmar pedido de teste";
    botao.disabled = false;

  } finally {
    enviando = false;
  }
});

carregarResumo();
