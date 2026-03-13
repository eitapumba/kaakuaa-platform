import { DataSource } from 'typeorm';
import { User } from '../../modules/users/user.entity';
import { Product } from '../../modules/marketplace/product.entity';
import { UserRole, UserRank, ProductCategory } from '../../common/types';
import * as bcrypt from 'bcrypt';

export async function seed(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const productRepo = dataSource.getRepository(Product);

  // Admin user
  const adminExists = await userRepo.findOne({ where: { email: 'admin@kaakuaa.com' } });
  if (!adminExists) {
    await userRepo.save(userRepo.create({
      email: 'admin@kaakuaa.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      displayName: 'Kaa Kuaa Admin',
      role: UserRole.ADMIN,
      rank: UserRank.FUNDADOR,
      isVerified: true,
    }));
    console.log('✅ Admin user created');
  }

  // Sample products
  const productsExist = await productRepo.count();
  if (productsExist === 0) {
    const sampleProducts = [
      {
        name: 'Guaraná Ancestral 350ml',
        description: 'Refrigerante natural de guaraná com ervas ancestrais',
        category: ProductCategory.BEVERAGE,
        priceReal: 12.90,
        priceVita: 50,
        stockQuantity: 1000,
        isAvailable: true,
      },
      {
        name: 'Energético Natural Kaa Kuaa',
        description: 'Energia da floresta em cada gole. Sem açúcar refinado.',
        category: ProductCategory.BEVERAGE,
        priceReal: 15.90,
        priceVita: 65,
        stockQuantity: 500,
        isAvailable: true,
      },
      {
        name: 'Pasta Dental Natural',
        description: 'Pasta de dente com ingredientes 100% naturais',
        category: ProductCategory.PHARMACY,
        priceReal: 24.90,
        priceVita: 100,
        stockQuantity: 200,
        isAvailable: true,
      },
      {
        name: 'Retiro Regeneração — 3 dias',
        description: 'Experiência imersiva de reconexão com a natureza na EcoVila Kaa Kuaa',
        category: ProductCategory.EXPERIENCE,
        priceReal: 1500.00,
        priceVita: 5000,
        location: 'EcoVila Kaa Kuaa — Florianópolis',
        durationMinutes: 4320,
        maxCapacity: 20,
        isAvailable: true,
      },
      {
        name: 'Plano Guerreiro — Mensal',
        description: 'Acesso a desafios premium, marketplace exclusivo e comunidade fechada',
        category: ProductCategory.SUBSCRIPTION,
        priceReal: 49.90,
        billingCycleDays: 30,
        isAvailable: true,
      },
    ];

    for (const p of sampleProducts) {
      await productRepo.save(productRepo.create(p));
    }
    console.log(`✅ ${sampleProducts.length} sample products created`);
  }

  console.log('🌿 Seed complete!');
}
