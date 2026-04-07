/**
 * ALKE WALLET - Menú Principal
 * menu.js - Manejo del menú y estadísticas conectado al REST API Backend
 */

$(document).ready(async function () {
  console.log("🏠 Menú Principal Cargado - Alke Wallet (API)");

  const API_URL = "http://localhost:3000/api/v1";

  // Verificar autenticación
  verificarAutenticacion();

  // Actualizar todos los datos desde la DB
  await sincronizarConBackend();

  // Eventos de los botones
  configurarEventos();

  function verificarAutenticacion() {
    if (!localStorage.getItem("token")) {
      alert("⚠️ Debes iniciar sesión primero");
      window.location.href = "index.html";
      return;
    }
  }

  async function sincronizarConBackend() {
    try {
      // 1. Obtener perfil
      const resPerfil = await fetch(`${API_URL}/usuarios/perfil`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const perfilData = await resPerfil.json();

      if (perfilData.status === "success") {
        const u = perfilData.data;
        $("#nombreUsuario").text(`👤 ${u.nombre}`);
        $("#saldoActual")
          .text("$" + formatearNumero(u.saldo))
          .addClass("fade-in");
        localStorage.setItem("saldo", u.saldo.toString());
      }

      // 2. Obtener transacciones
      const resTrans = await fetch(`${API_URL}/transacciones`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const transData = await resTrans.json();

      if (transData.status === "success") {
        const movimientos = transData.data;
        let contadorDepositos = 0;
        let contadorTransferencias = 0;
        let miId = parseInt(localStorage.getItem("idUsuario"));

        movimientos.forEach(function (mov) {
          if (mov.tipo === "deposito") contadorDepositos++;
          if (mov.tipo === "transferencia") contadorTransferencias++;
        });

        $("#totalDepositos").text(contadorDepositos).addClass("fade-in");
        $("#totalTransferencias")
          .text(contadorTransferencias)
          .addClass("fade-in");
        $("#totalMovimientos").text(movimientos.length).addClass("fade-in");

        // Obtener la cuenta de los contactos desde el backend
        let numContactos = 0;
        try {
          const usuarioId = localStorage.getItem("idUsuario") || 1;
          const resContactos = await fetch(
            `${API_URL}/contactos-transferencia?usuarioId=${usuarioId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
          const dataContactos = await resContactos.json();
          if (dataContactos.status === "success") {
            numContactos = dataContactos.data.length;
          }
        } catch (e) {
          console.error("Error al obtener contactos para menú:", e);
        }
        $("#totalContactos").text(numContactos).addClass("fade-in");
      }
    } catch (error) {
      console.error("Error al sincronizar con Backend:", error);
    }
  }

  function formatearNumero(num) {
    return Math.floor(num).toLocaleString("es-CL");
  }

  function configurarEventos() {
    $("#btnDeposit").on("click", function () {
      window.location.href = $(this).data("page");
    });
    $("#btnSendMoney").on("click", function () {
      window.location.href = $(this).data("page");
    });
    $("#btnTransactions").on("click", function () {
      window.location.href = $(this).data("page");
    });
    $("#btnCerrarSesion").on("click", cerrarSesion);
  }

  function cerrarSesion() {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.clear();
      window.location.href = "index.html";
    }
  }
});
