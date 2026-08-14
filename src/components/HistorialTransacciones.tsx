import React, { useState, useMemo } from 'react';
import { useTransaction } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';

export const HistorialTransacciones: React.FC = () => {
  const { saldo, transacciones, cargando } = useTransaction();
  const { idUsuario } = useAuth();
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'deposito' | 'transferencia'>('todos');
  const [ordenarPor, setOrdenarPor] = useState<'reciente' | 'antiguo' | 'mayor' | 'menor'>('reciente');

  // Mapear y clasificar transacciones según el usuario logueado
  const transaccionesMapeadas = useMemo(() => {
    const miId = parseInt(idUsuario || '0');
    return transacciones.map(t => {
      let tipoCalculado: 'deposito' | 'transferencia' = t.tipo;
      let descripcion = "Depósito de saldo";

      if (t.tipo === 'transferencia') {
        if (t.sender_id === miId) {
          tipoCalculado = "transferencia";
          descripcion = `Transferencia enviada${t.receiver ? ` a ${t.receiver.nombre}` : ''}`;
        } else {
          tipoCalculado = "deposito";
          descripcion = `Transferencia recibida${t.sender ? ` de ${t.sender.nombre}` : ''}`;
        }
      }

      return {
        id: t.id,
        tipo: tipoCalculado,
        monto: parseFloat(t.monto),
        descripcion,
        fechaFormateada: new Date(t.createdAt).toLocaleString("es-CL"),
        timestamp: new Date(t.createdAt).getTime()
      };
    });
  }, [transacciones, idUsuario]);

  // Totales para las tarjetas de resumen
  const totalDepositado = useMemo(() => {
    return transaccionesMapeadas
      .filter(t => t.tipo === 'deposito')
      .reduce((acc, t) => acc + t.monto, 0);
  }, [transaccionesMapeadas]);

  const totalEnviado = useMemo(() => {
    return transaccionesMapeadas
      .filter(t => t.tipo === 'transferencia')
      .reduce((acc, t) => acc + t.monto, 0);
  }, [transaccionesMapeadas]);

  // Filtrado y Ordenación
  const transaccionesFiltradas = useMemo(() => {
    return transaccionesMapeadas
      .filter(t => filtroTipo === 'todos' || t.tipo === filtroTipo)
      .sort((a, b) => {
        if (ordenarPor === 'reciente') return b.timestamp - a.timestamp;
        if (ordenarPor === 'antiguo') return a.timestamp - b.timestamp;
        if (ordenarPor === 'mayor') return b.monto - a.monto;
        if (ordenarPor === 'menor') return a.monto - b.monto;
        return 0;
      });
  }, [transaccionesMapeadas, filtroTipo, ordenarPor]);

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
              <small className="text-muted d-block mb-1">Total Ingresos / Depósitos</small>
              <h4 className="fw-bold text-success mb-0">
                ${Math.floor(totalDepositado).toLocaleString("es-CL")} CLP
              </h4>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4 mb-3">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body text-center py-3">
              <small className="text-muted d-block mb-1">Total Egresos / Enviado</small>
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
                Filtrar por Tipo
              </label>
              <select
                id="filtroTipo"
                className="form-select"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
              >
                <option value="todos">Todos los movimientos</option>
                <option value="deposito">Ingresos / Depósitos</option>
                <option value="transferencia">Egresos / Transferencias</option>
              </select>
            </div>
            <div className="col-12 col-md-6">
              <label htmlFor="ordenarPor" className="form-label fw-semibold">
                Ordenar por
              </label>
              <select
                id="ordenarPor"
                className="form-select"
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value as any)}
              >
                <option value="reciente">Más recientes primero</option>
                <option value="antiguo">Más antiguos primero</option>
                <option value="mayor">Mayor monto primero</option>
                <option value="menor">Menor monto primero</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Listado de Transacciones */}
      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">ID Movimiento</th>
                  <th className="py-3">Fecha y Hora</th>
                  <th className="py-3">Descripción</th>
                  <th className="py-3 text-end px-4">Monto</th>
                </tr>
              </thead>
              <tbody id="tablaCuerpoHistorial">
                {cargando && transaccionesMapeadas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando movimientos...</span>
                      </div>
                    </td>
                  </tr>
                ) : transaccionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-5 text-muted">
                      No hay movimientos que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  transaccionesFiltradas.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 font-monospace small">#{t.id}</td>
                      <td className="py-3">{t.fechaFormateada}</td>
                      <td className="py-3 fw-medium">{t.descripcion}</td>
                      <td className={`py-3 text-end fw-bold px-4 ${t.tipo === 'deposito' ? 'text-success' : 'text-danger'}`}>
                        {t.tipo === 'deposito' ? '+' : '-'} ${t.monto.toLocaleString("es-CL")} CLP
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
