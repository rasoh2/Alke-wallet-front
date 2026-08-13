import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CoinPrice {
  clp: number;
  clp_24h_change: number;
  usd: number;
  usd_24h_change: number;
}

interface CryptoData {
  bitcoin: CoinPrice;
  ethereum: CoinPrice;
  solana: CoinPrice;
  cardano: CoinPrice;
}

const CACHE_KEY = 'coingecko_crypto_cache';
const CACHE_TIME_KEY = 'coingecko_crypto_cache_time';
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=clp,usd&include_24hr_change=true';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos
const REFRESH_COOLDOWN = 60 * 1000;   // 1 minuto de cooldown manual

export const WidgetCripto: React.FC = () => {
  const [data, setData] = useState<CryptoData | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fuente, setFuente] = useState<'API' | 'Caché'>('Caché');
  const [ultimoFetch, setUltimoFetch] = useState<number>(0);
  const [cooldown, setCooldown] = useState(false);

  const consultarAPI = async (forzar = false) => {
    const ahora = Date.now();
    const cacheGuardado = localStorage.getItem(CACHE_KEY);
    const tiempoGuardado = localStorage.getItem(CACHE_TIME_KEY);

    // Verificar si usamos caché
    if (!forzar && cacheGuardado && tiempoGuardado) {
      const edadCache = ahora - parseInt(tiempoGuardado);
      if (edadCache < CACHE_DURATION) {
        setData(JSON.parse(cacheGuardado));
        setUltimoFetch(parseInt(tiempoGuardado));
        setFuente('Caché');
        return;
      }
    }

    // Petición HTTP Real
    setCargando(true);
    setError(null);
    try {
      const res = await axios.get<CryptoData>(COINGECKO_URL);
      const dataApi = res.data;
      if (dataApi.bitcoin && dataApi.ethereum) {
        setData(dataApi);
        setUltimoFetch(ahora);
        setFuente('API');
        localStorage.setItem(CACHE_KEY, JSON.stringify(dataApi));
        localStorage.setItem(CACHE_TIME_KEY, ahora.toString());

        // Iniciar cooldown de 1 minuto para refresco manual si fue forzado
        if (forzar) {
          setCooldown(true);
          setTimeout(() => setCooldown(false), REFRESH_COOLDOWN);
        }
      } else {
        throw new Error('Formato de datos no válido');
      }
    } catch (err: any) {
      console.error('Error CoinGecko:', err);
      setError('Límite de peticiones de CoinGecko excedido. Reintentando con caché local...');
      // Fallback a caché si la API falla
      if (cacheGuardado) {
        setData(JSON.parse(cacheGuardado));
        if (tiempoGuardado) setUltimoFetch(parseInt(tiempoGuardado));
        setFuente('Caché');
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    consultarAPI();
  }, []);

  const handleRefrescarManual = () => {
    if (!cooldown) {
      consultarAPI(true);
    }
  };

  const formatearMonto = (monto: number, divisa: 'CLP' | 'USD') => {
    if (divisa === 'CLP') {
      return Math.round(monto).toLocaleString('es-CL');
    }
    return monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderFilaCoin = (id: keyof CryptoData, nombre: string, simbolo: string, colorBadge: string) => {
    if (!data) return null;
    const coin = data[id];
    const cambioNegativo = coin.clp_24h_change < 0;

    return (
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom text-start" key={id}>
        <div className="d-flex align-items-center">
          <span className={`badge ${colorBadge} rounded-circle p-2 me-3 fs-6 d-flex align-items-center justify-content-center`} style={{ width: '38px', height: '38px' }}>
            {simbolo}
          </span>
          <div>
            <h6 className="mb-0 fw-bold">{nombre}</h6>
            <span className="text-muted small text-uppercase">{id}</span>
          </div>
        </div>
        <div className="text-end">
          <div className="fw-bold fs-5">${formatearMonto(coin.clp, 'CLP')} CLP</div>
          <div className="small text-muted">${formatearMonto(coin.usd, 'USD')} USD</div>
          <span className={`badge ${cambioNegativo ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} mt-1`}>
            {cambioNegativo ? '↓' : '↑'} {Math.abs(coin.clp_24h_change).toFixed(2)}% (24h)
          </span>
        </div>
      </div>
    );
  };

  const minutosDesdeFetch = Math.max(0, Math.floor((Date.now() - ultimoFetch) / 60000));

  return (
    <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
      <div className="card-header bg-primary text-white py-3 border-0 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">🪙 Cotizaciones Cripto</h5>
        <button
          className="btn btn-outline-light btn-sm rounded-pill fw-semibold"
          onClick={handleRefrescarManual}
          disabled={cargando || cooldown}
        >
          {cargando ? (
            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          ) : (
            '🔄 '
          )}
          {cooldown ? 'Espera...' : 'Refrescar'}
        </button>
      </div>
      <div className="card-body p-0">
        {error && (
          <div className="alert alert-warning rounded-0 border-0 m-0 py-2 small fw-semibold text-center">
            {error}
          </div>
        )}

        {cargando && !data ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted small mt-2">Obteniendo cotizaciones en tiempo real...</p>
          </div>
        ) : data ? (
          <div className="fade-in">
            {renderFilaCoin('bitcoin', 'Bitcoin', 'BTC', 'bg-warning text-dark')}
            {renderFilaCoin('ethereum', 'Ethereum', 'ETH', 'bg-secondary text-white')}
            {renderFilaCoin('solana', 'Solana', 'SOL', 'bg-dark text-info')}
            {renderFilaCoin('cardano', 'Cardano', 'ADA', 'bg-primary text-white')}
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            No hay cotizaciones disponibles en este momento.
          </div>
        )}
      </div>
      <div className="card-footer bg-light border-0 py-2 text-center text-muted fs-7">
        Fuente: <span className="fw-semibold">{fuente}</span> | 
        {ultimoFetch > 0 ? ` Actualizado hace ${minutosDesdeFetch} min` : ' No sincronizado'}
      </div>
    </div>
  );
};
