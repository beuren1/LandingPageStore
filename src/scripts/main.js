
import {
  addToCart,
  getCartCount,
  syncLocalCart
} from "./cart-api.js";

// ==========================================
// CONFIGURACOES DA API
// ==========================================

const API_ACCOUNTS = "http://127.0.0.1:8000/api/accounts/";
const API_PRODUCTS = "http://127.0.0.1:8000/api/products/";

// ==========================================
// SCROLL SUAVE
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");

    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();

    const header = document.querySelector(".site-header");
    const headerOffset = header ? header.offsetHeight : 90;

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerOffset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth"
    });
  });
});

// ==========================================
// HEADER AO ROLAR
// ==========================================

function atualizarHeader() {
  const header = document.querySelector(".site-header");

  if (!header) return;

  header.classList.toggle("scrolled", window.scrollY > 10);
}

window.addEventListener("scroll", atualizarHeader);
atualizarHeader();

// ==========================================
// MENU MOBILE
// ==========================================

(() => {
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  if (!burger || !nav) return;

  function fecharMenu() {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }

  burger.addEventListener("click", () => {
    const aberto = nav.classList.toggle("is-open");

    burger.classList.toggle("is-open", aberto);
    burger.setAttribute("aria-expanded", String(aberto));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", fecharMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      fecharMenu();
    }
  });
})();

// ==========================================
// FORMULARIO DE CONTATO
// ==========================================

const formContato = document.getElementById("form-contato");

if (formContato) {
  formContato.addEventListener("submit", (event) => {
    event.preventDefault();

    alert("O envio de mensagens será implementado em breve.");
  });
}

// ==========================================
// FAQ
// ==========================================

const faqToggles = document.querySelectorAll(".faq-toggle");

faqToggles.forEach((botao) => {
  botao.addEventListener("click", () => {
    const panelId = botao.getAttribute("aria-controls");
    const painel = document.getElementById(panelId);

    if (!painel) return;

    const estavaAberto =
      botao.getAttribute("aria-expanded") === "true";

    faqToggles.forEach((outroBotao) => {
      const outroId = outroBotao.getAttribute("aria-controls");
      const outroPainel = document.getElementById(outroId);
      const icone = outroBotao.querySelector(".icon");

      outroBotao.setAttribute("aria-expanded", "false");

      if (outroPainel) outroPainel.hidden = true;
      if (icone) icone.textContent = "+";
    });

    if (!estavaAberto) {
      botao.setAttribute("aria-expanded", "true");
      painel.hidden = false;

      const icone = botao.querySelector(".icon");

      if (icone) icone.textContent = "−";
    }
  });
});

// ==========================================
// HERO / CARROSSEL
// ==========================================

(() => {
  const hero = document.querySelector(".hero");
  const slidesWrap = document.querySelector(".hero-slides");

  if (!hero || !slidesWrap) return;

  const slides = Array.from(
    slidesWrap.querySelectorAll(".slide")
  );

  if (slides.length === 0) return;

  const controls = hero.querySelector(".hero-controls");
  if (!controls) return;

  const btnPrev = controls.querySelector(".arrow.prev");
  const btnNext = controls.querySelector(".arrow.next");
  const dotsWrap = controls.querySelector(".dots");

  if (dotsWrap) {
    dotsWrap.innerHTML = "";

    slides.forEach((_, i) => {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("aria-label", `Ir para o slide ${i + 1}`);

      dotsWrap.appendChild(dot);
    });
  }

  const dots = dotsWrap
    ? Array.from(dotsWrap.querySelectorAll(".dot"))
    : [];

  let index = slides.findIndex((slide) =>
    slide.classList.contains("is-active")
  );

  if (index < 0) index = 0;

  let timer = null;
  const INTERVAL = 3500;

  function setActive(i) {
    slides.forEach((slide, k) => {
      slide.classList.toggle("is-active", k === i);
    });

    dots.forEach((dot, k) => {
      dot.classList.toggle("is-active", k === i);
    });

    index = i;
  }

  function next() {
    setActive((index + 1) % slides.length);
  }

  function prev() {
    setActive((index - 1 + slides.length) % slides.length);
  }

  function stop() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function start() {
    stop();
    timer = setInterval(next, INTERVAL);
  }

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      next();
      start();
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      prev();
      start();
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      setActive(i);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  hero.addEventListener("focusin", stop);
  hero.addEventListener("focusout", start);

  let touchX = null;

  hero.addEventListener(
    "touchstart",
    (event) => {
      touchX = event.touches[0].clientX;
    },
    { passive: true }
  );

  hero.addEventListener("touchend", (event) => {
    if (touchX === null) return;

    const dx = event.changedTouches[0].clientX - touchX;

    if (Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();

      start();
    }

    touchX = null;
  });

  setActive(index);
  start();
})();

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
// ELEMENTOS DOS PRODUTOS E OFERTAS
// ==========================================

