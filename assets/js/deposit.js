/**
 * ALKE WALLET - Sistema de Depósitos
 * deposit.js - Manejo de depósitos de dinero conectado al REST API Backend
 */

$(document).ready(async function () {
  console.log("💰 Pantalla de Depósito Cargada - Alke Wallet (API)");

  const API_URL = "http://localhost:3000/api/v1";

  verificarAutenticacion();
  await actualizarSaldoDesdeAPI();
  mostrarSaldoActual();
  configurarEventos();

  /**
   * Verificar si el usuario está autenticado
   */
  function verificarAutenticacion() {
    if (!localStorage.getItem("token")) {
      alert("⚠️ Debes iniciar sesión primero");
      window.location.href = "index.html";
      return;
    }
  }

  /**
   * Obtener el saldo real desde el backend
   */
  async function actualizarSaldoDesdeAPI() {
    try {
      const response = await fetch(`${API_URL}/usuarios/perfil`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        localStorage.setItem("saldo", result.data.saldo.toString());
      }
    } catch (error) {
      console.error("No se pudo actualizar el saldo:", error);
    }
  }

  /**
   * Mostrar saldo actual con formato
   */
  function mostrarSaldoActual() {
    const saldo = parseFloat(localStorage.getItem("saldo")) || 0;
    $("#saldoActual").text("$" + formatearNumero(saldo));
  }

  /**
   * Configurar eventos del formulario y botones
   */
  function configurarEventos() {
    $("#depositForm").on("submit", function (e) {
      e.preventDefault();
      realizarDeposito();
    });

    $(".btn-monto-rapido").on("click", function () {
      const monto = $(this).data("monto");
      $("#montoDeposito").val(monto);
      $(".btn-monto-rapido").removeClass("active");
      $(this).addClass("active");
    });

    $("#montoDeposito").on("input", function () {
      let valor = $(this).val();
      if (valor < 0) $(this).val(0);
      if (valor > 10000000) {
        mostrarAlerta("⚠️ El monto máximo de depósito es $10.000.000", "warning");
        $(this).val(10000000);
      }
    });
  }

  async function realizarDeposito() {
    const monto = parseFloat($("#montoDeposito").val());

    if (isNaN(monto) || monto <= 0) {
      mostrarAlerta("⚠️ Por favor ingresa un monto válido mayor a 0", "danger");
      $("#montoDeposito").focus();
      return;
    }

    if (monto < 1000) {
      mostrarAlerta("⚠️ El monto mínimo de depósito es $1.000 CLP", "warning");
      $("#montoDeposito").focus();
      return;
    }

    // Desactivar botón temporalmente
    const btnSubmit = $("#depositForm button[type='submit']");
    btnSubmit.prop("disabled", true).text("Procesando...");

    try {
      const response = await fetch(`${API_URL}/transacciones/deposito`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ monto: monto })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        const nuevoSaldo = result.data.nuevoSaldo;
        
        // Actualizar saldo local
        localStorage.setItem("saldo", nuevoSaldo.toString());
        mostrarSaldoActual();

        mostrarAlerta(`
          <div class="text-center">
            <h5 class="mb-3">✅ ¡Depósito exitoso!</h5>
            <p class="mb-2"><strong>Monto depositado:</strong> $${formatearNumero(monto)} CLP</p>
            <p class="mb-0"><strong>Nuevo saldo:</strong> $${formatearNumero(nuevoSaldo)} CLP</p>
          </div>
        `, "success");

        $("#montoDeposito").val("");
        $(".btn-monto-rapido").removeClass("active");

        setTimeout(function () {
          window.location.href = "menu.html";
        }, 2500);
      } else {
        throw new Error(result.message || "Error al depositar");
      }
    } catch (error) {
      mostrarAlerta(`❌ ${error.message}`, "danger");
      btnSubmit.prop("disabled", false).text("Realizar Depósito");
    }
  }

  function mostrarAlerta(mensaje, tipo) {
    $("#alert-container").empty();
    const alerta = $("<div></div>")
      .addClass(`alert alert-${tipo} alert-dismissible fade show`)
      .attr("role", "alert")
      .html(`${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`);
    $("#alert-container").append(alerta).hide().fadeIn(400);
  }

  function formatearNumero(num) {
    return Math.floor(num).toLocaleString("es-CL");
  }
});
