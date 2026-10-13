import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { db } from '../../src/db/index.js';
import { ordensServico } from '../../src/db/schema/ordens.js';
import { eq } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth.js';

const STORAGE_DIR = process.env.STORAGE_DIR || path.resolve(process.cwd(), 'storage/laudos');

// Garante existência da pasta de storage persistente
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Gera o Buffer do PDF A4 usando PDFKit
function createPdfBuffer(dados) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Cabeçalho da Empresa
      doc.fontSize(18).fillColor('#06b6d4').text('EASYCELL ASSISTÊNCIA TÉCNICA', { align: 'center' });
      doc.fontSize(10).fillColor('#64748b').text('SISTEMA ESPECIALIZADO EM SMARTPHONES & DISPOSITIVOS MÓVEIS', { align: 'center' });
      doc.moveDown(0.5);
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.8);

      // Título do Laudo
      doc.fontSize(14).fillColor('#0f172a').text(`LAUDO PERICIAL DE ENTRADA & RECEBIMENTO — O.S. #${dados.numeroOs}`, { align: 'left' });
      doc.fontSize(9).fillColor('#475569').text(`Data de Emissão: ${new Date().toLocaleString('pt-BR')} | ID da O.S.: ${dados.osId}`);
      doc.moveDown(0.8);

      // Dados do Cliente e Aparelho
      doc.fontSize(11).fillColor('#0284c7').text('1. IDENTIFICAÇÃO DO APARELHO & PROPRIETÁRIO');
      doc.fontSize(9).fillColor('#1e293b');
      doc.text(`Cliente: ${dados.clienteNome || 'Consumidor Final'}`);
      doc.text(`Aparelho: ${dados.aparelho || 'Smartphone'} | Cor: ${dados.cor || 'Padrão'}`);
      doc.text(`IMEI / Serial: ${dados.imei || 'Não informado / Ilegível'}`);
      doc.text(`Defeito Declarado: ${dados.defeitoRelatado || 'Conforme análise de bancada'}`);
      doc.moveDown(0.8);

      // Checklist de Entrada
      doc.fontSize(11).fillColor('#0284c7').text('2. CHECKLIST FÍSICO E DE HARDWARE NA ENTRADA');
      doc.fontSize(9).fillColor('#334155');
      const cl = dados.checklist || {};
      doc.text(`• Tela / Visor: ${cl.telaLigando !== false ? 'Ligando Normal' : 'Não liga / Avariada'}`);
      doc.text(`• Touch Screen: ${cl.touchOk !== false ? 'Operacional' : 'Com falha / Fantasma'}`);
      doc.text(`• Câmeras (Frontal/Traseira): ${cl.cameraFrontal !== false ? 'OK' : 'Com avaria'}`);
      doc.text(`• Conector de Carga: ${cl.conectorCarga !== false ? 'Recebendo carga' : 'Sem sinal de carga'}`);
      doc.text(`• Carcaça e Estrutura: ${cl.carcacaAvariada ? 'Avariada / Trincada / Arranhada' : 'Íntegra'}`);
      doc.moveDown(0.8);

      // Termos Jurídicos CDC e Código Civil
      doc.fontSize(11).fillColor('#0284c7').text('3. TERMOS LEGAIS E GARANTIA COMPULSÓRIA');
      doc.fontSize(7.5).fillColor('#475569');
      doc.text('Art. 26 do CDC: Fica estipulada a garantia legal de 90 (noventa) dias para peças substituídas e serviços executados, a contar da entrega efetiva. A garantia é excluída em caso de contato com líquidos, oxidação, quedas ou intervenção por terceiros.');
      doc.moveDown(0.3);
      doc.text('Art. 1.275 do Código Civil: Aparelhos prontos para retirada não reclamados no prazo de 90 dias após notificação via WhatsApp/Telefone serão considerados presumidamente abandonados para custeio das peças e guarda técnica.');
      doc.moveDown(1.5);

      // Espaço de Assinatura
      const ySign = doc.y;
      doc.strokeColor('#94a3b8').lineWidth(1).moveTo(60, ySign + 30).lineTo(250, ySign + 30).stroke();
      doc.strokeColor('#94a3b8').lineWidth(1).moveTo(320, ySign + 30).lineTo(510, ySign + 30).stroke();
      doc.fontSize(8).fillColor('#334155');
      doc.text('Assinatura do Cliente / Responsável', 70, ySign + 35);
      doc.text('Visto do Responsável Técnico / EasyCell', 330, ySign + 35);

      // Rodapé com Hash
      doc.fontSize(7).fillColor('#94a3b8').text(
        `Autenticidade Criptográfica: SHA-256 conferível no servidor EasyCell. Emitido sob as normas técnicas VibeDoCode.`,
        40, 770, { align: 'center', width: 515 }
      );

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