const listaProdutos = document.getElementById("lista-produtos");
const listaOfertas = document.getElementById("lista-ofertas");

// ==========================================
// CRIAR CARD DE PRODUTO
// ==========================================

function criarCardProduto(produto, mostrarDescricao = true) {
  const card = document.createElement("article");
  card.className = "produto";

  // IMAGEM
  if (produto.image) {
    const imagem = document.createElement("img");

    imagem.src = produto.image;
    imagem.alt = produto.name || "Produto";
    imagem.loading = "lazy";

    card.appendChild(imagem);
  }

  // NOME
  const nome = document.createElement("h4");
  nome.textContent = produto.name || "Produto sem nome";

  card.appendChild(nome);

  // DESCRICAO
  if (mostrarDescricao) {
    const descricao = document.createElement("p");

    descricao.textContent = produto.description || "";

    card.appendChild(descricao);
  }

  // PRECO
  const preco = document.createElement("p");
  preco.className = "price";
  preco.textContent = formatarPreco(produto.price);

  card.appendChild(preco);

  // ESTOQUE
  const estoque = document.createElement("p");
  estoque.textContent = `Estoque: ${produto.stock}`;

  card.appendChild(estoque);

  // BOTAO DO CARRINHO
  const botao = document.createElement("button");

  botao.type = "button";
  botao.className = "btn-adicionar-carrinho";
  botao.textContent = "Adicionar ao carrinho";

  botao.dataset.id = String(produto.id);
  botao.dataset.name = produto.name || "";
  botao.dataset.price = String(produto.price);
  botao.dataset.image = produto.image || "";

  if (Number(produto.stock) <= 0) {
    botao.disabled = true;
    botao.textContent = "Produto esgotado";
  }

  card.appendChild(botao);

  return card;
}


// ==========================================
// FILTROS MASCULINO / FEMININO
// ==========================================

let generoSelecionado = "masculino";
let produtosCatalogo = [];
let categoriaSelecionada = "calcas";

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function identificarGenero(produto) {
  const nome = normalizarTexto(produto.name);

  if (/\bfeminin[ao]s?\b/.test(nome)) {
    return "feminino";
  }

  // Produtos antigos, ainda sem identificacao,
  // permanecem na colecao masculina.
  return "masculino";
}

function identificarCategoria(produto) {
  const nome = normalizarTexto(produto.name);

  if (
    nome.includes("calca") ||
    nome.includes("jeans") ||
    nome.includes("bermuda")
  ) {
    return "calcas";
  }

  if (
    nome.includes("tenis") ||
    nome.includes("sneaker")
  ) {
    return "tenis";
  }

  if (
    nome.includes("camisa") ||
    nome.includes("camiseta") ||
    nome.includes("moletom") ||
    nome.includes("blusa") ||
    nome.includes("hoodie")
  ) {
    return "camisas";
  }

  return "outros";
}


// ==========================================
// MOSTRAR APENAS A CATEGORIA SELECIONADA
// ==========================================

