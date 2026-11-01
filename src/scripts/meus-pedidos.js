
import { getToken } from "./cart-api.js";

const API_PEDIDOS =
  "http://127.0.0.1:8000/api/orders/my-orders/";

const lista = document.getElementById("lista-pedidos");
const mensagem = document.getElementById("mensagem-pedidos");

const STATUS = {
  pending: "Pendente",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado"
};

// ==========================================
// FORMATACAO
// ==========================================

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarData(data) {
  if (!data) return "Data não informada";

  const valor = new Date(data);

  if (Number.isNaN(valor.getTime())) {
    return "Data não informada";
  }

  return valor.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

// ==========================================
// CRIAR ELEMENTOS COM SEGURANCA
// ==========================================

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);

  if (classe) elemento.className = classe;

  if (texto !== undefined && texto !== null) {
    elemento.textContent = String(texto);
  }

  return elemento;
}

// ==========================================
// MOSTRAR UM PEDIDO
// ==========================================

function renderizarPedido(pedido) {
  const card = criarElemento("article", "pedido-card");

  // CABECALHO
  const cabecalho = criarElemento("div", "pedido-topo");

  const identificacao = criarElemento("div", "pedido-identificacao");

  identificacao.append(
    criarElemento("h2", "", `Pedido #${pedido.id}`),
    criarElemento(
      "p",
      "pedido-data",
      `Realizado em ${formatarData(pedido.created_at)}`
    )
  );

  const status = criarElemento(
    "span",
    "pedido-status",
    STATUS[pedido.status] || pedido.status
  );

  status.classList.add(`status-${pedido.status}`);

  cabecalho.append(identificacao, status);
  card.appendChild(cabecalho);

  // PRODUTOS
  const produtos = criarElemento("div", "pedido-produtos");

  for (const item of pedido.items || []) {
    const linha = criarElemento("div", "pedido-produto");

    const nome = criarElemento(
      "span",
      "",
      `${item.product_name} × ${item.quantity}`
    );

    const subtotal =
      Number(item.unit_price) * Number(item.quantity);

    const valor = criarElemento(
      "strong",
      "",
      formatarPreco(subtotal)
    );

    linha.append(nome, valor);
    produtos.appendChild(linha);
  }

  card.appendChild(produtos);

  // ENDERECO
  const endereco = criarElemento("div", "pedido-endereco");

  endereco.appendChild(
    criarElemento("h3", "", "Endereço de entrega")
  );

  const primeiraLinha =
    `${pedido.street}, ${pedido.number}` +
    (pedido.complement ? ` - ${pedido.complement}` : "");

  endereco.append(
    criarElemento("p", "", pedido.recipient_name),
    criarElemento("p", "", primeiraLinha),
    criarElemento("p", "", pedido.neighborhood),
    criarElemento(
      "p",
      "",
      `${pedido.city} - ${pedido.state}, CEP ${pedido.zip_code}`
    )
  );

  card.appendChild(endereco);

  // TOTAL
  const rodape = criarElemento("div", "pedido-rodape");

  rodape.append(
    criarElemento("span", "", "Total do pedido"),
    criarElemento(
      "strong",
      "",
      formatarPreco(pedido.total)
    )
  );

  card.appendChild(rodape);

  return card;
}

// ==========================================
// CARREGAR PEDIDOS DO DJANGO
// ==========================================

async function carregarPedidos() {
  const token = getToken();

  lista.innerHTML = "";

  if (!token) {
    mensagem.textContent =
      "Você precisa entrar na sua conta para ver seus pedidos.";

    const link = criarElemento("a", "pedidos-link", "Fazer login");
    link.href = "./login.html";
    lista.appendChild(link);

    return;
  }

  try {
    const resposta = await fetch(API_PEDIDOS, {
      headers: {
        Authorization: `Token ${token}`
      }
    });

    if (resposta.status === 401 || resposta.status === 403) {
      sessionStorage.removeItem("auth_token");

      mensagem.textContent =
        "Sua sessão expirou. Faça login novamente.";

      const link = criarElemento(
        "a",
        "pedidos-link",
        "Entrar novamente"
      );

      link.href = "./login.html";
      lista.appendChild(link);

      return;
    }

    if (!resposta.ok) {
      throw new Error(
        `Erro ao carregar pedidos: ${resposta.status}`
      );
    }

    const dados = await resposta.json();

    const pedidos = Array.isArray(dados)
      ? dados
      : Array.isArray(dados.results)
        ? dados.results
        : [];

    mensagem.textContent = "";

    if (pedidos.length === 0) {
      mensagem.textContent =
        "Você ainda não realizou nenhum pedido.";

      const link = criarElemento(
        "a",
        "pedidos-link",
        "Ver produtos"
      );

      link.href = "./index.html#produtos";
      lista.appendChild(link);

      return;
    }

    pedidos.forEach((pedido) => {
      lista.appendChild(renderizarPedido(pedido));
    });

  } catch (erro) {
    console.error("Erro ao buscar pedidos:", erro);

    mensagem.textContent =
      "Não foi possível carregar seus pedidos. Verifique se o Django está funcionando.";
  }
}

carregarPedidos();

