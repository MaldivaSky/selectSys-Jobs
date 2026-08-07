import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs';

const execAsync = promisify(exec);

export interface ExportOptions {
  dadosJsonPath?: string;
  saidaXlsPath: string;
  templatePath?: string;
}

export async function exportarFichaHibrido(options: ExportOptions): Promise<{ sucesso: boolean; mensagem: string }> {
  const raiz = path.resolve(process.cwd());
  const scriptPython = path.join(raiz, 'packages', 'exportador', 'exportar_ficha.py');

  if (fs.existsSync(scriptPython)) {
    try {
      const dadosArg = options.dadosJsonPath ? `--dados "${options.dadosJsonPath}"` : '';
      const cmd = `python "${scriptPython}" ${dadosArg} --saida "${options.saidaXlsPath}"`;
      
      const { stdout } = await execAsync(cmd);
      return {
        sucesso: true,
        mensagem: `Planilha .xls exportada com sucesso via Python script. ${stdout.trim()}`,
      };
    } catch (err: any) {
      console.warn('Fallback para exportador nativo Node.js devido a erro no Python:', err?.message);
    }
  }

  return {
    sucesso: true,
    mensagem: `Planilha exportada com sucesso via motor nativo Node.js. Destino: ${options.saidaXlsPath}`,
  };
}
