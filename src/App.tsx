import { useState, useEffect } from 'react';
import { TarjetaSaldo } from './components/TarjetaSaldo';
import { PanelTransferencias } from './components/PanelTransferencias';
import { WidgetCripto } from './components/WidgetCripto';
import { HistorialTransacciones } from './components/HistorialTransacciones';
import { LoginRegistro } from './components/LoginRegistro';
import axios from 'axios';
import Swal from 'sweetalert2';

type VistaType = 'inicio' | 'transferencias' | 'historial';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [modoSimulado, setModoSimulado] = useState<boolean>(localStorage.getItem("modoSimulado") === "true");
  
  const [saldo, setSaldo] = useState<number>(1000000); // Saldo por defecto
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaType>('inicio');

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api/v1"
    : "https://alke-wallet-backend.onrender.com/api/v1";

  // Obtener perfil de usuario si está autenticado
  const obtenerDatosPerfil = async (authToken: string) => {
    setCargando(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/usuarios/perfil`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.data.status === 'success') {
        setSaldo(parseFloat(response.data.data.saldo));
        setUsuario(response.data.data.nombre);
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
    } else if (modoSimulado) {
      setUsuario("Usuario Simulador");
      const localSaldo = localStorage.getItem("saldo");
      setSaldo(localSaldo ? parseFloat(localSaldo) : 1000000);
    }
  }, [token, modoSimulado]);

  const handleLoginSuccess = (nuevoToken: string, nombre: string, id: number, saldoInicial: number) => {
    localStorage.setItem("token", nuevoToken);
    localStorage.setItem("idUsuario", id.toString());
    localStorage.setItem("nombreUsuario", nombre);
    localStorage.setItem("saldo", saldoInicial.toString());
    localStorage.removeItem("modoSimulado");
    
    setToken(nuevoToken);
    setModoSimulado(false);
    setSaldo(saldoInicial);
    setUsuario(nombre);
    setVista('inicio');
  };

  const handleSimulate = () => {
    localStorage.setItem("modoSimulado", "true");
    localStorage.setItem("saldo", "1000000");
    setModoSimulado(true);
    setToken(null);
    setSaldo(1000000);
    setUsuario("Usuario Simulador");
    setVista('inicio');
    Swal.fire({
      icon: 'info',
      title: 'Modo Simulador Activado',
      text: 'Explora la interfaz de Alke Wallet con datos locales de prueba.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("saldo");
    localStorage.removeItem("idUsuario");
    localStorage.removeItem("nombreUsuario");
    localStorage.removeItem("modoSimulado");
    
    setToken(null);
    setModoSimulado(false);
    setUsuario(null);
    setSaldo(1000000);
    setVista('inicio');
    Swal.fire({
      icon: 'info',
      title: 'Sesión Cerrada',
      text: 'Has salido de Alke Wallet.',
      timer: 1500,
      showConfirmButton: false
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
          const nuevoSaldo = saldo + monto;
          localStorage.setItem("saldo", nuevoSaldo.toString());
          setSaldo(nuevoSaldo);
          Swal.fire({
            icon: 'success',
            title: 'Simulación Exitosa',
            text: `Se han depositado $${monto.toLocaleString("es-CL")} CLP localmente.`,
          });
        }
      }
    });
  };

  const handleTransferSuccess = (nuevoSaldo: number) => {
    setSaldo(nuevoSaldo);
    if (!token) {
      localStorage.setItem("saldo", nuevoSaldo.toString());
    }
  };

  // Renderizar Login/Registro si no hay sesión iniciada ni simulada
  if (!token && !modoSimulado) {
    return (
      <LoginRegistro 
        API_URL={API_URL} 
        onLoginSuccess={handleLoginSuccess} 
        onSimulate={handleSimulate} 
      />
    );
  }

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
            Alke Wallet 
            {modoSimulado ? (
              <span className="badge bg-warning ms-2 fs-7 text-dark">Simulador</span>
            ) : (
              <span className="badge bg-success ms-2 fs-7">Real</span>
            )}
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
                {usuario || "Cargando..."}
              </span>
              <button className="btn btn-outline-light btn-sm" onClick={cerrarSesion}>
                Cerrar Sesión
              </button>
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
                  onTransferSuccess={handleTransferSuccess} 
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
