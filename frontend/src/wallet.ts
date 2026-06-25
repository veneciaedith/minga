// Conexión de wallet vía Stellar Wallets Kit (v2).
//
// El Kit es UNA sola integración que soporta varias wallets de Stellar.
// El usuario elige la suya en un modal y nosotros usamos siempre la misma API
// para leer su address y firmar. Es la integración del "Integration Track" del
// SCF (categoría Wallet Integration).
//
// En la v2 el Kit es una clase ESTÁTICA: se configura una vez con init() y
// después se llaman sus métodos estáticos (authModal, getAddress, signTransaction).

import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import { FreighterModule, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { LobstrModule } from "@creit.tech/stellar-wallets-kit/modules/lobstr";

// Configuramos el Kit una sola vez, para TESTNET y con las wallets soportadas.
StellarWalletsKit.init({
  network: Networks.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [
    new FreighterModule(),
    new xBullModule(),
    new AlbedoModule(),
    new LobstrModule(),
  ],
});

// Abre el modal para que el usuario elija su wallet y devuelve su address (G...).
export async function conectarWallet(): Promise<string> {
  const { address } = await StellarWalletsKit.authModal();
  return address;
}

// Devuelve la address si ya hay una wallet conectada (sin abrir el modal).
export async function direccionActual(): Promise<string | null> {
  try {
    const { address } = await StellarWalletsKit.getAddress();
    return address || null;
  } catch {
    return null;
  }
}

// Firma un XDR con la wallet elegida y devuelve el XDR ya firmado.
export async function firmarXdr(xdr: string, _address: string): Promise<string> {
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
    networkPassphrase: Networks.TESTNET,
  });
  return signedTxXdr;
}
