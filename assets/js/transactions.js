/**
 * ALKE WALLET - Historial de Transacciones
 * transactions.js - Manejo de historial consumiendo REST API Backend
 */

$(document).ready(async function () {
  console.log("📊 Pantalla de Movimientos Cargada - Alke Wallet (API)");

  const API_URL = "https://alke-wallet-backend.onrender.com/api/v1";
  let movimientos = [];

  verificarAutenticacion();
  
  // Obtener saldo del token/perfil global
  mostrarSaldoActual();
  
  // Consumir API de transacciones
  await cargarTransaccionesDesdeAPI();

  configurarEventos();

  function verificarAutenticacion() {
    if (!localStorage.getItem("token")) {
      alert("⚠️ Debes iniciar sesión primero");
      window.location.href = "index.html";
    }
  }

  function mostrarSaldoActual() {
    const saldo = parseFloat(localStorage.getItem("saldo")) || 0;
    $("#saldoActual").text("$" + formatearNumero(saldo));
  }

  async function cargarTransaccionesDesdeAPI() {
    try {
        const response = await fetch(`${API_URL}/transacciones`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const result = await response.json();

        if (response.ok && result.status === 'success') {
            // El backend devuelve transacciones asociadas al usuario logueado
            // Hay que adaptar nuestro array basado en la info de la BD
            let miId = parseInt(localStorage.getItem("idUsuario"));
            
            movimientos = result.data.map(t => {
                // Determinar si la transacción de la BD es ingreso o egreso
                let tipoCalculado = t.tipo;
                if (t.tipo === 'transferencia') {
                   // Si el sender_id soy yo, es una transferencia que yo hice (egreso)
                   // Si el receiver_id soy yo, es dinero recibido (ingreso)
                   tipoCalculado = (t.sender_id === miId) ? "transferencia" : "deposito";
                }

                return {
                    id: t.id,
                    tipo: tipoCalculado,
                    monto: parseFloat(t.monto),
                    descripcion: t.tipo === 'transferencia' ? 
                      (t.sender_id === miId ? "Transferencia enviada" : "Transferencia recibida") : 
                      "Depósito de saldo",
                    fechaFormateada: new Date(t.createdAt).toLocaleString("es-CL"),
                    timestamp: new Date(t.createdAt).getTime()
                };
            });
            
            mostrarResumen();
            mostrarMovimientos("todos", "reciente");
        }
    } catch (error) {
        console.error("Error al cargar historial:", error);
    }
  }

  function mostrarResumen() {
    let totalDepositado = 0;
    let totalEnviado = 0;

    movimientos.forEach(function (mov) {
      if (mov.tipo === "deposito") totalDepositado += mov.monto;
      else if (mov.tipo === "transferencia") totalEnviado += mov.monto;
    });

    $("#totalDepositado").text("$" + formatearNumero(totalDepositado));
    $("#totalEnviado").text("$" + formatearNumero(totalEnviado));
  }

  function configurarEventos() {
    $("#filtroTipo").on("change", function () {
      mostrarMovimientos($(this).val(), $("#ordenar").val());
    });

    $("#ordenar").on("change", function () {
      mostrarMovimientos($("#filtroTipo").val(), $(this).val());
    });
  }

  function mostrarMovimientos(filtro, orden) {
    $("#listaMovimientos").empty();
    $("#sinMovimientos").hide();

    let filtrados = movimientos;
    if (filtro !== "todos") {
      filtrados = movimientos.filter(mov => mov.tipo === filtro);
    }

    filtrados = ordenarMovimientos(filtrados, orden);

    if (filtrados.length === 0) {
      $("#sinMovimientos").show();
      return;
    }

    filtrados.forEach((mov, index) => {
      $("#listaMovimientos").append(crearItemMovimiento(mov, index));
    });

    $("#listaMovimientos").hide().fadeIn(500);
  }

  function ordenarMovimientos(movimientos, orden) {
    switch (orden) {
      case "reciente": return movimientos.sort((a, b) => b.timestamp - a.timestamp);
      case "antiguo": return movimientos.sort((a, b) => a.timestamp - b.timestamp);
      case "mayor": return movimientos.sort((a, b) => b.monto - a.monto);
      case "menor": return movimientos.sort((a, b) => a.monto - b.monto);
      default: return movimientos;
    }
  }

  function crearItemMovimiento(mov, index) {
    const signo = mov.tipo === "deposito" ? "+" : "-";
    const clase = mov.tipo === "deposito" ? "text-success" : "text-danger";
    const iconoTipo = mov.tipo === "deposito" ? "💰" : "💸";
    const bgClase = mov.tipo === "deposito" ? "bg-success-soft" : "bg-danger-soft";

    const $li = $("<li></li>")
      .addClass("list-group-item d-flex justify-content-between align-items-start");

    const $infoContainer = $("<div></div>").addClass("flex-grow-1");

    const $titulo = $("<div></div>")
      .addClass("d-flex align-items-center mb-2")
      .html(`
        <span class="badge ${bgClase} me-2">${iconoTipo}</span>
        <strong>${getTipoTransaccion(mov.tipo)}</strong>
      `);

    const $descripcion = $("<div></div>")
      .addClass("text-muted small mb-1")
      .html(`📝 ${mov.descripcion}`);

    const $fecha = $("<div></div>")
      .addClass("text-muted small")
      .html(`📅 ${mov.fechaFormateada}`);

    $infoContainer.append($titulo, $descripcion, $fecha);

    const $montoContainer = $("<div></div>").addClass("text-end ms-3");

    const $monto = $("<h5></h5>")
      .addClass(`mb-1 mb-0 fw-bold ${clase}`)
      .text(`${signo}$${formatearNumero(mov.monto)}`);

    $montoContainer.append($monto);
    $li.append($infoContainer, $montoContainer);

    setTimeout(() => {
      $li.css({ opacity: 1, transform: "translateX(0)" });
    }, index * 100);

    return $li;
  }

  function getTipoTransaccion(tipo) {
    switch (tipo) {
      case "deposito": return "Depósito de Dinero";
      case "transferencia": return "Transferencia";
      default: return "Transacción";
    }
  }

  function formatearNumero(num) {
    return Math.floor(num).toLocaleString("es-CL");
  }
});
