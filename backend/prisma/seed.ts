import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('123456', 10);

  const usuario = await prisma.usuario.upsert({
    where: { email: 'aluno@tcc.com' },
    update: {},
    create: {
      nome: 'Usuario TCC',
      email: 'aluno@tcc.com',
      senhaHash,
    },
  });

  const veiculo = await prisma.veiculo.upsert({
    where: { placa: 'ABC1D23' },
    update: {},
    create: {
      usuarioId: usuario.id,
      placa: 'ABC1D23',
      chassi: '9BWZZZ377VT004251',
      marca: 'Volkswagen',
      modelo: 'Gol',
      ano: 2018,
    },
  });

  await prisma.dispositivo.upsert({
    where: { codigoDispositivo: 'ESP32-TCC-001' },
    update: {},
    create: {
      veiculoId: veiculo.id,
      codigoDispositivo: 'ESP32-TCC-001',
    },
  });

  await prisma.configuracaoVeiculo.upsert({
    where: { veiculoId: veiculo.id },
    update: {},
    create: { veiculoId: veiculo.id },
  });

  console.log({
    usuario: {
      email: usuario.email,
      senha: '123456',
    },
    codigoDispositivo: 'ESP32-TCC-001',
    veiculoId: veiculo.id,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
