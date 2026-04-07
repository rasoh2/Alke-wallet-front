/**
 * ALKE WALLET - Sistema de Autenticación
 * login.js - Manejo del inicio de sesión conectado al REST API Backend
 */

$(document).ready(function () {
  console.log("🚀 Sistema de Login Cargado - Alke Wallet (REST API)");

  const API_URL = "https://alke-wallet-backend.onrender.com/api/v1";

  // ==========================================
  // LÓGICA DE INICIO DE SESIÓN
  // ==========================================
  $("#loginForm").on("submit", async function (e) {
    e.preventDefault();

    const email = $("#email").val().trim();
    const password = $("#password").val();

    if (!email || !password) {
      mostrarAlerta("⚠️ Por favor completa todos los campos", "warning");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, password: password }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        const usuarioData = result.data.usuario;
        
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("usuarioLogueado", email);
        localStorage.setItem("nombreUsuario", usuarioData.nombre);
        localStorage.setItem("idUsuario", usuarioData.id);
        localStorage.setItem("saldo", usuarioData.saldo.toString());

        mostrarAlerta(`¡Bienvenido ${usuarioData.nombre}! 🎉<br>Redirigiendo...`, "success");

        setTimeout(function () {
          window.location.href = "menu.html";
        }, 1000);
      } else {
        throw new Error(result.message || "Error desconocido");
      }
      
    } catch (error) {
      mostrarAlerta(`❌ ${error.message}<br><small>Si no tienes cuenta, crea una cuenta abajo.</small>`, "danger");

      $("#password").val("").focus();
      $("#loginForm").addClass("shake");
      setTimeout(() => $("#loginForm").removeClass("shake"), 500);

      setTimeout(function () {
        $("#alert-container").fadeOut(400, function () { $(this).empty().show(); });
      }, 4000);
    }
  });


  // ==========================================
  // LÓGICA DE REGISTRO
  // ==========================================
  $("#registroForm").on("submit", async function (e) {
    e.preventDefault();

    const nombre = $("#regNombre").val().trim();
    const email = $("#regEmail").val().trim();
    const password = $("#regPassword").val();

    try {
      const response = await fetch(`${API_URL}/usuarios/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre,
          correo: email,
          password: password
        })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        // Cerrar modal usando Bootstrap
        const registroModal = bootstrap.Modal.getInstance(document.getElementById('registroModal'));
        registroModal.hide();

        mostrarAlerta(`✅ ¡Registro exitoso, ${nombre}! Tu saldo inicial de $100,000 ha sido asignado. Ahora puedes iniciar sesión.`, "success");
        
        // Auto rellenar formulario de login
        $("#email").val(email);
        $("#password").val("");
        $("#password").focus();
      } else {
        throw new Error(result.message || "Error al registrar");
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  });


  function mostrarAlerta(mensaje, tipo) {
    $("#alert-container").empty();
    const alerta = $("<div></div>")
      .addClass(`alert alert-${tipo} alert-dismissible fade show`)
      .attr("role", "alert")
      .html(`${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`);
    $("#alert-container").append(alerta).hide().fadeIn(400);
  }

  // Verificar si ya está logueado
  if (localStorage.getItem("token")) {
    window.location.href = "menu.html";
  }

  $(".form-control").on("focus", function () { $(this).parent().addClass("input-focused"); });
  $(".form-control").on("blur", function () { $(this).parent().removeClass("input-focused"); });

  // Animación shake dinamica
  const style = document.createElement("style");
  style.textContent = `
    .shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      transform: translate3d(0, 0, 0);
    }
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }
  `;
  document.head.appendChild(style);
});
