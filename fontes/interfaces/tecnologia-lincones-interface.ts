import { Comando } from "../comandos";
import { RetornoComandoInterface } from "./retorno-comando-interface";

export interface TecnologiaLinconesInterface {
    // iniciar(): void;
    executarComando(comando: Comando): Promise<RetornoComandoInterface[]>;
}
