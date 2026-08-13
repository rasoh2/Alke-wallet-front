import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ModalContacto } from './ModalContacto';

interface Contacto {
  id?: number;
  nombre: string;
  apellido: string;
  alias: string;
  banco: string;
  numeroCuenta: string;
  correo: string;
}

interface PanelTransferenciasProps {
  saldo: number;
  token: string | null;
  API_URL: string;
  onTransferSuccess: (nuevoSaldo: number) => void;
}

const CONTACTOS_MOCK: Contacto[] = [
  { nombre: 'Pedro', apellido: 'Martínez', alias: 'Pedro', banco: 'Banco Estado', numeroCuenta: '1234567890', correo: '1234567890@mail.com' },
  { nombre: 'María', apellido: 'González', alias: 'Mari', banco: 'Banco de Chile', numeroCuenta: '9876543210', correo: '9876543210@mail.com' },
  { nombre: 'Carlos', apellido: 'Rojas', alias: 'Carlitos', banco: 'Banco Santander', numeroCuenta: '555444333', correo: '555444333@mail.com' }
];

export const PanelTransferencias: React.FC<PanelTransferenciasProps> = ({
  saldo,
  token,
  API_URL,
  onTransferSuccess
}) => {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [filtro, setFiltro] = useState('');
  const [selectedIdx, setSelectedIdx] = useState<string>('');
  const [monto, setMonto] = useState('');
  const [montoWarning, setMontoWarning] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [cargando, setCargando] = useState(false);

  const cargarContactos = async () => {
    if (token) {
      setCargando(true);
      try {
        const response = await axios.get(`${API_URL}/contactos-transferencia`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.status === 'success') {
          setContactos(response.data.data);
        }
      } catch (e) {
        console.error("Error al cargar contactos:", e);
        setContactos([]);
      } finally {
        setCargando(false);
      }
    } else {
      setContactos(CONTACTOS_MOCK);
    }
  };

  useEffect(() => {
    cargarContactos();
  }, [token]);

  const handleMontoChange = (val: string) => {
    setMonto(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (num < 0) setMonto('0');
      if (num > saldo) {
        setMontoWarning('⚠️ El monto supera tu saldo disponible');
      } else {
        setMontoWarning(null);
      }
    } else {
      setMontoWarning(null);
    }
  };

  const selectedContact = selectedIdx !== '' ? contactos[parseInt(selectedIdx)] : null;

  const handleGuardarContacto = async (nuevo: {
    nombre: string;
    apellido: string;
    alias: string;
    banco: string;
    numeroCuenta: string;
  }) => {
    const correo = `${nuevo.numeroCuenta}@mail.com`;
    if (token) {
      try {
        const response = await axios.post(
          `${API_URL}/contactos-transferencia`,
          { ...nuevo, correo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.status === 'success') {
          Swal.fire('¡Guardado!', 'Contacto guardado en el servidor.', 'success');
          await cargarContactos();
          return true;
        }
      } catch (err: any) {
        Swal.fire('Error', err.response?.data?.message || 'No se pudo guardar el contacto.', 'error');
      }
    } else {
      const nuevoContacto: Contacto = { ...nuevo, correo };
      setContactos(prev => [...prev, nuevoContacto]);
      Swal.fire('¡Éxito Simulación!', 'Contacto agregado localmente.', 'success');
      return true;
    }
    return false;
  };

  const realizarTransferencia = async (e: React.FormEvent) => {
    e.preventDefault();
    const numMonto = parseFloat(monto);

    if (isNaN(numMonto) || numMonto <= 0) {
      Swal.fire('Error', 'Ingresa un monto válido mayor a 0', 'error');
      return;
    }

    if (numMonto > saldo) {
      Swal.fire('Error', 'Saldo insuficiente para realizar esta transferencia', 'error');
      return;
    }

    if (numMonto < 1000) {
      Swal.fire('Error', 'El monto mínimo de transferencia es $1.000 CLP', 'error');
      return;
    }

    let correoReceptor = selectedContact?.correo;
    if (!correoReceptor) {
      const { value: email } = await Swal.fire({
        title: 'Correo del Receptor',
        input: 'email',
        inputLabel: 'Por favor, ingresa el correo del usuario a transferir:',
        inputPlaceholder: 'correo@ejemplo.com',
        validationMessage: 'Correo inválido'
      });
      if (email) {
        correoReceptor = email;
      } else {
        return;
      }
    }

    if (token) {
      setCargando(true);
      try {
        const response = await axios.post(
          `${API_URL}/transacciones/transferencia`,
          { receiver_correo: correoReceptor, monto: numMonto },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.status === 'success') {
          const nuevoSaldo = parseFloat(response.data.data.tuNuevoSaldo);
          onTransferSuccess(nuevoSaldo);
          Swal.fire(
            '✅ ¡Transferencia Exitosa!',
            `Se han transferido $${numMonto.toLocaleString("es-CL")} CLP a ${correoReceptor}.`,
            'success'
          );
          setMonto('');
          setSelectedIdx('');
        }
      } catch (err: any) {
        Swal.fire('Error', err.response?.data?.message || 'Error en la transferencia.', 'error');
      } finally {
        setCargando(false);
      }
    } else {
      // Simulado local
      const nuevoSaldo = saldo - numMonto;
      onTransferSuccess(nuevoSaldo);
      Swal.fire({
        icon: 'success',
        title: '¡Transferencia Simulada!',
        text: `Se han transferido $${numMonto.toLocaleString("es-CL")} CLP a ${correoReceptor} localmente.`,
      });
      setMonto('');
      setSelectedIdx('');
    }
  };

  const contactosFiltrados = contactos.filter(c => 
    c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    c.apellido.toLowerCase().includes(filtro.toLowerCase()) ||
    c.alias.toLowerCase().includes(filtro.toLowerCase()) ||
    c.banco.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="row g-4 fade-in">
      {/* COLUMNA IZQUIERDA: Formulario */}
      <div className="col-12 col-md-6">
        <div className="card shadow-sm border-0 rounded-4 mb-3">
          <div className="card-body p-4">
            <div className="mb-4">
              <label htmlFor="buscarContacto" className="form-label fw-semibold">
                🔍 Filtrar Contactos
              </label>
              <input
                type="text"
                className="form-control"
                id="buscarContacto"
                placeholder="Filtrar por nombre, alias, banco..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <small className="form-text text-muted">
                La lista de la derecha se filtrará en tiempo real.
              </small>
            </div>

            <form onSubmit={realizarTransferencia}>
              <div className="mb-4">
                <label htmlFor="selectContacto" className="form-label fw-semibold">
                  👤 Seleccionar Destinatario
                </label>
                <select
                  id="selectContacto"
                  className="form-select form-select-lg"
                  value={selectedIdx}
                  onChange={(e) => setSelectedIdx(e.target.value)}
                  required
                >
                  <option value="">-- Selecciona un destinatario --</option>
                  {contactos.map((c, idx) => (
                    <option key={idx} value={idx.toString()}>
                      {c.nombre} {c.apellido} ({c.alias})
                    </option>
                  ))}
                </select>
              </div>

              {selectedContact && (
                <div id="infoContacto" className="alert alert-light mb-4 border border-light-subtle">
                  <h6 className="fw-bold mb-2">Datos del destinatario:</h6>
                  <p className="mb-1">
                    <strong>Nombre:</strong> {selectedContact.nombre} {selectedContact.apellido} {selectedContact.alias ? `(${selectedContact.alias})` : ''}
                  </p>
                  <p className="mb-1">
                    <strong>Banco:</strong> {selectedContact.banco}
                  </p>
                  <p className="mb-0">
                    <strong>Cuenta:</strong> {selectedContact.numeroCuenta}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="montoEnviar" className="form-label fw-semibold">
                  💰 Monto a enviar (CLP)
                </label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className="form-control"
                    id="montoEnviar"
                    placeholder="Ingresa el monto"
                    value={monto}
                    onChange={(e) => handleMontoChange(e.target.value)}
                    required
                    min="1000"
                    step="1000"
                  />
                </div>
                <small className="form-text text-muted">
                  Monto mínimo: $1.000 CLP
                </small>
                {montoWarning && (
                  <div id="montoWarning" className="text-danger small mt-1">
                    {montoWarning}
                  </div>
                )}
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-warning btn-lg fw-semibold"
                  disabled={cargando}
                >
                  {cargando ? 'Transfiriendo...' : '💸 Enviar Transferencia'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="d-grid gap-2 mb-3">
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() => setShowModal(true)}
          >
            ➕ Agregar Nuevo Contacto
          </button>
        </div>
      </div>

      {/* COLUMNA DERECHA: Lista de Contactos */}
      <div className="col-12 col-md-6">
        <div className="card shadow-sm border-0 rounded-4 sticky-top" style={{ top: '20px' }}>
          <div className="card-body">
            <h6 className="fw-bold mb-3">📋 Mis Contactos</h6>
            {cargando && contactos.length === 0 ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : contactosFiltrados.length === 0 ? (
              <div id="sinContactos" className="text-center text-muted py-4">
                <p className="mb-0">No se encontraron contactos</p>
              </div>
            ) : (
              <div
                id="listaContactos"
                className="list-group list-group-flush"
                style={{ maxHeight: '450px', overflowY: 'auto' }}
              >
                {contactosFiltrados.map((c, idx) => {
                  const originalIdx = contactos.indexOf(c);
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`list-group-item list-group-item-action item-contacto text-start border-0 border-bottom ${selectedIdx === originalIdx.toString() ? 'bg-light' : ''}`}
                      onClick={() => setSelectedIdx(originalIdx.toString())}
                    >
                      <div className="fw-bold">
                        {c.nombre} {c.apellido}{' '}
                        <span className="text-muted small">({c.alias})</span>
                      </div>
                      <div className="small text-muted">
                        {c.banco} - {c.numeroCuenta}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ModalContacto
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleGuardarContacto}
      />
    </div>
  );
};
