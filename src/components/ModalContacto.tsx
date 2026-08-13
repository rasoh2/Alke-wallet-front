import React, { useState } from 'react';
import Swal from 'sweetalert2';

interface ModalContactoProps {
  show: boolean;
  onClose: () => void;
  onSave: (nuevoContacto: {
    nombre: string;
    apellido: string;
    alias: string;
    banco: string;
    numeroCuenta: string;
  }) => Promise<boolean>;
}

export const ModalContacto: React.FC<ModalContactoProps> = ({
  show,
  onClose,
  onSave
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [alias, setAlias] = useState('');
  const [banco, setBanco] = useState('');
  const [cargando, setCargando] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !apellido || !numeroCuenta || !alias || !banco) {
      Swal.fire('Error', 'Por favor, completa todos los campos obligatorios', 'error');
      return;
    }

    setCargando(true);
    const exito = await onSave({
      nombre,
      apellido,
      numeroCuenta,
      alias,
      banco
    });
    setCargando(false);

    if (exito) {
      // Limpiar campos
      setNombre('');
      setApellido('');
      setNumeroCuenta('');
      setAlias('');
      setBanco('');
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose} style={{ zIndex: 1040 }}></div>

      {/* Modal */}
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content rounded-4 border-0 shadow-lg">
            <div className="modal-header bg-primary text-white rounded-top-4 py-3">
              <h5 className="modal-title fw-bold">➕ Agregar Nuevo Contacto</h5>
              <button
                type="button"
                className="btn-close btn-close-white shadow-none"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Juan"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small">Apellido *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Ej: Pérez"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Alias *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      placeholder="Ej: Juanito"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Banco *</label>
                    <select
                      className="form-select"
                      value={banco}
                      onChange={(e) => setBanco(e.target.value)}
                      required
                    >
                      <option value="">-- Selecciona un Banco --</option>
                      <option value="Banco de Chile">Banco de Chile</option>
                      <option value="Banco Estado">Banco Estado</option>
                      <option value="Banco Santander">Banco Santander</option>
                      <option value="BCI">BCI</option>
                      <option value="Banco Itaú">Banco Itaú</option>
                      <option value="Banco Scotiabank">Banco Scotiabank</option>
                      <option value="Banco Falabella">Banco Falabella</option>
                      <option value="Coopeuch">Coopeuch</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small">Número de Cuenta / Rut *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={numeroCuenta}
                      onChange={(e) => setNumeroCuenta(e.target.value)}
                      placeholder="Ej: 123456789"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer p-3 bg-light rounded-bottom-4 border-top-0 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={cargando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={cargando}
                >
                  {cargando ? 'Guardando...' : '💾 Guardar Contacto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
