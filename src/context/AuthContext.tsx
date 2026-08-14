import React, { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface AuthContextType {
  token: string | null;
  modoSimulado: boolean;
  usuario: string | null;
  idUsuario: string | null;
  cargandoSesion: boolean;
  login: (nuevoToken: string, id: number, nombre: string, saldoInicial: number) => void;
  simulate: () => void;
  logout: () => void;
  setUsuario: (nombre: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [modoSimulado, setModoSimulado] = useState<boolean>(localStorage.getItem("modoSimulado") === "true");
  const [usuario, setUsuarioState] = useState<string | null>(localStorage.getItem("nombreUsuario"));
  const [idUsuario, setIdUsuario] = useState<string | null>(localStorage.getItem("idUsuario"));
  const [cargandoSesion, setCargandoSesion] = useState<boolean>(true);

  useEffect(() => {
    // Comprobar estado inicial de localStorage
    const savedToken = localStorage.getItem("token");
    const savedModo = localStorage.getItem("modoSimulado") === "true";
    const savedUser = localStorage.getItem("nombreUsuario");
    const savedId = localStorage.getItem("idUsuario");

    setToken(savedToken);
    setModoSimulado(savedModo);
    setUsuarioState(savedUser);
    setIdUsuario(savedId);
    setCargandoSesion(false);
  }, []);

  const login = (nuevoToken: string, id: number, nombre: string, saldoInicial: number) => {
    localStorage.setItem("token", nuevoToken);
    localStorage.setItem("idUsuario", id.toString());
    localStorage.setItem("nombreUsuario", nombre);
    localStorage.setItem("saldo", saldoInicial.toString());
    localStorage.removeItem("modoSimulado");

    setToken(nuevoToken);
    setIdUsuario(id.toString());
    setUsuarioState(nombre);
    setModoSimulado(false);
  };

  const simulate = () => {
    localStorage.setItem("modoSimulado", "true");
    localStorage.setItem("saldo", "1000000");
    localStorage.setItem("nombreUsuario", "Usuario Simulador");
    localStorage.setItem("idUsuario", "999");
    localStorage.removeItem("token");

    setModoSimulado(true);
    setToken(null);
    setIdUsuario("999");
    setUsuarioState("Usuario Simulador");

    Swal.fire({
      icon: 'info',
      title: 'Modo Simulador Activado',
      text: 'Explora la interfaz de Alke Wallet con datos locales de prueba.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("saldo");
    localStorage.removeItem("idUsuario");
    localStorage.removeItem("nombreUsuario");
    localStorage.removeItem("modoSimulado");
    localStorage.removeItem("simulated_transactions");
    localStorage.removeItem("simulated_contacts");

    setToken(null);
    setIdUsuario(null);
    setUsuarioState(null);
    setModoSimulado(false);

    Swal.fire({
      icon: 'info',
      title: 'Sesión Cerrada',
      text: 'Has salido de Alke Wallet.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const setUsuario = (nombre: string | null) => {
    if (nombre) {
      localStorage.setItem("nombreUsuario", nombre);
    } else {
      localStorage.removeItem("nombreUsuario");
    }
    setUsuarioState(nombre);
  };

  return (
    <AuthContext.Provider value={{
      token,
      modoSimulado,
      usuario,
      idUsuario,
      cargandoSesion,
      login,
      simulate,
      logout,
      setUsuario
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};