function renderizarCategorias() {
  if (!listaProdutos) return;

  listaProdutos.innerHTML = "";

  const filtrados = produtosCatalogo.filter((produto) => {
    const generoCorreto =
      identificarGenero(produto) === generoSelecionado;

    const categoriaCorreta =
      identificarCategoria(produto) === categoriaSelecionada;

    return generoCorreto && categoriaCorreta;
  });

  if (filtrados.length === 0) {
    const mensagem = document.createElement("p");
    mensagem.className = "sem-produtos";
    mensagem.textContent =
      "Nenhum produto encontrado nesta categoria.";

    listaProdutos.appendChild(mensagem);
    return;
  }

  const grade = document.createElement("div");
  grade.className = "grid-produtos grid-4";

  filtrados.forEach((produto) => {
    grade.appendChild(criarCardProduto(produto, true));
  });

  listaProdutos.appendChild(grade);
}


// ==========================================
// EVENTOS DOS DOIS BOTOES
// ==========================================

document.querySelectorAll(".btn-genero").forEach((botao) => {
  botao.addEventListener("click", () => {
    generoSelecionado = botao.dataset.genero;

    document.querySelectorAll(".btn-genero").forEach((outro) => {
      outro.classList.toggle(
        "ativo",
        outro === botao
      );
    });

    renderizarCategorias();
  });
});


// ==========================================
// BOTOES CALCAS / CAMISAS / TENIS
// ==========================================

document.querySelectorAll(".btn-categoria").forEach((botao) => {
  botao.addEventListener("click", () => {
    categoriaSelecionada = botao.dataset.categoria;

    document.querySelectorAll(".btn-categoria").forEach((outro) => {
      outro.classList.toggle("ativo", outro === botao);
    });

    renderizarCategorias();
  });
});



// ==========================================
// CARREGAR PRODUTOS DA API DJANGO
// ==========================================

async function carregarProdutos() {
  if (!listaProdutos && !listaOfertas) return;

  try {
    console.log("Buscando produtos da API...");

    const resposta = await fetch(API_PRODUCTS);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const dados = await resposta.json();

    const produtos = Array.isArray(dados)
      ? dados
      : Array.isArray(dados.results)
        ? dados.results
        : [];

    console.log("Produtos recebidos:", produtos);

    // ======================================
    // NOSSOS PRODUTOS
    // ======================================

    produtosCatalogo = produtos;
    renderizarCategorias();

    console.log("Produtos carregados:", produtos.length);

    // ======================================
    // OFERTAS ESPECIAIS
    // ======================================

    if (listaOfertas) {
      listaOfertas.innerHTML = "";

      // Mostra todos os produtos do Django.
      // Para limitar a 4, use produtos.slice(0, 4).
      const ofertas = produtos.slice(0, 4);

      if (ofertas.length === 0) {
        listaOfertas.textContent =
          "Nenhuma oferta disponível.";
      } else {
        ofertas.forEach((produto) => {
          const card = criarCardProduto(produto, false);

          listaOfertas.appendChild(card);
        });
      }

      console.log("Ofertas carregadas:", ofertas.length);
    }

  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);

    if (listaProdutos) {
      listaProdutos.textContent =
        "Não foi possível carregar os produtos. Verifique o Django.";
    }

    if (listaOfertas) {
      listaOfertas.textContent =
        "Não foi possível carregar as ofertas.";
    }
  }
}

// ==========================================
// CONTADOR DO CARRINHO
// ==========================================

async function atualizarContadorCarrinho() {
  const contador = document.getElementById("contador-carrinho");

  if (!contador) return;

  try {
    const quantidade = await getCartCount();

    contador.textContent = String(quantidade);

  } catch (erro) {
    console.error("Erro ao atualizar carrinho:", erro);

    contador.textContent = "!";
  }
}

// ==========================================
// ADICIONAR AO CARRINHO
// FUNCIONA PARA PRODUTOS E OFERTAS
// ==========================================

