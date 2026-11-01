
import {
  cartRequest,
  getToken,
  getLocalCart,
  saveLocalCart
} from "./cart-api.js";

// ==========================================
// ELEMENTOS DA PAGINA
// ==========================================

const lista = document.getElementById("lista-carrinho");
const subtotalElemento = document.getElementById("subtotal-carrinho");
const totalElemento = document.getElementById("total-carrinho");
const botaoFinalizar = document.getElementById("finalizar-compra");

// ==========================================
// ESTADO DO CARRINHO
// ==========================================

let itensCarrinho = [];
let carregando = false;
let operando = false;

// ==========================================
// FORMATAR PRECO
// ==========================================

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// ==========================================
// CARREGAR CARRINHO
// ==========================================

async function carregarCarrinho() {
  if (!lista || carregando) return;

  carregando = true;
  lista.textContent = "Carregando seu carrinho...";

  try {
    if (getToken()) {
      // Usuario autenticado: busca no Django.
      const dados = await cartRequest();

      itensCarrinho = dados.items.map((item) => ({
        id: Number(item.product_id),
        name: item.name,
        price: Number(item.price),
        image: item.image || "",
        quantidade: Number(item.quantity)
      }));

    } else {
      // Visitante: utiliza o carrinho local.
      itensCarrinho = getLocalCart().map((item) => ({
        id: Number(item.id),
        name: item.name,
        price: Number(item.price),
        image: item.image || "",
        quantidade: Number(item.quantidade)
      }));
    }

    renderizarCarrinho();

  } catch (erro) {
    console.error("Erro ao carregar carrinho:", erro);

    lista.textContent =
      "Não foi possível carregar seu carrinho. Verifique a conexão com o Django.";

    if (subtotalElemento) {
      subtotalElemento.textContent = "—";
    }

    if (totalElemento) {
      totalElemento.textContent = "—";
    }

    if (botaoFinalizar) {
      botaoFinalizar.disabled = true;
    }

  } finally {
    carregando = false;
  }
}

// ==========================================
// RENDERIZAR CARRINHO
// ==========================================

function renderizarCarrinho() {
  if (!lista) return;

  lista.innerHTML = "";

  if (itensCarrinho.length === 0) {
    const vazio = document.createElement("div");
    vazio.className = "carrinho-vazio";

    const icone = document.createElement("i");
    icone.className = "fa-solid fa-cart-shopping";

    const titulo = document.createElement("h2");
    titulo.textContent = "Seu carrinho está vazio";

    const descricao = document.createElement("p");
    descricao.textContent = "Adicione produtos para continuar.";

    const link = document.createElement("a");
    link.href = "./index.html#produtos";
    link.className = "btn-voltar-loja";
    link.textContent = "Ver produtos";

    vazio.append(icone, titulo, descricao, link);
    lista.appendChild(vazio);

    atualizarTotal(0);
    return;
  }

  let total = 0;

  itensCarrinho.forEach((item) => {
    const subtotal = item.price * item.quantidade;
    total += subtotal;

    const card = document.createElement("article");
    card.className = "item-carrinho";

    // ======================================
    // IMAGEM
    // ======================================

    const imagemContainer = document.createElement("div");
    imagemContainer.className = "item-imagem";

    if (item.image) {
      const imagem = document.createElement("img");
      imagem.src = item.image;
      imagem.alt = item.name || "Produto";
      imagem.loading = "lazy";

      imagemContainer.appendChild(imagem);
    } else {
      const semImagem = document.createElement("div");
      semImagem.className = "sem-imagem";

      const icone = document.createElement("i");
      icone.className = "fa-solid fa-shirt";

      semImagem.appendChild(icone);
      imagemContainer.appendChild(semImagem);
    }

    // ======================================
    // INFORMACOES
    // ======================================

    const info = document.createElement("div");
    info.className = "item-info";

    const nome = document.createElement("h3");
    nome.textContent = item.name;

    const preco = document.createElement("p");
    preco.className = "item-preco";
    preco.textContent = formatarPreco(item.price);

    // ======================================
    // QUANTIDADE
    // ======================================

    const controle = document.createElement("div");
    controle.className = "controle-quantidade";

    const diminuir = document.createElement("button");
    diminuir.type = "button";
    diminuir.className = "diminuir";
    diminuir.dataset.id = String(item.id);
    diminuir.textContent = "−";
    diminuir.disabled = item.quantidade <= 1;

    const quantidade = document.createElement("span");
    quantidade.textContent = item.quantidade;

    const aumentar = document.createElement("button");
    aumentar.type = "button";
    aumentar.className = "aumentar";
    aumentar.dataset.id = String(item.id);
    aumentar.textContent = "+";

    controle.append(diminuir, quantidade, aumentar);

    info.append(nome, preco, controle);

    // ======================================
    // SUBTOTAL E REMOVER
    // ======================================

    const lateral = document.createElement("div");
    lateral.className = "item-lateral";

    const subtotalTexto = document.createElement("strong");
    subtotalTexto.className = "item-subtotal";
    subtotalTexto.textContent = formatarPreco(subtotal);

    const remover = document.createElement("button");
    remover.type = "button";
    remover.className = "remover";
    remover.dataset.id = String(item.id);

    const iconeLixeira = document.createElement("i");
    iconeLixeira.className = "fa-solid fa-trash";

    remover.append(iconeLixeira, " Remover");

    lateral.append(subtotalTexto, remover);

    // ======================================
    // MONTAR CARD
    // ======================================

    card.append(imagemContainer, info, lateral);
    lista.appendChild(card);
  });

  atualizarTotal(total);
}

