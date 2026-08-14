import React, { createContext, useContext, useState, useEffect } from 'react';
import { walletService } from '../services/api';
import type { Transaccion, Contacto } from '../services/api';
import { useAuth } from './AuthContext';
import Swal from 'sweetalert2';

interface TransactionContextType {
  saldo: number;
  cargando: boolean;
  error: string | null;
  transacciones: Transaccion[];
  contactos: Contacto[];
  depositar: (monto: number) => Promise<boolean>;
  transferir: (correo: string, monto: number) => Promise<boolean>;
  agregarContacto: (contacto: Omit<Contacto, 'id'>) => Promise<boolean>;
  refrescarDatos: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, modoSimulado, logout, setUsuario } = useAuth();
  const [saldo, setSaldo] = useState<number>(1000000);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);

  const refrescarDatos = async () => {
    if (!token && !modoSimulado) return;
    setCargando(true);
    setError(null);
    try {
      // Obtener saldo y nombre de usuario actualizados
      const profile = await walletService.getProfile();
      setSaldo(profile.saldo);
      setUsuario(profile.nombre);

      // Cargar historial de transacciones y contactos de forma concurrente
      const [txs, ctcs] = await Promise.all([
        walletService.getTransactions(),
        walletService.getContacts()
      ]);
      setTransacciones(txs);
      setContactos(ctcs);
    } catch (err: any) {
      console.error("Error al refrescar datos:", err);
      const msg = err.response?.data?.message || err.message || "Error al sincronizar con el servidor";
      setError(msg);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setCargando(false);
    }
  };

  // Cargar datos automáticamente al iniciar sesión o cambiar modo
  useEffect(() => {
    if (token || modoSimulado) {
      refrescarDatos();
    } else {
      setTransacciones([]);
      setContactos([]);
      setSaldo(1000000);
    }
  }, [token, modoSimulado]);

  const depositar = async (monto: number): Promise<boolean> => {
    setCargando(true);
    try {
      const nuevoSaldo = await walletService.deposit(monto);
      setSaldo(nuevoSaldo);
      await refrescarDatos(); // Sincronizar movimientos
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "No se pudo realizar el depósito";
      Swal.fire('Error', msg, 'error');
      return false;
    } finally {
      setCargando(false);
    }
  };

  const transferir = async (correo: string, monto: number): Promise<boolean> => {
    setCargando(true);
    try {
      const nuevoSaldo = await walletService.transfer(correo, monto);
      setSaldo(nuevoSaldo);
      await refrescarDatos(); // Sincronizar movimientos y contactos
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Error en la transferencia";
      Swal.fire('Error', msg, 'error');
      return false;
    } finally {
      setCargando(false);
    }
  };

  const agregarContacto = async (contacto: Omit<Contacto, 'id'>): Promise<boolean> => {
    try {
      await walletService.addContact(contacto);
      await refrescarDatos(); // Refrescar contactos
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Error al agregar contacto";
      Swal.fire('Error', msg, 'error');
      return false;
    }
  };

  return (
    <TransactionContext.Provider value={{
      saldo,
      cargando,
      error,
      transacciones,
      contactos,
      depositar,
      transferir,
      agregarContacto,
      refrescarDatos
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransaction debe ser utilizado dentro de un TransactionProvider");
  }
  return context;
};
