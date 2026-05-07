import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'; i++
      } else { inQuotes = !inQuotes }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else { current += char }
  }
  result.push(current.trim())
  return result
}

async function main() {
  console.log('🌱 Starting master seed...\n')

  // ── 1. Goals ──
  const goalsData = [
    { abbr: 'BF', text: 'Body Fit' },
    { abbr: 'CO', text: 'Comfort' },
    { abbr: 'AW', text: 'Awareness' },
    { abbr: 'UN', text: 'Understanding' },
    { abbr: 'WE', text: 'Wellness' },
    { abbr: 'SP', text: 'Social Integration' },
    { abbr: 'PE', text: 'Personalization' },
    { abbr: 'CA', text: 'Cultural Appropriateness' },
  ]
  for (const goal of goalsData) {
    await prisma.goal.upsert({ where: { abbr: goal.abbr }, update: { text: goal.text }, create: goal })
  }
  console.log('  ✅ 8 Goals seeded')

  // ── 2. Facility Uses ──
  const facilityUsesPath = path.join(process.cwd(), 'data/legacy/Facility_Uses.tsv')
  const facilityUsesContent = fs.readFileSync(facilityUsesPath, 'utf8')
  const tsvLines = facilityUsesContent.split(/\r?\n/).filter(l => l.trim() !== '')
  const tsvHeader = tsvLines[0].split('\t').map(h => h.trim())
  const facilityNames = tsvHeader.slice(10).filter(f => f !== '')

  const facilityIds: string[] = []
  for (const name of facilityNames) {
    const f = await prisma.facilityUse.upsert({ where: { name }, update: {}, create: { name } })
    facilityIds.push(f.id)
  }
  console.log(`  ✅ ${facilityNames.length} Facility Uses seeded`)

  // ── Pre-parse TSV rows for scoring thresholds (keyed by Credit number) ──
  const tsvDataByCredit: Record<string, string[]> = {}
  for (let i = 1; i < tsvLines.length; i++) {
    const cols = tsvLines[i].split('\t')
    const credit = cols[1]?.trim()
    if (credit) tsvDataByCredit[credit] = cols
  }

  // ── 3. Chapters, Sections, SubSections from Headings CSV ──
  const headingsContent = fs.readFileSync(path.join(process.cwd(), 'UD_S_Headings.csv'), 'utf8')
  const headingLines = headingsContent.split(/\r?\n/).filter(l => l.trim() !== '')
  console.log(`  📄 Processing ${headingLines.length - 1} heading rows...`)

  for (let i = 1; i < headingLines.length; i++) {
    const cols = parseCSVLine(headingLines[i])
    if (cols.length < 10) continue

    const hLevel = cols[2]
    const h1Num = cols[3]
    const h1Title = cols[4]
    const h1Credits = parseFloat(cols[5]) || 0
    const h2Num = cols[6]
    const h2Title = cols[7]
    const h2Credits = parseFloat(cols[8]) || 0
    const h3Num = cols[9]
    const h3Title = cols[10]
    const h3Credits = parseFloat(cols[11]) || 0
    const creditNumber = cols[1]

    const sectionCreditNumber = `${h1Num}.${h2Num}`
    const tsvRow = tsvDataByCredit[hLevel === 'H2' ? creditNumber : sectionCreditNumber]
    const min1 = parseInt(tsvRow?.[7]) || 0
    const min2 = parseInt(tsvRow?.[8]) || 0
    const min3 = parseInt(tsvRow?.[9]) || 0
    const detailedInst = cols.length > 21 ? cols[21] : undefined

    const chapter = await prisma.chapter.upsert({
      where: { number: h1Num },
      update: { title: h1Title, totalCredits: h1Credits },
      create: { number: h1Num, title: h1Title, totalCredits: h1Credits }
    })

    if (hLevel === 'H2' || hLevel === 'H3') {
      const section = await prisma.section.upsert({
        where: { chapterId_number: { chapterId: chapter.id, number: h2Num } },
        update: { title: h2Title || '', totalCredits: h2Credits, minPoints1: min1, minPoints2: min2, minPoints3: min3, detailedInstruction: detailedInst },
        create: { number: h2Num, title: h2Title || '', totalCredits: h2Credits, chapterId: chapter.id, minPoints1: min1, minPoints2: min2, minPoints3: min3, detailedInstruction: detailedInst }
      })

      if (hLevel === 'H3') {
        await prisma.subSection.upsert({
          where: { sectionId_number: { sectionId: section.id, number: h3Num } },
          update: { title: h3Title, totalCredits: h3Credits },
          create: { number: h3Num, title: h3Title, totalCredits: h3Credits, sectionId: section.id }
        })
      }
    }
  }
  console.log('  ✅ Base Chapters/Sections from Headings CSV seeded')

  // ── 4. Solutions from Solutions CSV ──
  // This also creates any missing Chapters/Sections/SubSections referenced
  // by the solutions but not present in the (incomplete) headings CSV.
  const solutionsContent = fs.readFileSync(path.join(process.cwd(), 'UD_S_Solutions.csv'), 'utf8')
  const solLines = solutionsContent.split(/\r?\n/).filter(l => l.trim() !== '')
  console.log(`  📄 Processing ${solLines.length - 1} solution rows...`)

  const goalLookup = [
    { name: 'Body Fit', abbr: 'BF' }, { name: 'Comfort', abbr: 'CO' },
    { name: 'Awareness', abbr: 'AW' }, { name: 'Understanding', abbr: 'UN' },
    { name: 'Wellness', abbr: 'WE' }, { name: 'Social Integration', abbr: 'SP' },
    { name: 'Personalization', abbr: 'PE' }, { name: 'Cultural Appropriateness', abbr: 'CA' }
  ]
  const phaseLookup = [
    'Initiate', 'Schematic Design', 'Design Development',
    'Construction Documents', 'Specifications', 'Contract Administration', 'Operations'
  ]

  let successCount = 0

  for (let i = 1; i < solLines.length; i++) {
    try {
      const cols = parseCSVLine(solLines[i])
      if (cols.length < 15) continue

      const standardNum = cols[2]
      const refId = cols[1]
      const h1Num = cols[4]     // H1#
      const h1Title = cols[5]   // H1_Ch_Title
      const h1Credits = parseFloat(cols[6]) || 0
      const h2Num = cols[7]     // H2#
      const h2Title = cols[8]   // H2_Sec_Title
      const h2Credits = parseFloat(cols[9]) || 0
      const h3Num = cols[10]    // H3#
      const h3Title = cols[11]  // H3_Sec_Title
      const h3Credits = parseFloat(cols[12]) || 0
      const creditNumber = `${h1Num}.${h2Num}`
      const text = cols[14]
      const goalsStr = cols[16] || ''
      const phasesStr = cols[17] || ''
      const points = parseFloat(cols[18]) || 0
      const instruction = cols[20] || ''
      const isMandatory = cols[15] === 'Required' || cols[15] === 'Prerequisite'

      if (!standardNum) continue

      // Ensure Chapter exists (auto-create from solution row data)
      const chapter = await prisma.chapter.upsert({
        where: { number: h1Num },
        update: {},
        create: { number: h1Num, title: h1Title, totalCredits: h1Credits }
      })

      // Ensure Section exists (auto-create from solution row data)
      const tsvRow = tsvDataByCredit[creditNumber]
      const min1 = parseInt(tsvRow?.[7]) || 0
      const min2 = parseInt(tsvRow?.[8]) || 0
      const min3 = parseInt(tsvRow?.[9]) || 0

      const section = await prisma.section.upsert({
        where: { chapterId_number: { chapterId: chapter.id, number: h2Num } },
        update: {
          minPoints1: min1,
          minPoints2: min2,
          minPoints3: min3,
        },
        create: {
          number: h2Num, title: h2Title || '', totalCredits: h2Credits,
          chapterId: chapter.id, minPoints1: min1, minPoints2: min2, minPoints3: min3
        }
      })

      // Ensure SubSection exists if applicable
      let subId: string | null = null
      if (h3Num && h3Num !== '0' && h3Title) {
        const sub = await prisma.subSection.upsert({
          where: { sectionId_number: { sectionId: section.id, number: h3Num } },
          update: {},
          create: { number: h3Num, title: h3Title, totalCredits: h3Credits, sectionId: section.id }
        })
        subId = sub.id
      }

      // Match goals by full name
      const goalConnect = goalLookup.filter(g => goalsStr.includes(g.name)).map(g => ({ abbr: g.abbr }))

      // Match phases by full name
      const matchedPhases = phaseLookup.filter(p => phasesStr.includes(p))

      const solution = await prisma.solution.upsert({
        where: { standardNumber: standardNum },
        update: {
          text, points, instruction, isMandatory,
          sectionId: section.id, subSectionId: subId,
          goals: { set: goalConnect }
        },
        create: {
          refId, standardNumber: standardNum, text, points, instruction, isMandatory,
          sectionId: section.id, subSectionId: subId,
          goals: { connect: goalConnect }
        }
      })

      // Figures (A through D)
      const figCfg = [
        { label: 'FigA', noIdx: 21, capIdx: 22, altIdx: 23 },
        { label: 'FigB', noIdx: 25, capIdx: 26, altIdx: 27 },
        { label: 'FigC', noIdx: 29, capIdx: 30, altIdx: 31 },
        { label: 'FigD', noIdx: 33, capIdx: 34, altIdx: 35 },
      ]
      for (const fig of figCfg) {
        const no = cols[fig.noIdx] || ''
        const cap = cols[fig.capIdx] || ''
        const alt = cols[fig.altIdx] || ''
        if (no || cap) {
          await prisma.figure.create({
            data: { solutionId: solution.id, label: fig.label, number: no, caption: cap, altTag: alt }
          })
        }
      }

      // Phases (many-to-many)
      for (const phaseName of matchedPhases) {
        await prisma.phase.upsert({
          where: { name: phaseName },
          update: { solutions: { connect: { id: solution.id } } },
          create: { name: phaseName, solutions: { connect: { id: solution.id } } }
        })
      }

      successCount++
    } catch (err: any) {
      console.error(`  ❌ Row ${i}: ${err.message?.slice(0, 120)}`)
    }
  }
  console.log(`  ✅ ${successCount} Solutions seeded`)

  // ── 5. Connect ALL sections to ALL facility types ──
  // The TSV has 40 facility headers but the mapping data (x markers) was
  // not exported from the legacy DB. Universal mapping as default.
  const allSections = await prisma.section.findMany({ select: { id: true } })
  for (const sec of allSections) {
    await prisma.section.update({
      where: { id: sec.id },
      data: { facilityUses: { connect: facilityIds.map(id => ({ id })) } }
    })
  }
  console.log(`  ✅ ${allSections.length} Sections → ${facilityIds.length} Facility Uses mapped`)

  // ── Summary ──
  const counts = {
    chapters: await prisma.chapter.count(),
    sections: await prisma.section.count(),
    subSections: await prisma.subSection.count(),
    solutions: await prisma.solution.count(),
    goals: await prisma.goal.count(),
    phases: await prisma.phase.count(),
    facilities: await prisma.facilityUse.count(),
  }
  console.log('\n📊 Final Database Summary:')
  console.log(`   Chapters: ${counts.chapters}`)
  console.log(`   Sections: ${counts.sections}`)
  console.log(`   SubSections: ${counts.subSections}`)
  console.log(`   Solutions: ${counts.solutions}`)
  console.log(`   Goals: ${counts.goals}`)
  console.log(`   Phases: ${counts.phases}`)
  console.log(`   Facility Uses: ${counts.facilities}`)
  console.log('\n✨ Master seed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
