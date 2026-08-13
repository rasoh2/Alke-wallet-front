import { useState, useEffect } from 'react';
import { TarjetaSaldo } from './components/TarjetaSaldo';
import { PanelTransferencias } from './components/PanelTransferencias';
import { WidgetCripto } from './components/WidgetCripto';
import { HistorialTransacciones } from './components/HistorialTransacciones';
import axios from 'axios';
import Swal from 'sweetalert2';

type VistaType = 'inicio' | 'transferencias' | 'historial';

function App() {
  const [saldo, setSaldo] = useState<number>(1000000); // Saldo inicial por defecto
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [vista, setVista] = useState<VistaType>('inicio');

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api/v1"
    : "https://alke-wallet-backend.onrender.com/api/v1";

  // Actualizar saldo y datos desde el backend si el usuario tiene un token activo
  const obtenerDatosPerfil = async (authToken: string) => {
    setCargando(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/usuarios/perfil`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      if (response.data.status === 'success') {
        setSaldo(parseFloat(response.data.data.saldo));
        setUsuario(response.data.data.nombre);
        // También guardar el ID de usuario en localStorage si no está
        if (response.data.data.id) {
          localStorage.setItem("idUsuario", response.data.data.id.toString());
        }
      }
    } catch (err: any) {
      console.error("Error al obtener datos:", err);
      setError(err.response?.data?.message || "No se pudo conectar al backend");
      if (err.response?.status === 401) {
        cerrarSesion();
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (token) {
      obtenerDatosPerfil(token);
    } else {
      setUsuario("Usuario Simulador");
    }
  }, [token]);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("saldo");
    localStorage.removeItem("idUsuario");
    setToken(null);
    setUsuario("Usuario Simulador");
    setSaldo(1000000); // Restaurar saldo por defecto
    setVista('inicio');
    Swal.fire({
      icon: 'info',
      title: 'Sesión Cerrada',
      text: 'Se ha cerrado la sesión correctamente.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const simularLogin = () => {
    Swal.fire({
      title: 'Simular Login / Conectar Backend',
      html: `
        <input type="text" id="swal-input-email" class="swal2-input" placeholder="Correo electrónico" value="user@wallet.com">
        <input type="password" id="swal-input-password" class="swal2-input" placeholder="Contraseña" value="123456">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Iniciar Sesión',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const correo = (document.getElementById('swal-input-email') as HTMLInputElement).value;
        const password = (document.getElementById('swal-input-password') as HTMLInputElement).value;
        if (!correo || !password) {
          Swal.showValidationMessage('Por favor completa todos los campos');
        }
        return { correo, password };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        setCargando(true);
        try {
          const response = await axios.post(`${API_URL}/usuarios/login`, result.value);
          if (response.data.status === 'success' && response.data.data.token) {
            const nuevoToken = response.data.data.token;
            const usuarioObj = response.data.data.usuario;
            localStorage.setItem("token", nuevoToken);
            if (usuarioObj && usuarioObj.id) {
              localStorage.setItem("idUsuario", usuarioObj.id.toString());
            }
            setToken(nuevoToken);
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'Sesión iniciada y sincronizada con la base de datos.',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (err: any) {
          Swal.fire({
            icon: 'error',
            title: 'Error de Autenticación',
            text: err.response?.data?.message || 'No se pudo iniciar sesión.'
          });
        } finally {
          setCargando(false);
        }
      }
    });
  };

  const realizarDeposito = () => {
    Swal.fire({
      title: 'Realizar Depósito',
      input: 'number',
      inputLabel: 'Monto a depositar (mínimo $1.000 CLP)',
      inputPlaceholder: 'Ingresa el monto',
      inputAttributes: {
        min: '1000',
        step: '500'
      },
      showCancelButton: true,
      confirmButtonText: 'Depositar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || parseFloat(value) < 1000) {
          return 'El monto mínimo es $1.000 CLP';
        }
        return null;
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const monto = parseFloat(result.value);
        if (token) {
          setCargando(true);
          try {
            const response = await axios.post(
              `${API_URL}/transacciones/deposito`,
              { monto },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.status === 'success') {
              setSaldo(parseFloat(response.data.data.nuevoSaldo));
              Swal.fire('¡Éxito!', `Depósito de $${monto.toLocaleString("es-CL")} CLP acreditado en la base de datos.`, 'success');
            }
          } catch (err: any) {
            Swal.fire('Error', err.response?.data?.message || 'No se pudo completar el depósito.', 'error');
          } finally {
            setCargando(false);
          }
        } else {
          setSaldo(prev => prev + monto);
          Swal.fire({
            icon: 'success',
            title: 'Simulación Exitosa',
            text: `Se han depositado $${monto.toLocaleString("es-CL")} CLP localmente.`,
          });
        }
      }
    });
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold d-flex align-items-center cursor-pointer" onClick={() => setVista('inicio')}>
            <svg width="30" height="30" viewBox="0 0 100 100" className="d-inline-block me-2">
              <rect x="10" y="30" width="80" height="50" rx="8" fill="#fff" />
              <rect x="10" y="35" width="80" height="10" fill="#e0e0e0" />
              <circle cx="70" cy="55" r="5" fill="#4e73df" />
            </svg>
            Alke Wallet <span className="badge bg-info ms-2 fs-6">React SPA</span>
          </span>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link fw-semibold border-0 ${vista === 'inicio' ? 'text-white fw-bold active' : 'text-white-50'}`}
                  onClick={() => setVista('inicio')}
                  style={{ textDecoration: 'none' }}
                >
                  Inicio
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link fw-semibold border-0 ${vista === 'transferencias' ? 'text-white fw-bold active' : 'text-white-50'}`}
                  onClick={() => setVista('transferencias')}
                  style={{ textDecoration: 'none' }}
                >
                  Transferencias
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link fw-semibold border-0 ${vista === 'historial' ? 'text-white fw-bold active' : 'text-white-50'}`}
                  onClick={() => setVista('historial')}
                  style={{ textDecoration: 'none' }}
                >
                  Movimientos
                </button>
              </li>
            </ul>

            <div className="d-flex align-items-center">
              <span className="text-white me-3" id="nombreUsuario">
                👋 {usuario || "Cargando..."}
              </span>
              {token ? (
                <button className="btn btn-outline-light btn-sm" onClick={cerrarSesion}>
                  Cerrar Sesión
                </button>
              ) : (
                <button className="btn btn-outline-light btn-sm" onClick={simularLogin}>
                  Conectar Backend
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            
            {vista === 'inicio' ? (
              <div className="row g-4">
                {/* Columna Izquierda: TarjetaSaldo + Acciones */}
                <div className="col-12 col-md-6">
                  {/* Componente Migrado: Tarjeta de Saldo */}
                  <TarjetaSaldo saldo={saldo} cargando={cargando} error={error} />

                  {/* Acciones Rápidas */}
                  <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
                    <h5 className="fw-bold mb-3">Acciones Rápidas</h5>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-between">
                      <button className="btn btn-success flex-fill" onClick={realizarDeposito}>
                        💰 Simular Depósito
                      </button>
                      <button className="btn btn-warning flex-fill text-white" onClick={() => setVista('transferencias')}>
                        💸 Enviar Dinero
                      </button>
                    </div>
                  </div>

                  {/* Diagnóstico */}
                  <div className="card shadow-sm border-0 rounded-4 p-4">
                    <h6 className="fw-bold text-uppercase text-secondary mb-3">Diagnóstico de Entorno</h6>
                    <div className="p-3 bg-dark text-white rounded-3 fs-7 font-monospace">
                      <p className="mb-1"><span className="text-success">✔</span> Modo: <span className="text-info">Vite + React 19</span></p>
                      <p className="mb-1"><span className="text-success">✔</span> Servidor API: <span className="text-warning">{API_URL}</span></p>
                      <p className="mb-1">
                        <span className="text-success">✔</span> Conexión DB:{" "}
                        <span className={token ? "text-success fw-bold" : "text-danger"}>
                          {token ? "Conectado a Neon (Real)" : "Simulado Local"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Widget de Criptomonedas */}
                <div className="col-12 col-md-6">
                  <WidgetCripto />
                </div>
              </div>
            ) : vista === 'transferencias' ? (
              <div>
                {/* Cabecera de la sección */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">💸 Enviar Dinero</h2>
                  <p className="text-muted">Transfiere a tus contactos de forma rápida y segura</p>
                </div>

                {/* Subtarjeta de saldo rápido */}
                <div className="row justify-content-center mb-4">
                  <div className="col-12">
                    <div className="card shadow-sm border-0 rounded-4 card-saldo-small">
                      <div className="card-body text-center p-3">
                        <small className="text-white-50">Saldo Disponible</small>
                        <h4 className="fw-bold text-white mb-0">
                          ${Math.floor(saldo).toLocaleString("es-CL")} CLP
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Componente Migrado: Panel de Transferencias */}
                <PanelTransferencias 
                  saldo={saldo} 
                  token={token} 
                  API_URL={API_URL} 
                  onTransferSuccess={(nuevoSaldo) => setSaldo(nuevoSaldo)} 
                />
              </div>
            ) : (
              <div>
                {/* Cabecera de la sección */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">📊 Últimos Movimientos</h2>
                  <p className="text-muted">Historial completo de tus transacciones</p>
                </div>

                {/* Componente Migrado: Historial de Transacciones */}
                <HistorialTransacciones 
                  saldo={saldo} 
                  token={token} 
                  API_URL={API_URL} 
                />
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-3 border-top mt-auto text-center text-muted fs-7">
        Desarrollado para el Bootcamp SENCE 2025 | Migración a React por @react-migrator
      </footer>
    </div>
  );
}

export default App;
