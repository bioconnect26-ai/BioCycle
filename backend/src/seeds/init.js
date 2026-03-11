import dotenv from "dotenv";
import { sequelize, User, Category, ClassLevel } from "../db.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Sync database
    await sequelize.sync({ alter: true });
    console.log("✓ Database synced");

    // Create default class levels
    const classLevels = [
      {
        name: "class-9",
        displayName: "Class 9th",
        description: "Content for 9th grade students",
        order: 1,
      },
      {
        name: "class-10",
        displayName: "Class 10th",
        description: "Content for 10th grade students",
        order: 2,
      },
      {
        name: "class-11",
        displayName: "Class 11th",
        description: "Content for 11th grade students",
        order: 3,
      },
      {
        name: "class-12",
        displayName: "Class 12th",
        description: "Content for 12th grade students",
        order: 4,
      },
    ];

    for (const level of classLevels) {
      const exists = await ClassLevel.findOne({ where: { name: level.name } });
      if (!exists) {
        await ClassLevel.create(level);
        console.log(`✓ Created class level: ${level.displayName}`);
      }
    }

    // Create default categories
    const categories = [
      {
        name: "Cellular",
        slug: "cellular",
        description: "Cycles occurring within individual cells",
      },
      {
        name: "Ecological",
        slug: "ecological",
        description: "Cycles within ecosystems and environments",
      },
      {
        name: "Biochemical",
        slug: "biochemical",
        description: "Chemical processes in living organisms",
      },
      {
        name: "Environmental",
        slug: "environmental",
        description: "Large-scale environmental cycles",
      },
      {
        name: "Metabolic",
        slug: "metabolic",
        description: "Metabolic pathways and cycles",
      },
    ];

    for (const cat of categories) {
      const exists = await Category.findOne({ where: { slug: cat.slug } });
      if (!exists) {
        await Category.create(cat);
        console.log(`✓ Created category: ${cat.name}`);
      }
    }

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@biocycles.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe@123";
    const adminExists = await User.findOne({ where: { email: adminEmail } });

    if (!adminExists) {
      await User.create({
        email: adminEmail,
        password: adminPassword,
        fullName: "Administrator",
        role: "super_admin",
        status: "active",
      });
      console.log(`✓ Created admin user: ${adminEmail}`);
      console.log(
        `  Password: ${adminPassword} (⚠️  CHANGE THIS IN PRODUCTION!)`,
      );
    } else {
      console.log(`✓ Admin user already exists: ${adminEmail}`);
    }

    // Create demo users
    const demoEditorEmail = "editor@biocycles.com";
    const editorExists = await User.findOne({
      where: { email: demoEditorEmail },
    });

    if (!editorExists) {
      await User.create({
        email: demoEditorEmail,
        password: "EditorPass@123",
        fullName: "Demo Editor",
        role: "editor",
        status: "active",
      });
      console.log(`✓ Created demo editor user: ${demoEditorEmail}`);
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📝 Default Credentials:");
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log("\n⚠️  Remember to change admin password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
