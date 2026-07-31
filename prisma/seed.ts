import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Product', color: '#3b82f6' } }),
    prisma.tag.create({ data: { name: 'Engineering', color: '#10b981' } }),
    prisma.tag.create({ data: { name: 'Design', color: '#8b5cf6' } }),
    prisma.tag.create({ data: { name: 'Business', color: '#f59e0b' } }),
  ])

  // Create ideas
  const ideas = await Promise.all([
    prisma.idea.create({
      data: {
        title: 'Mindmap Visualization',
        description: 'Interactive node-based graph for idea visualization',
        content: 'Use React Flow for the mindmap component. Support drag, zoom, pan, and node connections.',
        tags: { connect: [{ id: tags[1].id }, { id: tags[2].id }] },
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Custom API Design',
        description: 'RESTful API for idea management',
        content: 'Design clean REST endpoints for CRUD operations on ideas, connections, and tags.',
        tags: { connect: [{ id: tags[1].id }] },
      },
    }),
    prisma.idea.create({
      data: {
        title: 'AI Idea Expansion',
        description: 'Use AI to expand ideas into sub-concepts',
        content: 'Integrate OpenAI or Claude API to generate related sub-ideas from a parent idea.',
        tags: { connect: [{ id: tags[0].id }, { id: tags[1].id }] },
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Export Features',
        description: 'Export mindmap as PNG, PDF, or JSON',
        content: 'Allow users to download their mindmap in multiple formats for sharing and backup.',
        tags: { connect: [{ id: tags[0].id }] },
      },
    }),
  ])

  // Create connections
  await Promise.all([
    prisma.connection.create({
      data: {
        sourceId: ideas[0].id,
        targetId: ideas[1].id,
        relationship: 'related',
      },
    }),
    prisma.connection.create({
      data: {
        sourceId: ideas[0].id,
        targetId: ideas[2].id,
        relationship: 'related',
      },
    }),
    prisma.connection.create({
      data: {
        sourceId: ideas[0].id,
        targetId: ideas[3].id,
        relationship: 'related',
      },
    }),
    prisma.connection.create({
      data: {
        sourceId: ideas[1].id,
        targetId: ideas[2].id,
        relationship: 'inspires',
      },
    }),
  ])

  console.log('✅ Seeded:')
  console.log(`   - ${tags.length} tags`)
  console.log(`   - ${ideas.length} ideas`)
  console.log(`   - 4 connections`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
