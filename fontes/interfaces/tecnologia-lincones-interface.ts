import { Comando } from "../comandos";
import { RetornoComandoInterface } from "./retorno-comando-interface";

export interface TecnologiaLinconesInterface {
    iniciar(caminho: string): void;
    executar(_: any, sentencaLincones: string, parametros: any[]): Promise<RetornoComandoInterface[]>;
    executarComando(comando: Comando): Promise<RetornoComandoInterface[]>;
}