document.addEventListener("click", async (event) => {
  const alvo = event.target;

  if (!(alvo instanceof Element)) return;

  const botao = alvo.closest(".btn-adicionar-carrinho");

  if (!botao || botao.disabled) return;

  const produto = {
    id: Number(botao.dataset.id),
    name: botao.dataset.name,
    price: Number(botao.dataset.price),
    image: botao.dataset.image || ""
  };

  if (
    !Number.isInteger(produto.id) ||
    produto.id <= 0 ||
    !produto.name ||
    !Number.isFinite(produto.price) ||
    produto.price < 0
  ) {
    alert("Produto inválido.");
    return;
  }

  const textoOriginal = botao.textContent;

  botao.disabled = true;
  botao.textContent = "Adicionando...";

  try {
    await addToCart(produto);

    await atualizarContadorCarrinho();

    alert(`${produto.name} foi adicionado ao carrinho!`);

  } catch (erro) {
    console.error("Erro ao adicionar produto:", erro);

    alert(erro.message || "Erro ao adicionar produto.");

  } finally {
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }
});

// ==========================================
// AUTENTICACAO
// ==========================================

const menuLogin = document.getElementById("menu-login");
const menuUsuario = document.getElementById("menu-usuario");
const nomeUsuario = document.getElementById("nome-usuario");
const btnSair = document.getElementById("btn-sair");

function mostrarVisitante() {
  if (menuLogin) menuLogin.hidden = false;
  if (menuUsuario) menuUsuario.hidden = true;
  if (nomeUsuario) nomeUsuario.textContent = "";
}

function mostrarUsuario(usuario) {
  if (menuLogin) menuLogin.hidden = true;
  if (menuUsuario) menuUsuario.hidden = false;

  if (nomeUsuario) {
    nomeUsuario.textContent = `Olá, ${usuario.username}`;
  }
}

// ==========================================
// VERIFICAR LOGIN
// ==========================================

async function verificarAutenticacao() {
  const token = sessionStorage.getItem("auth_token");

  if (!token) {
    mostrarVisitante();
    return false;
  }

  try {
    const resposta = await fetch(`${API_ACCOUNTS}me/`, {
      headers: {
        Authorization: `Token ${token}`
      }
    });

    if (
      resposta.status === 401 ||
      resposta.status === 403
    ) {
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("usuario_nome");

      mostrarVisitante();
      return false;
    }

    if (!resposta.ok) {
      throw new Error("Erro ao verificar autenticação.");
    }

    const usuario = await resposta.json();

    mostrarUsuario(usuario);

    return true;

  } catch (erro) {
    console.error("Erro de autenticação:", erro);

    mostrarVisitante();

    return false;
  }
}

// ==========================================
// LOGOUT
// ==========================================

if (btnSair) {
  btnSair.addEventListener("click", async () => {
    const token = sessionStorage.getItem("auth_token");

    btnSair.disabled = true;

    try {
      if (token) {
        const resposta = await fetch(`${API_ACCOUNTS}logout/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`
          }
        });

        if (
          !resposta.ok &&
          resposta.status !== 401 &&
          resposta.status !== 403
        ) {
          throw new Error("Não foi possível encerrar a sessão.");
        }
      }

      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("usuario_nome");

      mostrarVisitante();

      window.location.href = "./index.html";

    } catch (erro) {
      console.error("Erro no logout:", erro);

      alert("Não foi possível sair. Tente novamente.");

    } finally {
      btnSair.disabled = false;
    }
  });
}

// ==========================================
// SINCRONIZAR CARRINHO COM DJANGO
// ==========================================

async function iniciarCarrinho(autenticado) {
  if (autenticado) {
    try {
      await syncLocalCart();

    } catch (erro) {
      console.error("Erro ao sincronizar carrinho:", erro);
    }
  }

  await atualizarContadorCarrinho();
}

// ==========================================
// INICIALIZACAO GERAL
// ==========================================

async function iniciarLoja() {
  mostrarVisitante();

  const autenticado = await verificarAutenticacao();

  await iniciarCarrinho(autenticado);
}

carregarProdutos();
iniciarLoja();