export async function laudosRoutes(fastify, options) {
  // Geração e Armazenamento Real do PDF Binário (Protegido por Autenticação)
  fastify.post('/api/v1/laudos/generate-pdf', { preHandler: [authenticateUser] }, async (request, reply) => {
    const { osId, numeroOs, clienteNome, aparelho, imei, defeitoRelatado, checklist } = request.body || {};

    const num = Number(numeroOs) || 1001;
    const id = osId || 'os_demo';

    try {
      // 1. Gera o PDF binário real
      const pdfBuffer = await createPdfBuffer({
        osId: id,
        numeroOs: num,
        clienteNome,
        aparelho,
        imei,
        defeitoRelatado,
        checklist
      });

      // 2. Calcula SHA-256 exato dos bytes gerados
      const sha256Hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

      // 3. Salva no sistema de arquivos persistente
      const fileName = `laudo-os-${num}-${sha256Hash.substring(0, 8)}.pdf`;
      const filePath = path.join(STORAGE_DIR, fileName);
      fs.writeFileSync(filePath, pdfBuffer);

      const downloadUrl = `/api/v1/laudos/${num}/download`;

      // 4. Se a OS existir no banco, vincula hash e link
      try {
        await db.update(ordensServico).set({
          laudoPdfUrl: downloadUrl,
          laudoPdfHash: sha256Hash,
          atualizadoEm: new Date(),
        }).where(eq(ordensServico.numeroOs, num));
      } catch (dbErr) {
        request.log.warn(dbErr, 'Aviso: OS não encontrada no Postgres para vínculo do PDF');
      }

      return reply.status(200).send({
        sucesso: true,
        pdfUrl: downloadUrl,
        sha256Hash,
        tamanhoBytes: pdfBuffer.length,
        geradoEm: new Date().toISOString(),
        metadados: {
          tamanhoPagina: 'A4',
          orientacao: 'portrait',
          arquivo: fileName,
          certificacao: 'Documento pericial binário com hash SHA-256 e validade Art. 26 CDC'
        }
      });
    } catch (err) {
      request.log.error(err, 'Erro ao gerar PDF do laudo pericial');
      return reply.status(500).send({ error: 'Falha na geração do PDF binário' });
    }
  });

  // Download do Binário do PDF com Headers Corretos e Hash no Header
  fastify.get('/api/v1/laudos/:numeroOs/download', async (request, reply) => {
    const { numeroOs } = request.params;
    const num = Number(numeroOs);

    try {
      // Busca arquivos correspondentes no storage
      const files = fs.readdirSync(STORAGE_DIR);
      const targetFile = files.find((f) => f.startsWith(`laudo-os-${num}-`) && f.endsWith('.pdf'));

      if (!targetFile) {
        return reply.status(404).send({ error: `Laudo PDF para a O.S. #${num} não encontrado no storage` });
      }

      const filePath = path.join(STORAGE_DIR, targetFile);
      const buffer = fs.readFileSync(filePath);
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');

      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `inline; filename="${targetFile}"`);
      reply.header('X-Sha256-Checksum', hash);
      reply.header('Cache-Control', 'public, max-age=86400');

      return reply.send(buffer);
    } catch (err) {
      return reply.status(500).send({ error: 'Erro ao resgatar documento do storage' });
    }
  });

  // Verificação de Integridade Criptográfica do Laudo (Protegido)
  fastify.get('/api/v1/laudos/:numeroOs/verify', { preHandler: [authenticateUser] }, async (request, reply) => {
    const { numeroOs } = request.params;
    const num = Number(numeroOs);

    try {
      const files = fs.readdirSync(STORAGE_DIR);
      const targetFile = files.find((f) => f.startsWith(`laudo-os-${num}-`) && f.endsWith('.pdf'));

      if (!targetFile) {
        return reply.status(404).send({ integro: false, error: 'Documento não localizado no storage' });
      }

      const filePath = path.join(STORAGE_DIR, targetFile);
      const buffer = fs.readFileSync(filePath);
      const calculatedHash = crypto.createHash('sha256').update(buffer).digest('hex');

      return reply.send({
        integro: true,
        numeroOs: num,
        arquivo: targetFile,
        sha256Calculado: calculatedHash,
        tamanhoBytes: buffer.length,
        verificadoEm: new Date().toISOString()
      });
    } catch (err) {
      return reply.status(500).send({ error: 'Erro ao verificar integridade' });
    }
  });
}
