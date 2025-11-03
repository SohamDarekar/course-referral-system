import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Course from '../models/Course';

dotenv.config();

const courses = [
  {
    title: 'Advanced TypeScript',
    description:
      'Master advanced TypeScript concepts like generics, decorators, and conditional types.',
    price: 49,
    courseHours: 24,
    syllabus: [
      'TypeScript Fundamentals Review',
      'Advanced Types and Generics',
      'Decorators and Metadata',
      'Conditional Types and Mapped Types',
      'Type Guards and Narrowing',
      'Advanced Patterns and Best Practices',
      'Building Type-Safe Libraries',
      'Real-world TypeScript Projects',
    ],
    rating: 4.8,
    numRatings: 324,
    creditsRequired: 25,
    instructor: 'Sarah Johnson',
    level: 'Advanced',
  },
  {
    title: 'Next.js 14 Deep Dive',
    description:
      'Build high-performance web applications with the latest features of Next.js.',
    price: 59,
    courseHours: 32,
    syllabus: [
      'Next.js 14 Introduction',
      'App Router and Server Components',
      'Data Fetching Strategies',
      'Server Actions and Mutations',
      'Streaming and Suspense',
      'Route Handlers and Middleware',
      'Authentication with NextAuth',
      'Deployment and Optimization',
      'Full-Stack Next.js Projects',
    ],
    rating: 4.9,
    numRatings: 512,
    creditsRequired: 30,
    instructor: 'Michael Chen',
    level: 'Intermediate',
  },
  {
    title: 'Modern Backend with Express & Zod',
    description:
      'Learn to build robust, type-safe RESTful APIs with Node.js, Express, and Zod.',
    price: 39,
    courseHours: 20,
    syllabus: [
      'Node.js and Express Fundamentals',
      'RESTful API Design Principles',
      'Request Validation with Zod',
      'Error Handling and Middleware',
      'Database Integration with MongoDB',
      'Authentication and Authorization',
      'API Security Best Practices',
      'Testing and Documentation',
      'Deployment to Production',
    ],
    rating: 4.7,
    numRatings: 289,
    creditsRequired: 2,
    instructor: 'David Rodriguez',
    level: 'Intermediate',
  },
  {
    title: 'Tailwind CSS From Scratch',
    description:
      'Go from beginner to pro with Tailwind CSS and build beautiful, custom UIs.',
    price: 29,
    courseHours: 16,
    syllabus: [
      'Tailwind CSS Setup and Configuration',
      'Utility-First CSS Approach',
      'Responsive Design with Tailwind',
      'Custom Colors and Themes',
      'Components and Patterns',
      'Dark Mode Implementation',
      'Animations and Transitions',
      'Production Optimization',
      'Building Real-World Interfaces',
    ],
    rating: 4.6,
    numRatings: 445,
    creditsRequired: 15,
    instructor: 'Emily Parker',
    level: 'Beginner',
  },
  {
    title: 'Full-Stack Authentication Mastery',
    description:
      'Implement secure authentication systems with JWT, OAuth, and NextAuth.',
    price: 44,
    courseHours: 28,
    syllabus: [
      'Authentication Fundamentals',
      'JWT Implementation',
      'Session Management',
      'OAuth 2.0 and Social Login',
      'NextAuth.js Deep Dive',
      'Role-Based Access Control',
      'Security Best Practices',
      'Password Reset and Email Verification',
      'Multi-Factor Authentication',
      'Full-Stack Auth Project',
    ],
    rating: 4.9,
    numRatings: 387,
    creditsRequired: 22,
    instructor: 'Alex Thompson',
    level: 'Intermediate',
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing courses
    await Course.deleteMany({});
    console.log('✅ Cleared existing courses');

    // Insert new courses
    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ Seeded ${createdCourses.length} courses`);

    console.log('\n📚 Created Courses:');
    createdCourses.forEach((course) => {
      console.log(`  - ${course.title} ($${course.price})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
