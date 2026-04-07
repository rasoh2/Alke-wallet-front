// ALKE WALLET - Sistema de Transferencias con gestión real de contactos

$(document).ready(async function () {
  const API_URL = "https://alke-wallet-backend.onrender.com/api/v1";
  console.log("[SENDMONEY] Página cargada");

  // Estado global de contactos
  let contactosBackend = [];

  verificarAutenticacion();
  mostrarSaldoDisponible(); // SIEMPRE mostrar saldo local primero
  await cargarContactosDesdeBackend();
  configurarEventos();
  await actualizarSaldoDesdeAPI(); // Luego intenta actualizar desde backend
  mostrarSaldoDisponible(); // Refresca saldo si fue actualizado

  function verificarAutenticacion() {
    if (!localStorage.getItem("token")) {
      alert("⚠️ Debes iniciar sesión primero");
      window.location.href = "index.html";
      return;
    }
  }

  async function actualizarSaldoDesdeAPI() {
    try {
      console.log("[SENDMONEY] Solicitando saldo a backend...");
      const response = await fetch(`${API_URL}/usuarios/perfil`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      console.log("[SENDMONEY] Respuesta backend:", result);
      if (response.ok && result.status === "success") {
        localStorage.setItem("saldo", result.data.saldo.toString());
        console.log(
          "[SENDMONEY] Saldo actualizado en localStorage:",
          result.data.saldo,
        );
      } else {
        // No sobreescribir saldo si la API falla
        console.warn(
          "[SENDMONEY] No se pudo obtener saldo válido, se mantiene el saldo anterior",
        );
      }
    } catch (error) {
      console.error("[SENDMONEY] Error al actualizar saldo:", error);
      // No modificar saldo si hay error
    }
  }

  function mostrarSaldoDisponible() {
    // Siempre mostrar el saldo guardado en localStorage
    const saldo = parseFloat(localStorage.getItem("saldo")) || 0;
    console.log("[SENDMONEY] Mostrando saldo en DOM:", saldo);
    $("#saldoDisponible").text("$" + formatearNumero(saldo));
  }

  function configurarEventos() {
    $("#sendMoneyForm").on("submit", function (e) {
      e.preventDefault();
      realizarTransferencia();
    });

    $("#montoEnviar").on("input", function () {
      let valor = $(this).val();
      if (valor < 0) $(this).val(0);
      const saldoActual = parseFloat(localStorage.getItem("saldo")) || 0;
      if (valor > saldoActual) {
        $("#montoWarning")
          .text("⚠️ El monto supera tu saldo disponible")
          .show();
      } else {
        $("#montoWarning").hide();
      }
    });

    $("#buscarContacto").on("input", function () {
      renderizarContactos($(this).val());
    });

    $("#selectContacto").on("change", function () {
      const idx = $(this).val();
      if (idx !== "") {
        const c = contactosBackend[idx];
        $("#infoContacto").show();
        $("#infoNombre").text(
          c.nombre + " " + c.apellido + (c.alias ? " (" + c.alias + ")" : ""),
        );
        $("#infoBanco").text(c.banco);
        $("#infoCuenta").text(c.numeroCuenta);
      } else {
        $("#infoContacto").hide();
      }
    });

    $(document).on("click", ".item-contacto", function () {
      const idx = $(this).data("idx");
      $("#selectContacto").val(idx).trigger("change");
    });

    $("#btnNuevoContacto").on("click", function () {
      $("#formContacto")[0].reset();
      $("#modalContacto").modal("show");
    });

    $("#btnGuardarContacto").on("click", async function () {
      const nuevo = {
        nombre: $("#nombre").val(),
        apellido: $("#apellido").val(),
        numeroCuenta: $("#numeroCuenta").val(),
        alias: $("#alias").val(),
        banco: $("#banco").val(),
      };
      if (
        !nuevo.nombre ||
        !nuevo.apellido ||
        !nuevo.numeroCuenta ||
        !nuevo.alias ||
        !nuevo.banco
      ) {
        alert("Completa todos los campos obligatorios");
        return;
      }
      const usuarioId = localStorage.getItem("idUsuario") || 1; // Ajustado a la clave correcta que viene del login
      const correo = nuevo.numeroCuenta + "@mail.com";
      try {
        const res = await fetch(`${API_URL}/contactos-transferencia`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            nombre: nuevo.nombre,
            apellido: nuevo.apellido,
            alias: nuevo.alias,
            banco: nuevo.banco,
            numeroCuenta: nuevo.numeroCuenta,
            correo: correo,
            usuarioId: usuarioId,
          }),
        });
        const data = await res.json();
        if (data.status === "success") {
          mostrarAlerta("✅ Contacto guardado en backend", "success");
          await cargarContactosDesdeBackend();
        } else {
          mostrarAlerta(
            "⚠️ No se pudo guardar el contacto en backend",
            "warning",
          );
        }
      } catch (e) {
        mostrarAlerta("⚠️ Error al guardar contacto en backend", "danger");
      }
      $("#modalContacto").modal("hide");
    });
  }

  async function realizarTransferencia() {
    const idx = $("#selectContacto").val();
    let correoReceptor = null;
    if (idx !== "") {
      correoReceptor = contactosBackend[idx].numeroCuenta + "@mail.com";
    }
    if (!correoReceptor) {
      correoReceptor = prompt(
        "Por favor, ingresa el correo del usuario a transferir:",
      );
      if (!correoReceptor) return;
    }
    const monto = parseFloat($("#montoEnviar").val());
    const saldoActual = parseFloat(localStorage.getItem("saldo")) || 0;
    if (isNaN(monto) || monto <= 0) {
      mostrarAlerta("⚠️ Ingresa un monto válido mayor a 0", "danger");
      return;
    }
    if (monto > saldoActual) {
      mostrarAlerta(
        "❌ Saldo insuficiente para realizar esta transferencia",
        "danger",
      );
      return;
    }
    const btnSubmit = $("#sendMoneyForm button[type='submit']");
    btnSubmit.prop("disabled", true).text("Transfiriendo...");
    try {
      const response = await fetch(`${API_URL}/transacciones/transferencia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ receiver_correo: correoReceptor, monto: monto }),
      });
      const result = await response.json();
      if (response.ok && result.status === "success") {
        const nuevoSaldo = result.data.tuNuevoSaldo;
        localStorage.setItem("saldo", nuevoSaldo.toString());
        mostrarSaldoDisponible();
        mostrarAlerta(
          `<div class="text-center">
            <h5 class="mb-3">✅ ¡Transferencia Exitosa!</h5>
            <p class="mb-2"><strong>Destinatario:</strong> ${correoReceptor}</p>
            <p class="mb-0"><strong>Monto:</strong> $${formatearNumero(monto)}</p>
          </div>`,
          "success",
        );
        $("#montoEnviar").val("");
        setTimeout(() => (window.location.href = "menu.html"), 2500);
      } else {
        throw new Error(result.message || "Error en la transferencia");
      }
    } catch (error) {
      mostrarAlerta(`❌ ${error.message}`, "danger");
      btnSubmit.prop("disabled", false).text("Transferir Dinero");
    }
  }

  // Cargar contactos desde el backend y renderizarlos
  async function cargarContactosDesdeBackend(filtro = "") {
    try {
      const usuarioId = localStorage.getItem("idUsuario") || 1;
      const res = await fetch(
        `${API_URL}/contactos-transferencia?usuarioId=${usuarioId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await res.json();
      if (res.ok && data.status === "success") {
        contactosBackend = data.data;
        renderizarContactos(filtro);
      } else {
        contactosBackend = [];
        renderizarContactos(filtro);
      }
    } catch (e) {
      contactosBackend = [];
      renderizarContactos(filtro);
    }
  }

  function renderizarContactos(filtro = "") {
    const contactos = contactosBackend;
    const select = $("#selectContacto");
    const lista = $("#listaContactos");
    select.empty();
    select.append('<option value="">-- Selecciona un destinatario --</option>');
    lista.empty();
    let hayContactos = false;
    contactos.forEach((c, idx) => {
      if (
        !filtro ||
        c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        c.apellido.toLowerCase().includes(filtro.toLowerCase()) ||
        c.alias.toLowerCase().includes(filtro.toLowerCase()) ||
        c.banco.toLowerCase().includes(filtro.toLowerCase())
      ) {
        select.append(
          `<option value="${idx}">${c.nombre} ${c.apellido} (${c.alias})</option>`,
        );
        lista.append(
          `<a href="#" class="list-group-item list-group-item-action item-contacto" data-idx="${idx}"><div class="fw-bold">${c.nombre} ${c.apellido} <span class="text-muted small">(${c.alias})</span></div><div class="small text-muted">${c.banco} - ${c.numeroCuenta}</div></a>`,
        );
        hayContactos = true;
      }
    });
    if (!hayContactos) {
      $("#sinContactos").show();
    } else {
      $("#sinContactos").hide();
    }
  }

  function mostrarAlerta(mensaje, tipo) {
    $("#alert-container").empty();
    const alerta = $("<div></div>")
      .addClass(`alert alert-${tipo} alert-dismissible fade show`)
      .attr("role", "alert")
      .html(
        `${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`,
      );
    $("#alert-container").append(alerta).hide().fadeIn(400);
  }

  function formatearNumero(num) {
    return Math.floor(num).toLocaleString("es-CL");
  }
});
