-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TRAINER', 'INSTITUTION', 'PROGRAMME_MANAGER', 'MONITORING_OFFICER');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE');

-- CreateTable: Institution
CREATE TABLE "Institution" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable: User
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "clerkUserId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "institutionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Batch
CREATE TABLE "Batch" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "institutionId" TEXT NOT NULL,
  "inviteCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable: BatchTrainer
CREATE TABLE "BatchTrainer" (
  "batchId" TEXT NOT NULL,
  "trainerId" TEXT NOT NULL,
  CONSTRAINT "BatchTrainer_pkey" PRIMARY KEY ("batchId","trainerId")
);

-- CreateTable: BatchStudent
CREATE TABLE "BatchStudent" (
  "batchId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  CONSTRAINT "BatchStudent_pkey" PRIMARY KEY ("batchId","studentId")
);

-- CreateTable: Session
CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "batchId" TEXT NOT NULL,
  "trainerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Attendance
CREATE TABLE "Attendance" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "status" "AttendanceStatus" NOT NULL,
  "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
ALTER TABLE "User" ADD CONSTRAINT "User_clerkUserId_key" UNIQUE ("clerkUserId");
ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_inviteCode_key" UNIQUE ("inviteCode");
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_sessionId_studentId_key" UNIQUE ("sessionId", "studentId");

-- Foreign Keys
ALTER TABLE "User" ADD CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BatchTrainer" ADD CONSTRAINT "BatchTrainer_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BatchTrainer" ADD CONSTRAINT "BatchTrainer_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BatchStudent" ADD CONSTRAINT "BatchStudent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BatchStudent" ADD CONSTRAINT "BatchStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
