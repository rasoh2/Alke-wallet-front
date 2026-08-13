import React from 'react';

interface TarjetaSaldoProps {
  saldo: number;
  cargando: boolean;
  error: string | null;
  divisa?: string;
}

export const TarjetaSaldo: React.FC<TarjetaSaldoProps> = ({
  saldo,
  cargando,
  error,
  divisa = "CLP - Pesos Chilenos"
}) => {
  const formatearSaldo = (valor: number) => {
    return Math.floor(valor).toLocaleString("es-CL");
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 mb-4 card-saldo text-center">
      <div className="card-body p-4">
        <h5 className="text-white-50 mb-2">Saldo Disponible</h5>
        {cargando ? (
          <div className="d-flex justify-content-center align-items-center my-3">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-warning fw-bold my-2">
            Error al cargar saldo: {error}
          </div>
        ) : (
          <h1 className="display-3 fw-bold text-white mb-0" id="saldoActual">
            ${formatearSaldo(saldo)}
          </h1>
        )}
        <p className="text-white-50 mt-2 mb-0">{divisa}</p>
      </div>
    </div>
  );
};
