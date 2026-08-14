import { useState } from 'react';
import { TarjetaSaldo } from './components/TarjetaSaldo';
import { PanelTransferencias } from './components/PanelTransferencias';
import { WidgetCripto } from './components/WidgetCripto';
import { HistorialTransacciones } from './components/HistorialTransacciones';
import { LoginRegistro } from './components/LoginRegistro';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider, useTransaction } from './context/TransactionContext';
import Swal from 'sweetalert2';

type VistaType = 'inicio' | 'transferencias' | 'historial';

function WalletDashboard() {
  const { token, modoSimulado, usuario, logout, cargandoSesion } = useAuth();
  const { saldo, cargando, error, depositar } = useTransaction();
  const [vista, setVista] = useState<VistaType>('inicio');

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
        const success = await depositar(monto);
        if (success) {
          Swal.fire(
            '¡Éxito!',
            `Depósito de $${monto.toLocaleString("es-CL")} CLP acreditado correctamente.`,
            'success'
          );
        }
      }
    });
  };

  if (cargandoSesion) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Iniciando aplicación...</span>
        </div>
      </div>
    );
  }

  // Si no está autenticado ni en simulación, forzar la pantalla de Login
  if (!token && !modoSimulado) {
    return <LoginRegistro />;
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
              <button className="btn btn-outline-light btn-sm" onClick={logout}>
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
                <PanelTransferencias />
              </div>
            ) : (
              <div>
                {/* Cabecera de la sección */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">📊 Últimos Movimientos</h2>
                  <p className="text-muted">Historial completo de tus transacciones</p>
                </div>

                {/* Componente Migrado: Historial de Transacciones */}
                <HistorialTransacciones />
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-3 border-top mt-auto text-center text-muted fs-7">
        Desarrollado para el Bootcamp SENCE 2025 | Refactorización de Arquitectura por @react-migrator
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <WalletDashboard />
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
