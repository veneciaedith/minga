import { useEffect, useState } from "react";
import { conectarWallet, direccionActual } from "./wallet";
import Comerciante from "./screens/Comerciante";
import Proveedor from "./screens/Proveedor";
import { CONTRACT_ID } from "./config";

type Pantalla = "comerciante" | "proveedor";

export default function App() {
  const [pantalla, setPantalla] = useState<Pantalla>("comerciante");
  const [wallet, setWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Al cargar, vemos si la wallet ya estaba conectada.
  useEffect(() => {
    direccionActual().then(setWallet);
  }, []);

  async function conectar() {
    setError(null);
    try {
      setWallet(await conectarWallet());
    } catch (e: any) {
      setError(e.message);
    }
  }

  // Aviso si todavía no se configuró el contrato deployado.
  const sinConfig = CONTRACT_ID.startsWith("PEGA_AQUI");

  return (
    <div className="app">
      <header>
        <h1>
          <span aria-hidden="true">🤝</span> Minga
        </h1>
        <p className="sub">Pagos en escrow para comerciantes — sobre Stellar</p>
      </header>

      {sinConfig && (
        <div className="aviso" role="alert">
          <span aria-hidden="true">⚠️</span> Falta configurar el{" "}
          <code>CONTRACT_ID</code> en <code>src/config.ts</code> con el id del
          contrato deployado.
        </div>
      )}

      <div className="wallet">
        {wallet ? (
          <span>
            Wallet conectada:{" "}
            <code title={wallet}>
              {wallet.slice(0, 6)}…{wallet.slice(-6)}
            </code>
          </span>
        ) : (
          <button type="button" onClick={conectar}>
            Conectar wallet
          </button>
        )}
      </div>

      {/* Región siempre presente en la página: así el lector de pantalla
          anuncia el error en el momento en que aparece. */}
      <div className="error" role="alert">
        {error}
      </div>

      <nav className="tabs" aria-label="Elegí con qué rol querés usar Minga">
        <button
          type="button"
          className={pantalla === "comerciante" ? "activo" : ""}
          aria-current={pantalla === "comerciante" ? "true" : undefined}
          onClick={() => setPantalla("comerciante")}
        >
          <span aria-hidden="true">🏪</span> Comerciante (Rosa)
        </button>
        <button
          type="button"
          className={pantalla === "proveedor" ? "activo" : ""}
          aria-current={pantalla === "proveedor" ? "true" : undefined}
          onClick={() => setPantalla("proveedor")}
        >
          <span aria-hidden="true">🚚</span> Proveedor
        </button>
      </nav>

      <main id="contenido">
        {pantalla === "comerciante" ? <Comerciante wallet={wallet} /> : <Proveedor />}
      </main>

      <footer>
        Prototipo · Stellar Pulso Hackathon · Minga — por Cintia Venecia, Mariela
        Caminos, Cristina Soto y Lourdes Gimenez Bravo
      </footer>
    </div>
  );
}
