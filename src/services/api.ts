import axios from 'axios';

// Determinar URL del backend dinámicamente
export const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000/api/v1"
  : "https://alke-wallet-backend.onrender.com/api/v1";

// Interfaces de tipo para tipado estricto
export interface UserProfile {
  id: number;
  nombre: string;
  correo: string;
  saldo: number;
  avatar: string | null;
}

export interface Contacto {
  id?: number;
  nombre: string;
  apellido: string;
  alias: string;
  banco: string;
  numeroCuenta: string;
  correo: string;
}

export interface Transaccion {
  id: number;
  monto: string;
  tipo: 'deposito' | 'transferencia';
  createdAt: string;
  sender_id?: number | null;
  receiver_id?: number | null;
  sender?: { nombre: string; correo: string } | null;
  receiver?: { nombre: string; correo: string } | null;
}

// Configurar encabezado de autorización
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Comprobar si estamos en modo simulación
const isSimulated = () => {
  return localStorage.getItem("modoSimulado") === "true";
};

// Clave de almacenamiento para simulación local
const LOCAL_TRANS_KEY = "simulated_transactions";
const LOCAL_CONTACTS_KEY = "simulated_contacts";
const LOCAL_SALDO_KEY = "saldo";

// Inicializadores de mocks
const getLocalTransactions = (): Transaccion[] => {
  const data = localStorage.getItem(LOCAL_TRANS_KEY);
  return data ? JSON.parse(data) : [
    { id: 101, monto: "25000.00", tipo: "deposito", createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: 102, monto: "12000.00", tipo: "transferencia", createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), sender_id: 999, receiver_id: 888, receiver: { nombre: "Juan Perez", correo: "juan@gmail.com" } }
  ];
};

const getLocalContacts = (): Contacto[] => {
  const data = localStorage.getItem(LOCAL_CONTACTS_KEY);
  return data ? JSON.parse(data) : [
    { id: 1, nombre: "Juan", apellido: "Perez", alias: "Juanito", banco: "Banco Estado", numeroCuenta: "1234567890", correo: "juan@gmail.com" },
    { id: 2, nombre: "Maria", apellido: "Lopez", alias: "Mari", banco: "Banco de Chile", numeroCuenta: "9876543210", correo: "maria@gmail.com" }
  ];
};

// SERVICIO API UNIFICADO
export const walletService = {
  async getProfile(): Promise<UserProfile> {
    if (isSimulated()) {
      const saldo = parseFloat(localStorage.getItem(LOCAL_SALDO_KEY) || "1000000");
      return {
        id: 999,
        nombre: localStorage.getItem("nombreUsuario") || "Usuario Simulador",
        correo: "simulador@alkewallet.cl",
        saldo,
        avatar: null
      };
    }
    const response = await axios.get(`${API_URL}/usuarios/perfil`, getAuthHeaders());
    return {
      ...response.data.data,
      saldo: parseFloat(response.data.data.saldo)
    };
  },

  async deposit(monto: number): Promise<number> {
    if (isSimulated()) {
      const saldoActual = parseFloat(localStorage.getItem(LOCAL_SALDO_KEY) || "1000000");
      const nuevoSaldo = saldoActual + monto;
      localStorage.setItem(LOCAL_SALDO_KEY, nuevoSaldo.toString());

      // Registrar en el historial de simulación
      const list = getLocalTransactions();
      list.unshift({
        id: Date.now(),
        monto: monto.toFixed(2),
        tipo: 'deposito',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(LOCAL_TRANS_KEY, JSON.stringify(list));
      return nuevoSaldo;
    }
    const response = await axios.post(`${API_URL}/transacciones/deposito`, { monto }, getAuthHeaders());
    return parseFloat(response.data.data.nuevoSaldo);
  },

  async transfer(receiverCorreo: string, monto: number): Promise<number> {
    if (isSimulated()) {
      const saldoActual = parseFloat(localStorage.getItem(LOCAL_SALDO_KEY) || "1000000");
      if (saldoActual < monto) {
        throw new Error("Fondos insuficientes");
      }
      const nuevoSaldo = saldoActual - monto;
      localStorage.setItem(LOCAL_SALDO_KEY, nuevoSaldo.toString());

      // Registrar en contactos si no existe
      const contacts = getLocalContacts();
      let contact = contacts.find(c => c.correo === receiverCorreo);
      if (!contact) {
        contact = {
          id: Date.now(),
          nombre: receiverCorreo.split('@')[0],
          apellido: "Simulado",
          alias: receiverCorreo.split('@')[0],
          banco: "Banco del Estado",
          numeroCuenta: "9999999",
          correo: receiverCorreo
        };
        contacts.push(contact);
        localStorage.setItem(LOCAL_CONTACTS_KEY, JSON.stringify(contacts));
      }

      // Registrar transacción
      const list = getLocalTransactions();
      list.unshift({
        id: Date.now(),
        monto: monto.toFixed(2),
        tipo: 'transferencia',
        createdAt: new Date().toISOString(),
        sender_id: 999,
        receiver_id: contact.id,
        receiver: { nombre: contact.nombre, correo: contact.correo }
      });
      localStorage.setItem(LOCAL_TRANS_KEY, JSON.stringify(list));
      return nuevoSaldo;
    }
    const response = await axios.post(`${API_URL}/transacciones/transferencia`, { receiver_correo: receiverCorreo, monto }, getAuthHeaders());
    return parseFloat(response.data.data.tuNuevoSaldo);
  },

  async getTransactions(): Promise<Transaccion[]> {
    if (isSimulated()) {
      return getLocalTransactions();
    }
    const response = await axios.get(`${API_URL}/transacciones`, getAuthHeaders());
    return response.data.data;
  },

  async getContacts(): Promise<Contacto[]> {
    if (isSimulated()) {
      return getLocalContacts();
    }
    const response = await axios.get(`${API_URL}/contactos-transferencia`, getAuthHeaders());
    return response.data.data;
  },

  async addContact(contacto: Omit<Contacto, 'id'>): Promise<Contacto> {
    if (isSimulated()) {
      const contacts = getLocalContacts();
      const newContact = { id: Date.now(), ...contacto };
      contacts.push(newContact);
      localStorage.setItem(LOCAL_CONTACTS_KEY, JSON.stringify(contacts));
      return newContact;
    }
    const response = await axios.post(`${API_URL}/contactos-transferencia`, contacto, getAuthHeaders());
    return response.data.data;
  }
};
