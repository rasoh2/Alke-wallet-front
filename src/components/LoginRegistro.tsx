import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

interface LoginRegistroProps {
  API_URL: string;
  onLoginSuccess: (token: string, nombre: string, id: number, saldo: number) => void;
  onSimulate: () => void;
}

export const LoginRegistro: React.FC<LoginRegistroProps> = ({
  API_URL,
  onLoginSuccess,
  onSimulate
}) => {
  const [tab, setTab] = useState<'login' | 'registro'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registro State
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [cargando, setCargando] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      Swal.fire('Campos Obligatorios', 'Por favor completa todos los campos', 'warning');
      return;
    }

    setCargando(true);
    try {
      const response = await axios.post(`${API_URL}/usuarios/login`, {
        correo: loginEmail,
        password: loginPassword
      });

      if (response.data.status === 'success' && response.data.data.token) {
        const { token, usuario } = response.data.data;
        Swal.fire({
          icon: 'success',
          title: `¡Bienvenido ${usuario.nombre}! 🎉`,
          text: 'Redirigiendo al dashboard...',
          timer: 1500,
          showConfirmButton: false
        });
        onLoginSuccess(token, usuario.nombre, usuario.id, parseFloat(usuario.saldo));
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Credenciales Inválidas',
        html: `¿No tienes una cuenta? Regístrate gratis en la pestaña de <strong>Crear Cuenta</strong>.`
      });
      setLoginPassword('');
    } finally {
      setCargando(false);
    }
  };

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNombre || !regEmail || !regPassword) {
      Swal.fire('Campos Obligatorios', 'Por favor completa todos los campos', 'warning');
      return;
    }

    if (regPassword.length < 6) {
      Swal.fire('Seguridad', 'La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    setCargando(true);
    try {
      const response = await axios.post(`${API_URL}/usuarios/registro`, {
        nombre: regNombre,
        correo: regEmail,
        password: regPassword
      });

      if (response.data.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: '¡Registro Exitoso! 🎉',
          text: 'Tu cuenta ha sido creada con un saldo inicial de $1.000.000 CLP de prueba. Ahora puedes iniciar sesión.',
          confirmButtonText: 'Iniciar Sesión Now'
        }).then(() => {
          setLoginEmail(regEmail);
          setLoginPassword('');
          setTab('login');
          
          // Limpiar registro
          setRegNombre('');
          setRegEmail('');
          setRegPassword('');
        });
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire('Error al Registrar', err.response?.data?.message || 'No se pudo crear la cuenta. Intenta con otro correo.', 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-primary-gradient py-5 px-3">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-white" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="p-4 bg-primary text-white text-center">
          <div className="mb-2 d-flex align-items-center justify-content-center">
            <svg width="40" height="40" viewBox="0 0 100 100" className="me-2">
              <rect x="10" y="30" width="80" height="50" rx="8" fill="#fff" />
              <rect x="10" y="35" width="80" height="10" fill="#4e73df" />
              <circle cx="70" cy="55" r="5" fill="#1cc88a" />
            </svg>
            <h3 className="fw-bold mb-0">Alke Wallet</h3>
          </div>
          <p className="text-white-50 mb-0 small">Banca digital segura y rápida</p>
        </div>

        {/* Pestañas */}
        <div className="d-flex border-bottom bg-light">
          <button
            className={`flex-fill py-3 btn btn-link rounded-0 fw-semibold text-decoration-none border-bottom border-3 ${tab === 'login' ? 'border-primary text-primary fw-bold' : 'border-transparent text-muted'}`}
            onClick={() => setTab('login')}
          >
            Iniciar Sesión
          </button>
          <button
            className={`flex-fill py-3 btn btn-link rounded-0 fw-semibold text-decoration-none border-bottom border-3 ${tab === 'registro' ? 'border-primary text-primary fw-bold' : 'border-transparent text-muted'}`}
            onClick={() => setTab('registro')}
          >
            Crear Cuenta
          </button>
        </div>

        <div className="card-body p-4">
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="fade-in">
              <div className="mb-3">
                <label className="form-label fw-semibold small">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control form-control-lg fs-6"
                  placeholder="nombre@ejemplo.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold small">Contraseña</label>
                <input
                  type="password"
                  className="form-control form-control-lg fs-6"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg fs-6 fw-bold"
                  disabled={cargando}
                >
                  {cargando ? 'Iniciando sesión...' : '🚀 Ingresar'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegistroSubmit} className="fade-in">
              <div className="mb-3">
                <label className="form-label fw-semibold small">Nombre Completo</label>
                <input
                  type="text"
                  className="form-control form-control-lg fs-6"
                  placeholder="Ej: Juan Pérez"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control form-control-lg fs-6"
                  placeholder="nombre@ejemplo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold small">Contraseña</label>
                <input
                  type="password"
                  className="form-control form-control-lg fs-6"
                  placeholder="Mínimo 6 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-success btn-lg fs-6 fw-bold"
                  disabled={cargando}
                >
                  {cargando ? 'Registrando...' : '✅ Registrarse'}
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-4">
            <span className="text-muted small">¿Quieres probar la aplicación de inmediato?</span>
            <button
              type="button"
              className="btn btn-link btn-sm d-block mx-auto fw-bold text-decoration-none text-info mt-1"
              onClick={onSimulate}
            >
              💻 Entrar en Modo Simulador (Prueba Local)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
