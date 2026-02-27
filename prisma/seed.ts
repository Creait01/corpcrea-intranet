import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.$transaction([
    prisma.trainingCompletion.deleteMany(),
    prisma.chatMessage.deleteMany(),
    prisma.projectMember.deleteMany(),
    prisma.task.deleteMany(),
    prisma.loan.deleteMany(),
    prisma.vacationRequest.deleteMany(),
    prisma.documentRequest.deleteMany(),
    prisma.socialBenefitsRequest.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.chatChannel.deleteMany(),
    prisma.project.deleteMany(),
    prisma.calendarEvent.deleteMany(),
    prisma.trainingModule.deleteMany(),
    prisma.newsItem.deleteMany(),
    prisma.eventItem.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.documentItem.deleteMany(),
    prisma.department.deleteMany(),
    prisma.ceoMessage.deleteMany(),
    prisma.setting.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // ============================
  // Users
  // ============================
  const ceo = await prisma.user.create({
    data: {
      id: 'ceo-1',
      name: 'Roberto Méndez',
      email: 'ceo@corpocrea.com',
      password: hash('123'),
      role: 'CEO',
      avatar: 'https://ui-avatars.com/api/?name=Roberto+Mendez&background=000&color=fff',
      position: 'CEO',
      department: 'Dirección',
      vacationDays: 15,
      socialBenefits: 450250.0,
    },
  });

  const mgr = await prisma.user.create({
    data: {
      id: 'mgr-1',
      name: 'Carlos Admin',
      email: 'admin@corpocrea.com',
      password: hash('123'),
      role: 'MANAGER',
      avatar: 'https://ui-avatars.com/api/?name=Carlos+Admin&background=0D8ABC&color=fff',
      position: 'Director de Comunicación',
      department: 'Recursos Humanos',
      vacationDays: 12,
      socialBenefits: 320400.5,
    },
  });

  const emp1 = await prisma.user.create({
    data: {
      id: 'emp-1',
      name: 'Ana Usuario',
      email: 'user@corpocrea.com',
      password: hash('123'),
      role: 'ARCHITECT',
      avatar: 'https://ui-avatars.com/api/?name=Ana+Usuario&background=E11D48&color=fff',
      position: 'Arquitecta Senior',
      department: 'Proyectos',
      vacationDays: 8,
      socialBenefits: 185200.75,
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      id: 'emp-2',
      name: 'David Desarrollador',
      email: 'dev@corpocrea.com',
      password: hash('123'),
      role: 'ENGINEER',
      avatar: 'https://ui-avatars.com/api/?name=David+Dev&background=16A34A&color=fff',
      position: 'Ingeniero Civil',
      department: 'Ingeniería',
      vacationDays: 10,
      socialBenefits: 210100.0,
    },
  });

  // ============================
  // Loans (for emp-1)
  // ============================
  await prisma.loan.create({
    data: {
      id: 'l1',
      userId: emp1.id,
      amount: 500,
      balance: 350,
      status: 'ACTIVE',
      requestDate: '2024-01-15',
      reason: 'Compra de equipo',
      paymentTermMonths: 6,
      monthlyIncome: 1200,
    },
  });

  // ============================
  // News
  // ============================
  await prisma.newsItem.createMany({
    data: [
      {
        id: '1',
        title: 'Expansión Global 2024',
        description: 'Corpocrea abre nuevas oficinas en Madrid y Buenos Aires.',
        imageUrl: 'https://picsum.photos/1200/600?random=1',
        type: 'IMAGE',
        date: '2024-05-15',
      },
      {
        id: '2',
        title: 'Innovación Tecnológica',
        description: 'Implementamos IA en todos nuestros procesos internos.',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'VIDEO',
        date: '2024-05-10',
      },
    ],
  });

  // ============================
  // Events
  // ============================
  await prisma.eventItem.createMany({
    data: [
      {
        id: '1',
        title: 'Townhall Trimestral',
        date: '2024-06-15',
        location: 'Auditorio Principal',
        description: 'Revisión de resultados y objetivos Q3.',
      },
      {
        id: '2',
        title: 'Taller de Liderazgo',
        date: '2024-06-20',
        location: 'Sala Zoom B',
        description: 'Capacitación para managers y líderes de equipo.',
      },
    ],
  });

  // ============================
  // Employees (Public Directory)
  // ============================
  await prisma.employee.createMany({
    data: [
      {
        id: '1',
        name: 'Ana García',
        position: 'UX Designer',
        department: 'Producto',
        photo: 'https://picsum.photos/200/200?random=10',
        skills: ['Figma', 'React', 'Agile'],
        isMonthEmployee: true,
        birthDate: '05-20',
        startDate: '2020-05-15',
      },
      {
        id: '2',
        name: 'Carlos Rodríguez',
        position: 'Project Manager',
        department: 'Operaciones',
        photo: 'https://picsum.photos/200/200?random=11',
        skills: ['Jira', 'Scrum', 'Leadership'],
        isMonthEmployee: false,
        birthDate: '06-12',
        startDate: '2019-06-01',
      },
      {
        id: '4',
        name: 'David Kim',
        position: 'Developer',
        department: 'IT',
        photo: 'https://picsum.photos/200/200?random=13',
        skills: ['Python', 'AWS', 'Docker'],
        isMonthEmployee: false,
        birthDate: '06-20',
        startDate: '2023-08-01',
      },
    ],
  });

  // ============================
  // Documents
  // ============================
  await prisma.documentItem.createMany({
    data: [
      { id: '1', name: 'Manual de Identidad.pdf', category: 'Brand', size: '2.4 MB', uploadDate: '2024-01-15', department: 'General' },
      { id: '2', name: 'Política de Vacaciones.pdf', category: 'Policy', size: '1.1 MB', uploadDate: '2024-02-20', department: 'Recursos Humanos' },
      { id: '3', name: 'Plantilla Presentación.pptx', category: 'Template', size: '5.6 MB', uploadDate: '2023-11-05', department: 'General' },
      { id: '4', name: 'Guía de Estándares BIM.pdf', category: 'Manual', size: '12.5 MB', uploadDate: '2024-03-10', department: 'Proyectos' },
      { id: '5', name: 'Protocolo de Seguridad en Obra.pdf', category: 'Manual', size: '3.2 MB', uploadDate: '2024-01-20', department: 'Ingeniería' },
      { id: '6', name: 'Formato de Reembolsos.xlsx', category: 'Template', size: '0.5 MB', uploadDate: '2024-04-05', department: 'Recursos Humanos' },
    ],
  });

  // ============================
  // Departments
  // ============================
  await prisma.department.createMany({
    data: [
      { id: 'd1', name: 'Dirección', description: 'Alta gerencia y estrategia corporativa', managerId: 'ceo-1' },
      { id: 'd2', name: 'Recursos Humanos', description: 'Gestión de talento y cultura', managerId: 'mgr-1' },
      { id: 'd3', name: 'Proyectos', description: 'Ejecución y supervisión de obras', managerId: 'emp-1' },
      { id: 'd4', name: 'Ingeniería', description: 'Diseño técnico y cálculos', managerId: 'emp-2' },
      { id: 'd5', name: 'IT', description: 'Tecnología e infraestructura digital' },
      { id: 'd6', name: 'Producto', description: 'Diseño de experiencia y producto digital' },
      { id: 'd7', name: 'Operaciones', description: 'Logística y procesos operativos' },
    ],
  });

  // ============================
  // Calendar Events & Holidays
  // ============================
  await prisma.calendarEvent.createMany({
    data: [
      { id: 'h1', title: 'Año Nuevo', date: '2024-01-01', type: 'HOLIDAY', isWorkingDay: false },
      { id: 'h2', title: 'Carnaval', date: '2024-02-12', type: 'HOLIDAY', isWorkingDay: false },
      { id: 'h3', title: 'Carnaval', date: '2024-02-13', type: 'HOLIDAY', isWorkingDay: false },
      { id: 'h4', title: 'Semana Santa (Jueves)', date: '2024-03-28', type: 'HOLIDAY', isWorkingDay: false },
      { id: 'h5', title: 'Semana Santa (Viernes)', date: '2024-03-29', type: 'HOLIDAY', isWorkingDay: false },
      { id: 'h6', title: 'Declaración de Independencia', date: '2024-04-19', type: 'HOLIDAY', isWorkingDay: false },
      { id: 'h7', title: 'Día del Trabajador', date: '2024-05-01', type: 'HOLIDAY', isWorkingDay: false },
      { id: 'h8', title: 'Batalla de Carabobo', date: '2024-06-24', type: 'HOLIDAY', isWorkingDay: false },
      { id: 'h9', title: 'Día de la Independencia', date: '2024-07-05', type: 'HOLIDAY', isWorkingDay: false },
      { id: 'h10', title: 'Natalicio de Simón Bolívar', date: '2024-07-24', type: 'HOLIDAY', isWorkingDay: false },
      { id: 'h11', title: 'Día de la Resistencia Indígena', date: '2024-10-12', type: 'HOLIDAY', isWorkingDay: false },
      { id: 'h12', title: 'Navidad', date: '2024-12-25', type: 'HOLIDAY', isWorkingDay: false },
      { id: 'e1', title: 'Reunión Trimestral', date: '2024-06-15', type: 'EVENT', isWorkingDay: true, description: 'Revisión de objetivos Q2' },
    ],
  });

  // ============================
  // Vacation Requests
  // ============================
  await prisma.vacationRequest.create({
    data: {
      id: 'v1',
      userId: emp1.id,
      startDate: '2024-08-01',
      endDate: '2024-08-15',
      days: 10,
      status: 'PENDING',
      requestDate: '2024-05-20',
    },
  });

  // ============================
  // Notifications
  // ============================
  await prisma.notification.createMany({
    data: [
      { id: 'n1', userId: emp1.id, title: 'Préstamo Aprobado', message: 'Tu solicitud de préstamo por $500 ha sido aprobada.', date: '2024-01-16', read: false, type: 'SUCCESS' },
      { id: 'n2', userId: emp1.id, title: 'Recordatorio', message: 'Recuerda completar tu evaluación de desempeño.', date: '2024-05-20', read: true, type: 'INFO' },
    ],
  });

  // ============================
  // CEO Message
  // ============================
  await prisma.ceoMessage.create({
    data: {
      id: 'singleton',
      text: 'Este trimestre hemos superado todas las expectativas gracias al esfuerzo de cada uno de vosotros. Sigamos construyendo el futuro juntos.',
      imageUrl: 'https://picsum.photos/400/300?grayscale',
      updatedAt: new Date().toLocaleDateString(),
    },
  });

  // ============================
  // Chat Channels
  // ============================
  const general = await prisma.chatChannel.create({
    data: {
      id: 'general',
      name: 'General',
      type: 'GROUP',
      participants: ['all'],
    },
  });

  await prisma.chatChannel.create({
    data: {
      id: 'announcements',
      name: 'Anuncios',
      type: 'GROUP',
      participants: ['all'],
    },
  });

  await prisma.chatMessage.create({
    data: {
      id: '1',
      channelId: general.id,
      senderId: mgr.id,
      senderName: mgr.name,
      text: '¡Bienvenidos al nuevo chat de Corpocrea!',
      timestamp: new Date(Date.now() - 86400000),
    },
  });

  // ============================
  // Projects
  // ============================
  const p1 = await prisma.project.create({
    data: {
      id: 'p1',
      name: 'Torre Central Corp',
      description: 'Diseño estructural y remodelación del lobby principal.',
      status: 'ACTIVE',
      deadline: '2024-12-01',
      leaderId: mgr.id,
    },
  });

  const p2 = await prisma.project.create({
    data: {
      id: 'p2',
      name: 'Centro Logístico Norte',
      description: 'Planificación de infraestructura eléctrica y accesos.',
      status: 'PLANNING',
      deadline: '2025-02-15',
      leaderId: ceo.id,
    },
  });

  // Project Members
  await prisma.projectMember.createMany({
    data: [
      { projectId: p1.id, userId: mgr.id },
      { projectId: p1.id, userId: emp1.id },
      { projectId: p1.id, userId: emp2.id },
      { projectId: p2.id, userId: ceo.id },
      { projectId: p2.id, userId: emp2.id },
    ],
  });

  // Tasks
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');

  await prisma.task.createMany({
    data: [
      {
        id: 't1',
        projectId: p1.id,
        title: 'Revisión de planos estructurales',
        description: 'Validar cargas máximas en columnas del eje B.',
        assignedToUserId: emp1.id,
        status: 'IN_PROGRESS',
        progress: 45,
        startDate: `${y}-${m}-01`,
        dueDate: `${y}-${m}-05`,
      },
      {
        id: 't2',
        projectId: p1.id,
        title: 'Presupuesto de Materiales',
        description: 'Cotizar acero y concreto con proveedores locales.',
        assignedToUserId: emp2.id,
        status: 'TODO',
        progress: 0,
        startDate: `${y}-${m}-10`,
        dueDate: `${y}-${m}-15`,
      },
      {
        id: 't3',
        projectId: p2.id,
        title: 'Levantamiento topográfico',
        description: 'Visita a terreno zona norte.',
        assignedToUserId: emp2.id,
        status: 'DONE',
        progress: 100,
        startDate: `${y}-${m}-02`,
        dueDate: `${y}-${m}-04`,
      },
    ],
  });

  // ============================
  // Trainings
  // ============================
  const t1 = await prisma.trainingModule.create({
    data: { id: 't-1', title: 'Onboarding Corporativo', description: 'Conoce la misión, visión y valores de Corpocrea.', department: 'General', duration: '30 min' },
  });
  const t2 = await prisma.trainingModule.create({
    data: { id: 't-2', title: 'Seguridad de la Información', description: 'Buenas prácticas para proteger los datos de la empresa.', department: 'General', duration: '45 min' },
  });
  await prisma.trainingModule.createMany({
    data: [
      { id: 't-3', title: 'Metodologías Ágiles en Construcción', description: 'Aplicación de Lean Construction en nuestros proyectos.', department: 'Proyectos', duration: '60 min' },
      { id: 't-4', title: 'Normativas ISO 9001', description: 'Estándares de calidad para ingenieros.', department: 'Ingeniería', duration: '90 min' },
      { id: 't-5', title: 'Liderazgo Efectivo', description: 'Técnicas para gestionar equipos de alto rendimiento.', department: 'Recursos Humanos', duration: '120 min' },
    ],
  });

  // Training completions
  await prisma.trainingCompletion.createMany({
    data: [
      { trainingId: t1.id, userId: emp1.id },
      { trainingId: t1.id, userId: emp2.id },
      { trainingId: t1.id, userId: mgr.id },
      { trainingId: t2.id, userId: mgr.id },
    ],
  });

  // ============================
  // Settings (Odoo + Cloudinary config defaults)
  // ============================
  await prisma.setting.createMany({
    data: [
      { key: 'odoo_url', value: '' },
      { key: 'odoo_api_key', value: '' },
      { key: 'cloudinary_cloud_name', value: '' },
      { key: 'cloudinary_api_key', value: '' },
      { key: 'cloudinary_api_secret', value: '' },
      { key: 'cloudinary_upload_preset', value: '' },
    ],
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
