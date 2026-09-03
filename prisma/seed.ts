import { PrismaClient, RoleCode, GradeLevel, ContentStatus, ContentType, QuestionType, DifficultyLevel, CognitiveLevel, UserStatus, SchoolBundleCode, SchoolSubscriptionStatus, SubscriptionBillingCycle } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CDC_COMPULSORY_CATALOG } from "../lib/constants/cdc-compulsory-catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting AI Learning Nepal database seed...");

  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error("Demo seeding is disabled in production. Set ALLOW_DEMO_SEED=true explicitly to proceed.");
  }

  // 1. Create System Roles
  const rolesData: { code: RoleCode; name: string; description: string }[] = [
    { code: RoleCode.SUPER_ADMIN, name: "Super Admin", description: "Full system administration and platform governance." },
    { code: RoleCode.SCHOOL_ADMIN, name: "School Admin", description: "School tenant management, teacher allocation, and student roster." },
    { code: RoleCode.TEACHER, name: "Teacher", description: "Classroom teaching, exam paper generation, and student grading." },
    { code: RoleCode.STUDENT, name: "Student", description: "Curriculum learning, AI tutoring, adaptive quizzes, and practice." },
    { code: RoleCode.PARENT, name: "Parent", description: "Guardian tracking child mastery and weekly study progress." },
  ];

  const rolesMap: Record<string, string> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, description: r.description },
      create: r,
    });
    rolesMap[r.code] = role.id;
  }
  console.log("✅ Seeded 5 active RBAC roles");

  // 2. Create Permissions
  const permissionsData = [
    { code: "curriculum:view", name: "View Curriculum", module: "curriculum" },
    { code: "curriculum:create", name: "Create Curriculum", module: "curriculum" },
    { code: "curriculum:review", name: "Review Curriculum", module: "curriculum" },
    { code: "curriculum:publish", name: "Publish Curriculum", module: "curriculum" },
    { code: "exam:generate", name: "Generate Exam Papers", module: "exam" },
    { code: "users:manage", name: "Manage Users", module: "users" },
    { code: "schools:manage", name: "Manage Schools", module: "schools" },
    { code: "ai:configure", name: "Configure AI Providers", module: "ai" },
  ];

  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { name: p.name, module: p.module },
      create: p,
    });
  }
  console.log("✅ Seeded Granular Permissions");

  // 3. Create Seed Users
  const demoPassword = process.env.SEED_DEMO_PASSWORD ?? (process.env.NODE_ENV === "production" ? "" : "password123");
  if (demoPassword.length < 8) {
    throw new Error("SEED_DEMO_PASSWORD must contain at least 8 characters.");
  }
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const usersToSeed = [
    { email: "admin@ailearning.np", name: "Super Administrator", role: RoleCode.SUPER_ADMIN },
    { email: "principal@demo.np", name: "Ramesh Adhikari (Principal)", role: RoleCode.SCHOOL_ADMIN },
    { email: "teacher@demo.np", name: "Sunita Thapa (Math & Science Teacher)", role: RoleCode.TEACHER },
    { email: "student@demo.np", name: "Aayush Sharma", role: RoleCode.STUDENT },
    { email: "parent@demo.np", name: "Bikash Sharma (Guardian)", role: RoleCode.PARENT },
  ];

  const seededUsers: Record<string, string> = {};
  for (const u of usersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, passwordHash, status: UserStatus.ACTIVE },
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        status: UserStatus.ACTIVE,
        preferredLanguage: "bilingual",
      },
    });
    seededUsers[u.email] = user.id;

    // Assign Role
    const existingRole = await prisma.userRole.findFirst({
      where: { userId: user.id, roleId: rolesMap[u.role], schoolId: null },
    });
    if (!existingRole) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: rolesMap[u.role], schoolId: null },
      });
    }
  }
  console.log("✅ Seeded Development Users with Role-Based Access");

  // 4. Create Multi-Tenant School Infrastructure
  const org = await prisma.organization.upsert({
    where: { code: "NMEN_ORG" },
    update: {},
    create: {
      name: "Nepal Model Education Network",
      code: "NMEN_ORG",
      status: UserStatus.ACTIVE,
    },
  });

  const school = await prisma.school.upsert({
    where: { code: "SSVN_LALITPUR" },
    update: { iemisCode: "270104001" },
    create: {
      organizationId: org.id,
      name: "Shree Shanti Vidya Niketan",
      code: "SSVN_LALITPUR",
      iemisCode: "270104001",
      address: "Patan, Ward 4",
      district: "Lalitpur",
      province: "Bagmati Province",
      email: "info@shantividya.edu.np",
      phone: "+977-1-5523456",
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.schoolSubscription.upsert({
    where: { schoolId: school.id },
    update: {
      bundleCode: SchoolBundleCode.FULL_SCHOOL_AI,
      status: SchoolSubscriptionStatus.ACTIVE,
    },
    create: {
      schoolId: school.id,
      bundleCode: SchoolBundleCode.FULL_SCHOOL_AI,
      status: SchoolSubscriptionStatus.ACTIVE,
      billingCycle: SubscriptionBillingCycle.ANNUAL,
      source: "DEVELOPMENT_SEED",
      endsAt: new Date("2030-04-13"),
    },
  });

  const schoolScopedUsers: Array<[string, RoleCode]> = [
    ["principal@demo.np", RoleCode.SCHOOL_ADMIN],
    ["teacher@demo.np", RoleCode.TEACHER],
    ["student@demo.np", RoleCode.STUDENT],
    ["parent@demo.np", RoleCode.PARENT],
  ];
  for (const [email, roleCode] of schoolScopedUsers) {
    const existingAssignment = await prisma.userRole.findFirst({
      where: { userId: seededUsers[email], roleId: rolesMap[roleCode], schoolId: school.id },
    });
    if (!existingAssignment) {
      await prisma.userRole.create({
        data: { userId: seededUsers[email], roleId: rolesMap[roleCode], schoolId: school.id },
      });
    }
  }

  const academicYear = await prisma.academicYear.upsert({
    where: {
      schoolId_name: {
        schoolId: school.id,
        name: "2081/2082",
      },
    },
    update: { isCurrent: true },
    create: {
      schoolId: school.id,
      name: "2081/2082",
      startDate: new Date("2024-04-14"),
      endDate: new Date("2025-04-13"),
      isCurrent: true,
    },
  });
  console.log("✅ Seeded Multi-Tenant School & Academic Year 2081/2082");

  // 5. Create Nepal CDC Curriculum & Version
  const curriculum = await prisma.curriculum.upsert({
    where: { id: "cdc-nepal-core" },
    update: {},
    create: {
      id: "cdc-nepal-core",
      name: "Nepal National CDC Curriculum",
      countryCode: "NP",
      description: "Official Curriculum Framework designed by the Curriculum Development Centre (CDC), Sanothimi, Bhaktapur.",
    },
  });

  const curriculumVersion = await prisma.curriculumVersion.upsert({
    where: {
      curriculumId_versionCode: {
        curriculumId: curriculum.id,
        versionCode: "2081_REVISED",
      },
    },
    update: { status: ContentStatus.PUBLISHED },
    create: {
      curriculumId: curriculum.id,
      versionCode: "2081_REVISED",
      name: "CDC National Curriculum Framework 2081/2082",
      effectiveFrom: new Date("2024-04-14"),
      status: ContentStatus.PUBLISHED,
      notes: "Integrated competency-based syllabus with BLE and SEE specification grids.",
    },
  });
  console.log("✅ Seeded CDC Curriculum Framework 2081/2082");

  // 6. Seed All 15 Grades (Nursery to Class 12)
  const gradesList = [
    { code: "nursery", name: "Nursery", nameNepali: "नर्सरी", level: GradeLevel.PRE_PRIMARY, order: 1 },
    { code: "lkg", name: "LKG", nameNepali: "एल.के.जी.", level: GradeLevel.PRE_PRIMARY, order: 2 },
    { code: "ukg", name: "UKG", nameNepali: "यु.के.जी.", level: GradeLevel.PRE_PRIMARY, order: 3 },
    { code: "class-1", name: "Class 1", nameNepali: "कक्षा १", level: GradeLevel.PRIMARY, order: 4 },
    { code: "class-2", name: "Class 2", nameNepali: "कक्षा २", level: GradeLevel.PRIMARY, order: 5 },
    { code: "class-3", name: "Class 3", nameNepali: "कक्षा ३", level: GradeLevel.PRIMARY, order: 6 },
    { code: "class-4", name: "Class 4", nameNepali: "कक्षा ४", level: GradeLevel.PRIMARY, order: 7 },
    { code: "class-5", name: "Class 5", nameNepali: "कक्षा ५", level: GradeLevel.PRIMARY, order: 8 },
    { code: "class-6", name: "Class 6", nameNepali: "कक्षा ६", level: GradeLevel.LOWER_SECONDARY, order: 9 },
    { code: "class-7", name: "Class 7", nameNepali: "कक्षा ७", level: GradeLevel.LOWER_SECONDARY, order: 10 },
    { code: "class-8", name: "Class 8", nameNepali: "कक्षा ८", level: GradeLevel.LOWER_SECONDARY, order: 11 },
    { code: "class-9", name: "Class 9", nameNepali: "कक्षा ९", level: GradeLevel.SECONDARY, order: 12 },
    { code: "class-10", name: "Class 10", nameNepali: "कक्षा १०", level: GradeLevel.SECONDARY, order: 13 },
    { code: "class-11", name: "Class 11", nameNepali: "कक्षा ११", level: GradeLevel.HIGHER_SECONDARY, order: 14 },
    { code: "class-12", name: "Class 12", nameNepali: "कक्षा १२", level: GradeLevel.HIGHER_SECONDARY, order: 15 },
  ];

  const gradesMap: Record<string, string> = {};
  for (const g of gradesList) {
    const grade = await prisma.grade.upsert({
      where: {
        curriculumVersionId_code: {
          curriculumVersionId: curriculumVersion.id,
          code: g.code,
        },
      },
      update: { name: g.name, nameNepali: g.nameNepali, level: g.level, orderIndex: g.order },
      create: {
        curriculumVersionId: curriculumVersion.id,
        code: g.code,
        name: g.name,
        nameNepali: g.nameNepali,
        level: g.level,
        orderIndex: g.order,
      },
    });
    gradesMap[g.code] = grade.id;
  }
  console.log("✅ Seeded All 15 Nepal CDC Grades (Nursery to Class 12)");

  // 7. Seed the Class 1-12 compulsory curriculum framework catalog.
  // Chapter titles are an editable framework scaffold; Super Admins publish the full
  // reviewed chapter/topic text and official page references through Curriculum Retrieval.
  for (const gradeCatalog of CDC_COMPULSORY_CATALOG) {
    const gradeId = gradesMap[gradeCatalog.code];
    for (const [subjectIndex, subjectCatalog] of gradeCatalog.subjects.entries()) {
      const subject = await prisma.subject.upsert({
        where: { gradeId_code: { gradeId, code: subjectCatalog.code } },
        update: {
          name: subjectCatalog.name,
          nameNepali: subjectCatalog.nameNepali,
          orderIndex: subjectIndex + 1,
        },
        create: {
          gradeId,
          code: subjectCatalog.code,
          name: subjectCatalog.name,
          nameNepali: subjectCatalog.nameNepali,
          orderIndex: subjectIndex + 1,
        },
      });
      for (const [chapterIndex, chapterTitle] of subjectCatalog.chapters.entries()) {
        const unitNumber = chapterIndex + 1;
        const unit = await prisma.unit.upsert({
          where: { subjectId_unitNumber: { subjectId: subject.id, unitNumber } },
          update: { title: chapterTitle, orderIndex: unitNumber },
          create: {
            subjectId: subject.id,
            unitNumber,
            title: chapterTitle,
            titleNepali: chapterTitle,
            description: `${gradeCatalog.name} ${subjectCatalog.name}: ${chapterTitle}`,
            orderIndex: unitNumber,
          },
        });
        await prisma.chapter.upsert({
          where: { unitId_chapterNumber: { unitId: unit.id, chapterNumber: unitNumber } },
          update: { title: chapterTitle, orderIndex: unitNumber },
          create: {
            unitId: unit.id,
            chapterNumber: unitNumber,
            title: chapterTitle,
            titleNepali: chapterTitle,
            summary: `Editable CDC framework scaffold. Import and publish reviewed chapter content before using strict curriculum grounding. Source: ${gradeCatalog.sourceTitle}.`,
            orderIndex: unitNumber,
          },
        });
      }
    }
  }
  console.log("✅ Seeded Class 1-12 compulsory subjects and editable chapter framework catalog");

  // 8. Seed School Class, Section, and Student Enrollment for Class 8
  const schoolClass = await prisma.schoolClass.upsert({
    where: {
      schoolId_academicYearId_gradeId: {
        schoolId: school.id,
        academicYearId: academicYear.id,
        gradeId: gradesMap["class-8"],
      },
    },
    update: {},
    create: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      gradeId: gradesMap["class-8"],
      name: "Class 8",
    },
  });

  const section = await prisma.section.upsert({
    where: {
      schoolClassId_name: {
        schoolClassId: schoolClass.id,
        name: "Section A (Sagarmatha)",
      },
    },
    update: {},
    create: {
      schoolClassId: schoolClass.id,
      name: "Section A (Sagarmatha)",
      capacity: 40,
    },
  });

  await prisma.enrollment.upsert({
    where: {
      studentId_schoolId_academicYearId: {
        studentId: seededUsers["student@demo.np"],
        schoolId: school.id,
        academicYearId: academicYear.id,
      },
    },
    update: { rollNumber: 12 },
    create: {
      studentId: seededUsers["student@demo.np"],
      schoolId: school.id,
      academicYearId: academicYear.id,
      schoolClassId: schoolClass.id,
      sectionId: section.id,
      rollNumber: 12,
    },
  });
  console.log("✅ Enrolled Student in Class 8 Section A");

  // 8. Seed Class 8 Core Subjects
  const class8Subjects = [
    { code: "MTH-801", name: "Compulsory Mathematics", nameNepali: "अनिवार्य गणित", credit: 5, order: 1 },
    { code: "SCI-802", name: "Science & Technology", nameNepali: "विज्ञान तथा प्रविधि", credit: 5, order: 2 },
    { code: "ENG-803", name: "English", nameNepali: "अंग्रेजी", credit: 4, order: 3 },
    { code: "NEP-804", name: "Nepali", nameNepali: "नेपाली", credit: 4, order: 4 },
    { code: "SOC-805", name: "Social Studies & Human Values", nameNepali: "सामाजिक अध्ययन तथा मानव मूल्य", credit: 4, order: 5 },
  ];

  const subjectsMap: Record<string, string> = {};
  for (const s of class8Subjects) {
    const subj = await prisma.subject.upsert({
      where: {
        gradeId_code: {
          gradeId: gradesMap["class-8"],
          code: s.code,
        },
      },
      update: { name: s.name, nameNepali: s.nameNepali, creditHours: s.credit, orderIndex: s.order },
      create: {
        gradeId: gradesMap["class-8"],
        code: s.code,
        name: s.name,
        nameNepali: s.nameNepali,
        creditHours: s.credit,
        orderIndex: s.order,
      },
    });
    subjectsMap[s.code] = subj.id;
  }
  console.log("✅ Seeded 5 Core Class 8 Subjects");

  // 9. Detailed Seed for Class 8 Mathematics (Sets, Arithmetic, Algebra)
  const mathSubjectId = subjectsMap["MTH-801"];

  // Unit 1: Sets
  const mathUnit1 = await prisma.unit.upsert({
    where: { subjectId_unitNumber: { subjectId: mathSubjectId, unitNumber: 1 } },
    update: {},
    create: {
      subjectId: mathSubjectId,
      unitNumber: 1,
      title: "Sets",
      titleNepali: "समुह",
      description: "Cardinality of sets, universal set, Venn diagrams, union and intersection formulas.",
      orderIndex: 1,
    },
  });

  const mathCh1 = await prisma.chapter.upsert({
    where: { unitId_chapterNumber: { unitId: mathUnit1.id, chapterNumber: 1 } },
    update: {},
    create: {
      unitId: mathUnit1.id,
      chapterNumber: 1,
      title: "Overlapping Sets & Cardinality Formulas",
      titleNepali: "खप्टिएका समूहहरू र गणनात्मकता सूत्र",
      summary: "Understand overlapping sets and apply formula n(A ∪ B) = n(A) + n(B) - n(A ∩ B) to solve verbal problems.",
      orderIndex: 1,
    },
  });

  const mathLesson1 = await prisma.lesson.upsert({
    where: { chapterId_lessonNumber: { chapterId: mathCh1.id, lessonNumber: 1 } },
    update: {},
    create: {
      chapterId: mathCh1.id,
      lessonNumber: 1,
      title: "Cardinality of Two Overlapping Sets",
      titleNepali: "दुई खप्टिएका समूहहरूको गणनात्मकता",
      summary: "Detailed study of cardinality relations between overlapping sets and complement calculations.",
      status: ContentStatus.PUBLISHED,
      orderIndex: 1,
    },
  });

  const loSets = await prisma.learningOutcome.upsert({
    where: { code: "LO-MTH801-1.1" },
    update: {},
    create: {
      gradeId: gradesMap["class-8"],
      subjectId: mathSubjectId,
      chapterId: mathCh1.id,
      lessonId: mathLesson1.id,
      code: "LO-MTH801-1.1",
      description: "Solve practical verbal problems involving two overlapping sets using Venn diagrams and cardinality formulas.",
      descriptionNepali: "भेन्चित्र र गणनात्मकता सूत्रको प्रयोग गरी दुई खप्टिएका समूहसम्बन्धी व्यावहारिक समस्या हल गर्न।",
      cognitiveLevel: CognitiveLevel.APPLICATION,
    },
  });

  // Learning Content for Sets
  const contentSets = (await prisma.learningContent.findUnique({ where: { id: "seed-content-sets" } })) ?? await prisma.learningContent.create({
    data: {
      id: "seed-content-sets",
      lessonId: mathLesson1.id,
      type: ContentType.CONCEPT,
      title: "Cardinality Relations for Overlapping Sets",
      bodyMarkdown: `
### What are Overlapping Sets?
Two sets $A$ and $B$ are said to be **overlapping sets** if they share at least one common element, meaning $A \\cap B \\neq \\emptyset$.

### The Fundamental Cardinality Theorem
When two sets $A$ and $B$ overlap:
$$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$$

If $U$ represents the Universal Set:
$$n(U) = n(A \\cup B) + n(A \\cup B)'$$
      `,
      language: "en",
      status: ContentStatus.PUBLISHED,
      version: 1,
      createdById: seededUsers["admin@ailearning.np"],
      approvedById: seededUsers["admin@ailearning.np"],
      publishedAt: new Date(),
    },
  });

  const existingSetsFormula = await prisma.formula.findUnique({ where: { id: "seed-formula-sets-union" } });
  if (!existingSetsFormula) {
    await prisma.formula.create({ data: {
      id: "seed-formula-sets-union",
      learningContentId: contentSets.id,
      name: "Cardinality of Union of Two Overlapping Sets",
      nameNepali: "दुई खप्टिएका समूहको संयोजनको गणनात्मकता",
      latexExpression: "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
      variablesExplanation: "n(A) = number of elements in A, n(B) = number in B, n(A ∩ B) = number in intersection",
    } });
  }

  const existingSetsExample = await prisma.workedExample.findUnique({ where: { id: "seed-example-sets-neither" } });
  if (!existingSetsExample) {
    await prisma.workedExample.create({ data: {
      id: "seed-example-sets-neither",
      learningContentId: contentSets.id,
      problem: "In a class of 60 students, 35 like Nepali, 28 like English, and 12 like both subjects. Find how many students like neither subject using formula.",
      problemNepali: "६० जना विद्यार्थी भएको कक्षामा ३५ जनालाई नेपाली, २८ जनालाई अंग्रेजी र १२ जनालाई दुवै विषय मनपर्छ। दुवै मन नपराउने संख्या पत्ता लगाउनुहोस्।",
      solutionSteps: `
**Given:**
- $n(U) = 60$
- $n(N) = 35$
- $n(E) = 28$
- $n(N \\cap E) = 12$

**Step 1: Calculate union of students who like at least one subject**
$$n(N \\cup E) = n(N) + n(E) - n(N \\cap E)$$
$$n(N \\cup E) = 35 + 28 - 12 = 51$$

**Step 2: Find complement (students who like neither subject)**
$$n(N \\cup E)' = n(U) - n(N \\cup E)$$
$$n(N \\cup E)' = 60 - 51 = 9$$

**Conclusion:** 9 students like neither subject.
      `,
      explanation: "We subtract the intersection once because it was counted twice in n(N) and n(E).",
      orderIndex: 1,
    } });
  }

  // Questions for Sets
  const existingSetsQuestion = await prisma.question.findUnique({ where: { id: "seed-question-sets-union" } });
  if (!existingSetsQuestion) {
    await prisma.question.create({ data: {
      id: "seed-question-sets-union",
      gradeId: gradesMap["class-8"],
      subjectId: mathSubjectId,
      chapterId: mathCh1.id,
      lessonId: mathLesson1.id,
      learningOutcomeId: loSets.id,
      type: QuestionType.MCQ,
      questionText: "If $n(A) = 20$, $n(B) = 15$, and $n(A \\cap B) = 5$, what is the value of $n(A \\cup B)$?",
      difficulty: DifficultyLevel.EASY,
      cognitiveLevel: CognitiveLevel.UNDERSTANDING,
      marks: 1,
      status: ContentStatus.APPROVED,
      options: {
        create: [
          { optionText: "35", isCorrect: false, explanation: "Incorrect. You must subtract the intersection.", orderIndex: 1 },
          { optionText: "30", isCorrect: true, explanation: "Correct! n(A ∪ B) = 20 + 15 - 5 = 30.", orderIndex: 2 },
          { optionText: "25", isCorrect: false, explanation: "Incorrect.", orderIndex: 3 },
          { optionText: "40", isCorrect: false, explanation: "Incorrect.", orderIndex: 4 },
        ],
      },
      solutions: {
        create: {
          solutionMarkdown: "$$n(A \\cup B) = n(A) + n(B) - n(A \\cap B) = 20 + 15 - 5 = 30$$",
        },
      },
    } });
  }

  // Original curriculum-aligned practice items based on Class 8 Mathematics learning areas.
  // They do not reproduce textbook exercise wording.
  const arithmeticUnit = await prisma.unit.findUnique({
    where: { subjectId_unitNumber: { subjectId: mathSubjectId, unitNumber: 2 } },
    include: { chapters: { orderBy: { orderIndex: "asc" }, take: 1 } },
  });
  const algebraUnit = await prisma.unit.findUnique({
    where: { subjectId_unitNumber: { subjectId: mathSubjectId, unitNumber: 4 } },
    include: { chapters: { orderBy: { orderIndex: "asc" }, take: 1 } },
  });

  if (arithmeticUnit?.chapters[0] && !(await prisma.question.findUnique({ where: { id: "seed-question-c8-vat" } }))) {
    await prisma.question.create({ data: {
      id: "seed-question-c8-vat",
      gradeId: gradesMap["class-8"],
      subjectId: mathSubjectId,
      chapterId: arithmeticUnit.chapters[0].id,
      type: QuestionType.NUMERICAL,
      questionText: "A school bag has a marked price of Rs. 2,400. After a 10% discount, 13% VAT is added. Find the final price paid.",
      questionNepali: "एउटा झोलाको अंकित मूल्य रु. २,४०० छ। १०% छुटपछि १३% VAT जोड्दा तिर्नुपर्ने अन्तिम मूल्य पत्ता लगाउनुहोस्।",
      difficulty: DifficultyLevel.MEDIUM,
      cognitiveLevel: CognitiveLevel.APPLICATION,
      marks: 4,
      status: ContentStatus.APPROVED,
      solutions: { create: { solutionMarkdown: "Discount = $2400 \\times 0.10 = 240$. Price after discount = Rs. 2,160. VAT = $2160 \\times 0.13 = 280.80$. Final price = Rs. 2,440.80." } },
      sourceReferences: { create: { bookTitle: "CDC Class 8 Compulsory Mathematics curriculum-aligned original sample", editionYear: "2081 BS", chapterName: arithmeticUnit.title, notes: "Original practice wording; verify against the school's approved edition and specification grid before publication." } },
    } });
  }

  if (algebraUnit?.chapters[0] && !(await prisma.question.findUnique({ where: { id: "seed-question-c8-factor-mcq" } }))) {
    await prisma.question.create({ data: {
      id: "seed-question-c8-factor-mcq",
      gradeId: gradesMap["class-8"],
      subjectId: mathSubjectId,
      chapterId: algebraUnit.chapters[0].id,
      type: QuestionType.MCQ,
      questionText: "Which is the correct factorization of $x^2 + 7x + 12$?",
      difficulty: DifficultyLevel.MEDIUM,
      cognitiveLevel: CognitiveLevel.APPLICATION,
      marks: 1,
      status: ContentStatus.APPROVED,
      options: { create: [
        { optionText: "$(x+2)(x+6)$", isCorrect: false, explanation: "The middle term would be 8x.", orderIndex: 1 },
        { optionText: "$(x+3)(x+4)$", isCorrect: true, explanation: "3 × 4 = 12 and 3 + 4 = 7.", orderIndex: 2 },
        { optionText: "$(x-3)(x-4)$", isCorrect: false, explanation: "The middle term would be negative.", orderIndex: 3 },
        { optionText: "$(x+1)(x+12)$", isCorrect: false, explanation: "The middle term would be 13x.", orderIndex: 4 },
      ] },
      solutions: { create: { solutionMarkdown: "Find two numbers with product 12 and sum 7: 3 and 4. Therefore $x^2+7x+12=(x+3)(x+4)$." } },
      sourceReferences: { create: { bookTitle: "CDC Class 8 Compulsory Mathematics curriculum-aligned original sample", editionYear: "2081 BS", chapterName: algebraUnit.title, notes: "Original practice wording; not copied from a textbook exercise." } },
    } });
  }

  if (algebraUnit?.chapters[0] && !(await prisma.question.findUnique({ where: { id: "seed-question-c8-linear-short" } }))) {
    await prisma.question.create({ data: {
      id: "seed-question-c8-linear-short",
      gradeId: gradesMap["class-8"],
      subjectId: mathSubjectId,
      chapterId: algebraUnit.chapters[0].id,
      type: QuestionType.SHORT,
      questionText: "Solve $3(2x-1)=21$ and verify the value by substitution.",
      difficulty: DifficultyLevel.EASY,
      cognitiveLevel: CognitiveLevel.APPLICATION,
      marks: 3,
      status: ContentStatus.APPROVED,
      solutions: { create: { solutionMarkdown: "$3(2x-1)=21 \\Rightarrow 2x-1=7 \\Rightarrow 2x=8 \\Rightarrow x=4$. Check: $3(2\\times4-1)=3\\times7=21$." } },
      sourceReferences: { create: { bookTitle: "CDC Class 8 Compulsory Mathematics curriculum-aligned original sample", editionYear: "2081 BS", chapterName: algebraUnit.title, notes: "Original practice wording; verify marks against the active specification grid." } },
    } });
  }

  // 10. Detailed Seed for Class 8 Science & Technology (Force & Pressure)
  const sciSubjectId = subjectsMap["SCI-802"];

  const sciUnit2 = await prisma.unit.upsert({
    where: { subjectId_unitNumber: { subjectId: sciSubjectId, unitNumber: 2 } },
    update: {},
    create: {
      subjectId: sciSubjectId,
      unitNumber: 2,
      title: "Force & Pressure",
      titleNepali: "बल र चाप",
      description: "Pressure in solids and fluids, atmospheric pressure, liquid thrust, and Archimedes' Principle.",
      orderIndex: 2,
    },
  });

  const sciCh2 = await prisma.chapter.upsert({
    where: { unitId_chapterNumber: { unitId: sciUnit2.id, chapterNumber: 2 } },
    update: {},
    create: {
      unitId: sciUnit2.id,
      chapterNumber: 2,
      title: "Pressure & Archimedes' Principle",
      titleNepali: "चाप र आर्किमिडिजको सिद्धान्त",
      summary: "Study Archimedes' principle, liquid upthrust formula U = Vdg, and flotation laws.",
      orderIndex: 2,
    },
  });

  const sciLesson1 = await prisma.lesson.upsert({
    where: { chapterId_lessonNumber: { chapterId: sciCh2.id, lessonNumber: 1 } },
    update: {},
    create: {
      chapterId: sciCh2.id,
      lessonNumber: 1,
      title: "Archimedes' Principle & Upthrust",
      titleNepali: "आर्किमिडिजको सिद्धान्त र उर्ध्वचाप",
      summary: "Understanding buoyant force, apparent loss of weight, and conditions for sinking or floating.",
      status: ContentStatus.PUBLISHED,
      orderIndex: 1,
    },
  });

  const loArchimedes = await prisma.learningOutcome.upsert({
    where: { code: "LO-SCI802-2.1" },
    update: {},
    create: {
      gradeId: gradesMap["class-8"],
      subjectId: sciSubjectId,
      chapterId: sciCh2.id,
      lessonId: sciLesson1.id,
      code: "LO-SCI802-2.1",
      description: "State Archimedes' Principle and calculate upthrust in liquids using U = V × d × g.",
      descriptionNepali: "आर्किमिडिजको सिद्धान्त व्याख्या गर्न र U = Vdg सूत्र प्रयोग गरी तरल पदार्थको उर्ध्वचाप गणना गर्न।",
      cognitiveLevel: CognitiveLevel.APPLICATION,
    },
  });

  const contentPressure = (await prisma.learningContent.findUnique({ where: { id: "seed-content-pressure" } })) ?? await prisma.learningContent.create({
    data: {
      id: "seed-content-pressure",
      lessonId: sciLesson1.id,
      type: ContentType.EXPLANATION,
      title: "Understanding Upthrust and Archimedes' Principle",
      bodyMarkdown: `
### Archimedes' Principle
When an object is completely or partially immersed in a liquid at rest, it experiences an **upthrust (buoyant force)** equal to the weight of the liquid displaced by the object.

$$\\text{Upthrust } (U) = \\text{Weight of displaced liquid} = V \\times d \\times g$$

Where:
- $V$ = Volume of the displaced liquid ($m^3$)
- $d$ = Density of the liquid ($kg/m^3$)
- $g$ = Acceleration due to gravity ($9.8 m/s^2$)
      `,
      language: "en",
      status: ContentStatus.PUBLISHED,
      version: 1,
      createdById: seededUsers["admin@ailearning.np"],
      approvedById: seededUsers["admin@ailearning.np"],
      publishedAt: new Date(),
    },
  });

  const existingUpthrustFormula = await prisma.formula.findUnique({ where: { id: "seed-formula-upthrust" } });
  if (!existingUpthrustFormula) {
    await prisma.formula.create({ data: {
      id: "seed-formula-upthrust",
      learningContentId: contentPressure.id,
      name: "Liquid Upthrust Formula",
      nameNepali: "तरल पदार्थको उर्ध्वचाप सूत्र",
      latexExpression: "U = V \\cdot d \\cdot g",
      variablesExplanation: "U = Upthrust (N), V = Volume displaced (m³), d = Density (kg/m³), g = Gravity (9.8 m/s²)",
    } });
  }

  // Question for Science
  const existingScienceQuestion = await prisma.question.findUnique({ where: { id: "seed-question-apparent-weight" } });
  if (!existingScienceQuestion) {
    await prisma.question.create({ data: {
      id: "seed-question-apparent-weight",
      gradeId: gradesMap["class-8"],
      subjectId: sciSubjectId,
      chapterId: sciCh2.id,
      lessonId: sciLesson1.id,
      learningOutcomeId: loArchimedes.id,
      type: QuestionType.MCQ,
      questionText: "What happens to the apparent weight of an iron block when it is completely immersed in pure water?",
      difficulty: DifficultyLevel.MEDIUM,
      cognitiveLevel: CognitiveLevel.UNDERSTANDING,
      marks: 1,
      status: ContentStatus.APPROVED,
      options: {
        create: [
          { optionText: "It increases", isCorrect: false, explanation: "Incorrect.", orderIndex: 1 },
          { optionText: "It decreases by an amount equal to the upthrust", isCorrect: true, explanation: "Correct! Apparent weight = True weight - Upthrust.", orderIndex: 2 },
          { optionText: "It remains identical", isCorrect: false, explanation: "Incorrect.", orderIndex: 3 },
          { optionText: "It becomes zero always", isCorrect: false, explanation: "Incorrect unless density matches.", orderIndex: 4 },
        ],
      },
      solutions: {
        create: {
          solutionMarkdown: "Due to upthrust acting vertically upwards, the apparent weight decreases by the weight of displaced liquid.",
        },
      },
    } });
  }

  // 11. Seed Student Initial Mastery Record
  await prisma.learningOutcomeMastery.upsert({
    where: {
      studentId_learningOutcomeId: {
        studentId: seededUsers["student@demo.np"],
        learningOutcomeId: loSets.id,
      },
    },
    update: { masteryScore: 92.5, attemptCount: 8, correctCount: 7 },
    create: {
      studentId: seededUsers["student@demo.np"],
      learningOutcomeId: loSets.id,
      masteryScore: 92.5,
      attemptCount: 8,
      correctCount: 7,
    },
  });

  await prisma.learningOutcomeMastery.upsert({
    where: {
      studentId_learningOutcomeId: {
        studentId: seededUsers["student@demo.np"],
        learningOutcomeId: loArchimedes.id,
      },
    },
    update: { masteryScore: 78.0, attemptCount: 5, correctCount: 4 },
    create: {
      studentId: seededUsers["student@demo.np"],
      learningOutcomeId: loArchimedes.id,
      masteryScore: 78.0,
      attemptCount: 5,
      correctCount: 4,
    },
  });

  console.log("✅ Seeded Student Mastery Records for Sets (92.5%) and Pressure (78.0%)");
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
