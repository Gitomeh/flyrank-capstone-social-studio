import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean existing data
  await prisma.publishAttempt.deleteMany();
  await prisma.mockPost.deleteMany();
  await prisma.socialVariant.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.blogPost.deleteMany();

  console.log('Cleaned existing data');

  // Create a sample blog post
  const blogPost = await prisma.blogPost.create({
    data: {
      title: 'The Future of Backend Development',
      body: `Backend development is evolving rapidly. With the rise of serverless architectures, microservices, and modern ORMs, developers have more tools than ever to build scalable and maintainable systems.

In this article, we explore the key trends shaping backend development in 2024 and beyond. From event-driven architectures to the importance of idempotency in distributed systems, there's a lot to consider when designing robust APIs.

One of the most critical aspects is ensuring your systems can handle failures gracefully. This means implementing proper retry logic, circuit breakers, and understanding the CAP theorem.`,
      url: 'https://example.com/future-of-backend',
    },
  });

  console.log('Created blog post:', blogPost.id);

  // Create a campaign
  const campaign = await prisma.campaign.create({
    data: {
      postId: blogPost.id,
      status: 'active',
    },
  });

  console.log('Created campaign:', campaign.id);

  // Create variants
  const telegramVariant = await prisma.socialVariant.create({
    data: {
      campaignId: campaign.id,
      platform: 'telegram',
      content: `The Future of Backend Development

Backend development is evolving rapidly. With the rise of serverless architectures, microservices, and modern ORMs, developers have more tools than ever to build scalable and maintainable systems.

#backend`,
      status: 'approved',
    },
  });

  console.log('Created telegram variant:', telegramVariant.id);

  const xVariant = await prisma.socialVariant.create({
    data: {
      campaignId: campaign.id,
      platform: 'x',
      content: `The Future of Backend Development: Backend development is evolving rapidly. With the rise of serverless architectures, microservices, and modern ORMs, developers have more tools than ever... #backend`,
      status: 'draft',
    },
  });

  console.log('Created X variant:', xVariant.id);

  const linkedinVariant = await prisma.socialVariant.create({
    data: {
      campaignId: campaign.id,
      platform: 'linkedin',
      content: `📝 The Future of Backend Development

Backend development is evolving rapidly. With the rise of serverless architectures, microservices, and modern ORMs, developers have more tools than ever to build scalable and maintainable systems.

In this article, we explore the key trends shaping backend development in 2024 and beyond...

What are your thoughts? 👇

#backend #insights #professional`,
      status: 'rejected',
    },
  });

  console.log('Created LinkedIn variant:', linkedinVariant.id);

  // Create a scheduled variant (different campaign)
  const campaign2 = await prisma.campaign.create({
    data: {
      postId: blogPost.id,
      status: 'active',
    },
  });

  const scheduledVariant = await prisma.socialVariant.create({
    data: {
      campaignId: campaign2.id,
      platform: 'telegram',
      content: `Sample scheduled content for testing`,
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes in future
    },
  });

  console.log('Created scheduled variant:', scheduledVariant.id);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
