const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const vendorNames = [
  'Green Valley Farm', 'Urban Harvest', 'City Greens', 'Rooftop Gardens',
  'Fresh Fields', 'Organic Oasis', 'Eco Farms', 'Sustainable Harvest',
  'Local Roots', 'Pure Produce'
];

const productNames = [
  'Organic Tomatoes', 'Fresh Lettuce', 'Bell Peppers', 'Cucumbers',
  'Carrots', 'Spinach', 'Kale', 'Broccoli', 'Cauliflower', 'Eggplant',
  'Organic Basil', 'Fresh Mint', 'Rosemary', 'Thyme', 'Cilantro',
  'Strawberries', 'Blueberries', 'Raspberries', 'Blackberries',
  'Organic Apple', 'Fresh Orange', 'Organic Lemon', 'Fresh Mango'
];

const categories = ['vegetables', 'fruits', 'herbs', 'seeds'];

const postTitles = [
  'Tips for urban gardening', 'Best organic fertilizers', 'How to start a rooftop garden',
  'Composting 101', 'Pest control naturally', 'Seasonal planting guide',
  'Water conservation techniques', 'Beneficial insects for your garden'
];

const plantTypes = ['Tomato', 'Basil', 'Lettuce', 'Pepper', 'Strawberry'];

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.plantTracking.deleteMany();
    await prisma.order.deleteMany();
    await prisma.communityPost.deleteMany();
    await prisma.sustainabilityCert.deleteMany();
    await prisma.produce.deleteMany();
    await prisma.rentalSpace.deleteMany();
    await prisma.vendorProfile.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✓ Cleared existing data');
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        status: 'active'
      }
    });
    console.log(`✓ Created admin: ${admin.email}`);
    
    // Create 10 vendors
    console.log('\nCreating 10 vendors...');
    const vendors = [];
    for (let i = 0; i < 10; i++) {
      const vendor = await prisma.user.create({
        data: {
          name: vendorNames[i],
          email: `vendor${i+1}@example.com`,
          password: await bcrypt.hash('vendor123', 10),
          role: 'vendor',
          status: 'active'
        }
      });
      
      const vendorProfile = await prisma.vendorProfile.create({
        data: {
          userId: vendor.id,
          farmName: vendorNames[i],
          farmDescription: `${vendorNames[i]} is a sustainable urban farm providing fresh organic produce.`,
          certificationStatus: i < 5 ? 'verified' : 'pending',
          rating: Math.floor(Math.random() * 5) + 1
        }
      });
      
      vendors.push({ user: vendor, profile: vendorProfile });
    }
    console.log(`✓ Created ${vendors.length} vendors`);
    
    // Create 5 customers
    console.log('\nCreating customers...');
    const customers = [];
    for (let i = 0; i < 5; i++) {
      const customer = await prisma.user.create({
        data: {
          name: `Customer ${i+1}`,
          email: `customer${i+1}@example.com`,
          password: await bcrypt.hash('customer123', 10),
          role: 'customer',
          status: 'active'
        }
      });
      customers.push(customer);
    }
    console.log(`✓ Created ${customers.length} customers`);
    
    // Create 100+ products
    console.log('\nCreating 100+ products...');
    let productCount = 0;
    for (let i = 0; i < vendors.length; i++) {
      const vendor = vendors[i];
      const numProducts = i === 0 ? 15 : Math.floor(Math.random() * 12) + 5;
      
      for (let j = 0; j < numProducts; j++) {
        const productName = productNames[Math.floor(Math.random() * productNames.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const price = Math.floor(Math.random() * 300) + 50;
        const quantity = Math.floor(Math.random() * 100) + 10;
        
        await prisma.produce.create({
          data: {
            vendorId: vendor.profile.id,
            name: `${productName} #${j+1}`,
            description: `Fresh ${productName.toLowerCase()} grown locally with sustainable practices.`,
            price: price,
            category: category,
            certificationStatus: vendor.profile.certificationStatus,
            availableQuantity: quantity,
            isAvailable: true
          }
        });
        productCount++;
      }
    }
    console.log(`✓ Created ${productCount} products`);
    
    // Create rental spaces
    console.log('\nCreating rental spaces...');
    for (let i = 0; i < vendors.length; i++) {
      const vendor = vendors[i];
      await prisma.rentalSpace.create({
        data: {
          vendorId: vendor.profile.id,
          name: `${vendor.profile.farmName} Garden Plot`,
          size: Math.floor(Math.random() * 100) + 20,
          price: Math.floor(Math.random() * 500) + 100,
          isAvailable: true
        }
      });
    }
    console.log(`✓ Created ${vendors.length} rental spaces`);
    
    // Create community posts
    console.log('\nCreating community posts...');
    for (let i = 0; i < 20; i++) {
      await prisma.communityPost.create({
        data: {
          userId: customers[i % customers.length].id,
          title: postTitles[Math.floor(Math.random() * postTitles.length)],
          content: `This is a detailed post about urban farming. Here are valuable insights for fellow farmers.`,
          category: ['gardening_tips', 'urban_farming', 'sustainability'][Math.floor(Math.random() * 3)],
          likes: Math.floor(Math.random() * 50)
        }
      });
    }
    console.log('✓ Created 20 community posts');

    console.log('\n⚠️ Skipping certifications (will add later)');
    
    // Create plant tracking
    console.log('\nCreating plant tracking entries...');
    let plantCount = 0;
    for (let i = 0; i < customers.length; i++) {
      for (let j = 0; j < 3; j++) {
        await prisma.plantTracking.create({
          data: {
            userId: customers[i].id,
            plantName: plantTypes[j],
            plantType: ['vegetable', 'herb', 'vegetable', 'vegetable', 'fruit'][j],
            plantingDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            healthStatus: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)],
            growthStage: ['seed', 'vegetative', 'flowering'][Math.floor(Math.random() * 3)]
          }
        });
        plantCount++;
      }
    }
    console.log(`✓ Created ${plantCount} plant tracking entries`);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ DATABASE SEEDING COMPLETED!');
    console.log('='.repeat(50));
    
    console.log('\n📊 Summary:');
    console.log(`  ✓ 1 Admin, ${vendors.length} Vendors, ${customers.length} Customers`);
    console.log(`  ✓ ${productCount} Products`);
    console.log(`  ✓ ${vendors.length} Rental Spaces`);
    console.log(`  ✓ 20 Community Posts, ${plantCount} Plant Entries`);
    console.log(`  ⚠️ Certifications skipped`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('  Admin: admin@example.com / admin123');
    console.log('  Vendor: vendor1@example.com / vendor123');
    console.log('  Customer: customer1@example.com / customer123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();