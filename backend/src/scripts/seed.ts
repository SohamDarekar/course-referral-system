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
  },
  {
    title: 'Next.js 14 Deep Dive',
    description:
      'Build high-performance web applications with the latest features of Next.js.',
    price: 59,
  },
  {
    title: 'Modern Backend with Express & Zod',
    description:
      'Learn to build robust, type-safe RESTful APIs with Node.js, Express, and Zod.',
    price: 39,
  },
  {
    title: 'Tailwind CSS From Scratch',
    description:
      'Go from beginner to pro with Tailwind CSS and build beautiful, custom UIs.',
    price: 29,
  },
  {
    title: 'Full-Stack Authentication Mastery',
    description:
      'Implement secure authentication systems with JWT, OAuth, and NextAuth.',
    price: 44,
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
