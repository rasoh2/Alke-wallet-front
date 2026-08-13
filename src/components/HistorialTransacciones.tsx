import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Transaccion {
  id: number;
  tipo: 'deposito' | 'transferencia';
  monto: number;
  descripcion: string;
  fechaFormateada: string;
  timestamp: number;
}

interface HistorialTransaccionesProps {
  saldo: number;
  token: string | null;
  API_URL: string;
}

const TRANSACCIONES_MOCK: Transaccion[] = [
  { id: 1, tipo: 'deposito', monto: 1000000, descripcion: 'Depósito inicial de cuenta', fechaFormateada: '13/08/2026, 10:00:00', timestamp: 1786632000000 },
  { id: 2, tipo: 'transferencia', monto: 15000, descripcion: 'Transferencia enviada a Pedro Martínez', fechaFormateada: '13/08/2026, 11:30:00', timestamp: 1786637400000 },
  { id: 3, tipo: 'deposito', monto: 5000, descripcion: 'Depósito de saldo simulado', fechaFormateada: '13/08/2026, 12:20:00', timestamp: 1786640400000 }
];

export const HistorialTransacciones: React.FC<HistorialTransaccionesProps> = ({
  saldo,
  token,
  API_URL
}) => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'deposito' | 'transferencia'>('todos');
  const [ordenarPor, setOrdenarPor] = useState<'reciente' | 'antiguo' | 'mayor' | 'menor'>('reciente');

  const cargarHistorial = async () => {
    if (token) {
      setCargando(true);
      try {
        const response = await axios.get(`${API_URL}/transacciones`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status === 'success') {
          const miId = parseInt(localStorage.getItem("idUsuario") || '0');
          const dataMapped = response.data.data.map((t: any) => {
            let tipoCalculado: 'deposito' | 'transferencia' = t.tipo;
            if (t.tipo === 'transferencia') {
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
          setTransacciones(dataMapped);
        }
      } catch (e) {
        console.error("Error al cargar transacciones:", e);
        setTransacciones([]);
      } finally {
        setCargando(false);
      }
    } else {
      setTransacciones(TRANSACCIONES_MOCK);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [token, saldo]); // Recargar si cambia el saldo (p. ej. tras realizar un depósito o transferencia)

  // Totales para las tarjetas de resumen
  const totalDepositado = transacciones
    .filter(t => t.tipo === 'deposito')
    .reduce((acc, t) => acc + t.monto, 0);

  const totalEnviado = transacciones
    .filter(t => t.tipo === 'transferencia')
    .reduce((acc, t) => acc + t.monto, 0);

  // Filtrado y Ordenación
  const transaccionesFiltradas = transacciones
    .filter(t => filtroTipo === 'todos' || t.tipo === filtroTipo)
    .sort((a, b) => {
      if (ordenarPor === 'reciente') return b.timestamp - a.timestamp;
      if (ordenarPor === 'antiguo') return a.timestamp - b.timestamp;
      if (ordenarPor === 'mayor') return b.monto - a.monto;
      if (ordenarPor === 'menor') return a.monto - b.monto;
      return 0;
    });

  return (
    <div className="fade-in">
      {/* Resumen de Totales */}
      <div className="row mb-4">
        <div className="col-12 col-md-4 mb-3">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body text-center py-3">
              <small className="text-muted d-block mb-1">Saldo Actual</small>
              <h4 className="fw-bold text-primary mb-0">
                ${Math.floor(saldo).toLocaleString("es-CL")} CLP
              </h4>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4 mb-3">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body text-center py-3">
              <small className="text-muted d-block mb-1">Total Depositado</small>
              <h4 className="fw-bold text-success mb-0">
                ${Math.floor(totalDepositado).toLocaleString("es-CL")} CLP
              </h4>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4 mb-3">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body text-center py-3">
              <small className="text-muted d-block mb-1">Total Enviado</small>
              <h4 className="fw-bold text-danger mb-0">
                ${Math.floor(totalEnviado).toLocaleString("es-CL")} CLP
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Filtros */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="filtroTipo" className="form-label fw-semibold">
                Filtrar por tipo:
              </label>
              <select 
                id="filtroTipo" 
                className="form-select"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
              >
                <option value="todos">📋 Todos los movimientos</option>
                <option value="deposito">💰 Depósitos</option>
                <option value="transferencia">💸 Transferencias</option>
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="ordenar" className="form-label fw-semibold">
                Ordenar por:
              </label>
              <select 
                id="ordenar" 
                className="form-select"
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value as any)}
              >
                <option value="reciente">🕐 Más reciente</option>
                <option value="antiguo">🕐 Más antiguo</option>
                <option value="mayor">💰 Mayor monto</option>
                <option value="menor">💰 Menor monto</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Listado de Transacciones */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-4">Transacciones</h5>

          {cargando ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted small mt-2">Cargando tu historial...</p>
            </div>
          ) : transaccionesFiltradas.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <span className="fs-1 d-block mb-2">🔍</span>
              <p className="mb-0">No se encontraron movimientos registrados.</p>
            </div>
          ) : (
            <ul className="list-group list-group-flush">
              {transaccionesFiltradas.map((mov) => {
                const esIngreso = mov.tipo === 'deposito';
                const signo = esIngreso ? '+' : '-';
                const claseMonto = esIngreso ? 'text-success' : 'text-danger';
                const icono = esIngreso ? '💰' : '💸';
                const badgeClase = esIngreso ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger';

                return (
                  <li key={mov.id} className="list-group-item d-flex justify-content-between align-items-start border-0 border-bottom px-0 py-3">
                    <div className="d-flex align-items-start">
                      <span className={`badge ${badgeClase} rounded-circle p-2 me-3 fs-6 d-flex align-items-center justify-content-center`} style={{ width: '38px', height: '38px' }}>
                        {icono}
                      </span>
                      <div>
                        <div className="fw-bold fs-6">
                          {esIngreso ? 'Depósito de Dinero' : 'Transferencia Realizada'}
                        </div>
                        <div className="text-muted small mb-1">📝 {mov.descripcion}</div>
                        <div className="text-muted small">📅 {mov.fechaFormateada}</div>
                      </div>
                    </div>
                    <div className="text-end">
                      <h5 className={`fw-bold ${claseMonto} mb-0`}>
                        {signo}${Math.floor(mov.monto).toLocaleString("es-CL")}
                      </h5>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
