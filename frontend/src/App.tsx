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
        <h1>🤝 Minga</h1>
        <p className="sub">Pagos en escrow para comerciantes — sobre Stellar</p>
      </header>

      {sinConfig && (
        <div className="aviso">
          ⚠️ Falta configurar el <code>CONTRACT_ID</code> en{" "}
          <code>src/config.ts</code> con el id del contrato deployado.
        </div>
      )}

      <div className="wallet">
        {wallet ? (
          <span>
            Wallet conectada: <code>{wallet.slice(0, 6)}…{wallet.slice(-6)}</code>
          </span>
        ) : (
          <button onClick={conectar}>Conectar wallet</button>
        )}
      </div>
      {error && <div className="error">{error}</div>}

      <nav className="tabs">
        <button
          className={pantalla === "comerciante" ? "activo" : ""}
          onClick={() => setPantalla("comerciante")}
        >
          🏪 Comerciante (Rosa)
        </button>
        <button
          className={pantalla === "proveedor" ? "activo" : ""}
          onClick={() => setPantalla("proveedor")}
        >
          🚚 Proveedor
        </button>
      </nav>

      <main>
        {pantalla === "comerciante" ? <Comerciante wallet={wallet} /> : <Proveedor />}
      </main>

      <footer>
        Prototipo · Stellar Pulso Hackathon · Minga — por Cintia Venecia, Mariela
        Caminos, Cristina Soto y Lourdes Gimenez Bravo
      </footer>
    </div>
  );
}