// ==========================================
// ATUALIZAR TOTAL
// ==========================================

function atualizarTotal(total) {
  if (subtotalElemento) {
    subtotalElemento.textContent = formatarPreco(total);
  }

  if (totalElemento) {
    totalElemento.textContent = formatarPreco(total);
  }

  if (botaoFinalizar) {
    botaoFinalizar.disabled = itensCarrinho.length === 0;
  }
}

// ==========================================
// ALTERAR QUANTIDADE OU REMOVER
// ==========================================

async function alterarItem(id, acao) {
  if (operando) return;

  const item = itensCarrinho.find(
    (produto) => produto.id === id
  );

  if (!item) return;

  operando = true;

  try {
    if (getToken()) {
      // ====================================
      // USUARIO LOGADO - DJANGO
      // ====================================

      if (acao === "remover") {
        await cartRequest("remove/", "DELETE", {
          product_id: id
        });

      } else {
        const novaQuantidade =
          item.quantidade + (acao === "aumentar" ? 1 : -1);

        if (novaQuantidade < 1) return;

        await cartRequest("update/", "PATCH", {
          product_id: id,
          quantity: novaQuantidade
        });
      }

      // Recarrega os valores oficiais do banco.
      await carregarCarrinho();

    } else {
      // ====================================
      // VISITANTE - LOCALSTORAGE
      // ====================================

      let carrinho = getLocalCart();

      if (acao === "remover") {
        carrinho = carrinho.filter(
          (produto) => Number(produto.id) !== id
        );

      } else {
        const produto = carrinho.find(
          (produto) => Number(produto.id) === id
        );

        if (produto) {
          const novaQuantidade =
            Number(produto.quantidade) +
            (acao === "aumentar" ? 1 : -1);

          if (novaQuantidade >= 1) {
            produto.quantidade = novaQuantidade;
          }
        }
      }

      saveLocalCart(carrinho);
      await carregarCarrinho();
    }

  } catch (erro) {
    console.error("Erro ao alterar carrinho:", erro);
    alert(erro.message || "Não foi possível alterar o carrinho.");

  } finally {
    operando = false;
  }
}

// ==========================================
// EVENTOS DOS BOTOES
// ==========================================

if (lista) {
  lista.addEventListener("click", async (event) => {
    const alvo = event.target;

    if (!(alvo instanceof Element)) return;

    const botao = alvo.closest("button[data-id]");
    if (!botao) return;

    const id = Number(botao.dataset.id);

    if (!Number.isInteger(id) || id <= 0) return;

    if (botao.classList.contains("aumentar")) {
      await alterarItem(id, "aumentar");

    } else if (botao.classList.contains("diminuir")) {
      await alterarItem(id, "diminuir");

    } else if (botao.classList.contains("remover")) {
      await alterarItem(id, "remover");
    }
  });
}

// ==========================================
// FINALIZAR COMPRA
// ==========================================

if (botaoFinalizar) {
  botaoFinalizar.addEventListener("click", () => {
    if (!itensCarrinho.length) {
      alert("Seu carrinho está vazio.");
      return;
    }

    if (!getToken()) {
      alert("Faça login antes de finalizar o pedido.");
      window.location.href = "./login.html";
      return;
    }

    window.location.href = "./checkout.html";
  });
}

// ==========================================
// INICIALIZACAO
// ==========================================

carregarCarrinho();
