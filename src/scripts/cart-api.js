
const API_CART = "http://127.0.0.1:8000/api/cart/";

// ==========================================
// AUTENTICACAO
// ==========================================

export function getToken() {
  return sessionStorage.getItem("auth_token");
}

// ==========================================
// REQUISICOES PARA O DJANGO
// ==========================================

export async function cartRequest(endpoint = "", method = "GET", body = null) {
  const token = getToken();

  if (!token) {
    throw new Error("Usuario nao autenticado.");
  }

  const headers = {
    Authorization: `Token ${token}`
  };

  if (body !== null) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_CART}${endpoint}`, {
    method,
    headers,
    ...(body !== null ? { body: JSON.stringify(body) } : {})
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.detail ||
      "Erro ao acessar o carrinho."
    );
  }

  return data;
}

// ==========================================
// CARRINHO LOCAL DE VISITANTES
// ==========================================

export function getLocalCart() {
  try {
    const cart = JSON.parse(
      localStorage.getItem("carrinho") || "[]"
    );

    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

export function saveLocalCart(cart) {
  localStorage.setItem("carrinho", JSON.stringify(cart));
}

// ==========================================
// ADICIONAR PRODUTO
// ==========================================

export async function addToCart(product) {
  const token = getToken();

  if (token) {
    return cartRequest("add/", "POST", {
      product_id: Number(product.id),
      quantity: 1
    });
  }

  const cart = getLocalCart();

  const existing = cart.find(
    item => Number(item.id) === Number(product.id)
  );

  if (existing) {
    existing.quantidade = Number(existing.quantidade) + 1;
  } else {
    cart.push({
      ...product,
      id: Number(product.id),
      quantidade: 1
    });
  }

  saveLocalCart(cart);
  return cart;
}

// ==========================================
// CONTADOR
// ==========================================

export async function getCartCount() {
  if (getToken()) {
    const cart = await cartRequest();

    return cart.items.reduce(
      (total, item) => total + Number(item.quantity),
      0
    );
  }

  return getLocalCart().reduce(
    (total, item) => total + Number(item.quantidade || 0),
    0
  );
}

// ==========================================
// SINCRONIZAR CARRINHO DO VISITANTE
// ==========================================

export async function syncLocalCart() {
  if (!getToken()) return;

  const localCart = getLocalCart();
  if (!localCart.length) return;

  const remaining = [...localCart];

  for (const item of localCart) {
    try {
      await cartRequest("add/", "POST", {
        product_id: Number(item.id),
        quantity: Number(item.quantidade)
      });

      const index = remaining.indexOf(item);

      if (index !== -1) {
        remaining.splice(index, 1);
        saveLocalCart(remaining);
      }
    } catch (error) {
      console.error(
        `Nao foi possivel sincronizar o produto ${item.id}:`,
        error
      );
    }
  }
}
