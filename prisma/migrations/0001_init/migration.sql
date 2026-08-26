-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMBER', 'VENDOR', 'ADMIN', 'FINANCE');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('NORMAL', 'FROZEN', 'SUSPENDED', 'EXITED', 'INVALID');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PENDING', 'RETURNED', 'APPROVED', 'PUBLISHED', 'UNLISTED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'MOCK_PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'SETTLEMENT_ELIGIBLE', 'SETTLED', 'CANCELLED', 'REFUNDED_BEFORE_SETTLEMENT');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('DRAFT', 'PREVIEWED', 'APPROVED', 'POSTED', 'FAILED');

-- CreateEnum
CREATE TYPE "BonusType" AS ENUM ('REFERRAL', 'GENERATION', 'ANNUAL_DISTRIBUTION');

-- CreateEnum
CREATE TYPE "LedgerDestination" AS ENUM ('ACCUMULATION', 'HELD', 'CASH', 'POINTS');

-- CreateEnum
CREATE TYPE "WalletType" AS ENUM ('PENDING_BONUS', 'ACCUMULATION', 'CASH', 'SHOPPING_POINTS', 'HELD_BONUS');

-- CreateEnum
CREATE TYPE "WaterPoolCategory" AS ENUM ('UNPAID_REFERRAL', 'MISSING_GENERATION', 'INELIGIBLE_GENERATION', 'LOCKED_GENERATION');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('OPEN', 'REPLIED', 'DONE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "memberId" TEXT,
    "vendorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "memberNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "planAmountTwd" INTEGER NOT NULL,
    "sponsorId" TEXT,
    "status" "MemberStatus" NOT NULL DEFAULT 'NORMAL',
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "directCount" INTEGER NOT NULL DEFAULT 0,
    "unlockedGenerations" INTEGER NOT NULL,
    "depth" INTEGER NOT NULL,
    "incomeTaxApplicable" BOOLEAN NOT NULL DEFAULT false,
    "nhiApplicable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "vendorNo" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priceTwd" INTEGER NOT NULL,
    "costTwd" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "status" "ProductStatus" NOT NULL,
    "pointsAllowed" BOOLEAN NOT NULL DEFAULT true,
    "accent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amountTwd" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "placedAt" TIMESTAMP(3) NOT NULL,
    "settlementEligibleAt" TIMESTAMP(3) NOT NULL,
    "settledAt" TIMESTAMP(3),
    "trackingNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceTwd" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompensationPlanVersion" (
    "id" TEXT NOT NULL,
    "effectiveMonth" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reserveBps" INTEGER NOT NULL,
    "performanceBps" INTEGER NOT NULL,
    "referralOfPerformanceBps" INTEGER NOT NULL,
    "generationOfPerformanceBps" INTEGER NOT NULL,
    "maxGenerations" INTEGER NOT NULL,
    "productCostBps" INTEGER NOT NULL,
    "cycleThresholdTwd" INTEGER NOT NULL,
    "cycleCashTwd" INTEGER NOT NULL,
    "cyclePoints" INTEGER NOT NULL,
    "annualDistributionBps" INTEGER NOT NULL,
    "settlementDelayDays" INTEGER NOT NULL,
    "incomeTaxBps" INTEGER NOT NULL,
    "nhiBps" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),

    CONSTRAINT "CompensationPlanVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyMemberSnapshot" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "planVersionId" TEXT NOT NULL,
    "planAmountTwd" INTEGER NOT NULL,
    "directCount" INTEGER NOT NULL,
    "unlockedGenerations" INTEGER NOT NULL,
    "memberStatus" "MemberStatus" NOT NULL,
    "incomeTaxApplicable" BOOLEAN NOT NULL,
    "nhiApplicable" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyMemberSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettlementBatch" (
    "id" TEXT NOT NULL,
    "settlementMonth" TEXT NOT NULL,
    "planVersionId" TEXT NOT NULL,
    "status" "SettlementStatus" NOT NULL,
    "previewOnly" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceEvent" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "orderId" TEXT,
    "amountTwd" INTEGER NOT NULL,
    "performanceValue" INTEGER NOT NULL,
    "settlementMonth" TEXT NOT NULL,
    "planVersionId" TEXT NOT NULL,
    "settlementBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusLedgerEntry" (
    "id" TEXT NOT NULL,
    "performanceEventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "sourceMemberId" TEXT NOT NULL,
    "amountTwd" INTEGER NOT NULL,
    "bonusType" "BonusType" NOT NULL,
    "generation" INTEGER,
    "destination" "LedgerDestination" NOT NULL,
    "statusAtCalculation" "MemberStatus" NOT NULL,
    "planVersionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BonusLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletAccount" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "type" "WalletType" NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletLedgerEntry" (
    "id" TEXT NOT NULL,
    "walletAccountId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "entryType" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "reversalOfId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterPoolEntry" (
    "id" TEXT NOT NULL,
    "performanceEventId" TEXT NOT NULL,
    "sourceMemberId" TEXT NOT NULL,
    "expectedMemberId" TEXT,
    "amountTwd" INTEGER NOT NULL,
    "category" "WaterPoolCategory" NOT NULL,
    "generation" INTEGER,
    "planVersionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaterPoolEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "grossTwd" INTEGER NOT NULL,
    "incomeTaxTwd" INTEGER NOT NULL,
    "nhiTwd" INTEGER NOT NULL,
    "netTwd" INTEGER NOT NULL,
    "status" "WithdrawalStatus" NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "bankReference" TEXT,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualDistributionBatch" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "afterTaxDistributableProfitTwd" INTEGER NOT NULL,
    "distributionBps" INTEGER NOT NULL,
    "poolTwd" INTEGER NOT NULL,
    "eligibleCount" INTEGER NOT NULL,
    "perMemberTwd" INTEGER NOT NULL,
    "remainderTwd" INTEGER NOT NULL,
    "qualificationDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnualDistributionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualDistributionEntry" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amountTwd" INTEGER NOT NULL,

    CONSTRAINT "AnnualDistributionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackAnnotation" (
    "id" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "targetLabel" TEXT NOT NULL,
    "xPercent" INTEGER,
    "yPercent" INTEGER,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedbackAnnotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Member_memberNo_key" ON "Member"("memberNo");

-- CreateIndex
CREATE INDEX "Member_sponsorId_idx" ON "Member"("sponsorId");

-- CreateIndex
CREATE INDEX "Member_status_planAmountTwd_idx" ON "Member"("status", "planAmountTwd");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_vendorNo_key" ON "Vendor"("vendorNo");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_vendorId_status_idx" ON "Product"("vendorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");

-- CreateIndex
CREATE INDEX "Order_memberId_status_idx" ON "Order"("memberId", "status");

-- CreateIndex
CREATE INDEX "Order_vendorId_status_idx" ON "Order"("vendorId", "status");

-- CreateIndex
CREATE INDEX "Order_settlementEligibleAt_status_idx" ON "Order"("settlementEligibleAt", "status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "CompensationPlanVersion_effectiveMonth_key" ON "CompensationPlanVersion"("effectiveMonth");

-- CreateIndex
CREATE INDEX "MonthlyMemberSnapshot_planVersionId_idx" ON "MonthlyMemberSnapshot"("planVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyMemberSnapshot_month_memberId_key" ON "MonthlyMemberSnapshot"("month", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "SettlementBatch_settlementMonth_previewOnly_key" ON "SettlementBatch"("settlementMonth", "previewOnly");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceEvent_idempotencyKey_key" ON "PerformanceEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "PerformanceEvent_memberId_settlementMonth_idx" ON "PerformanceEvent"("memberId", "settlementMonth");

-- CreateIndex
CREATE INDEX "PerformanceEvent_settlementBatchId_idx" ON "PerformanceEvent"("settlementBatchId");

-- CreateIndex
CREATE INDEX "BonusLedgerEntry_memberId_createdAt_idx" ON "BonusLedgerEntry"("memberId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BonusLedgerEntry_performanceEventId_bonusType_generation_me_key" ON "BonusLedgerEntry"("performanceEventId", "bonusType", "generation", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletAccount_memberId_type_key" ON "WalletAccount"("memberId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "WalletLedgerEntry_idempotencyKey_key" ON "WalletLedgerEntry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "WalletLedgerEntry_walletAccountId_createdAt_idx" ON "WalletLedgerEntry"("walletAccountId", "createdAt");

-- CreateIndex
CREATE INDEX "WaterPoolEntry_category_createdAt_idx" ON "WaterPoolEntry"("category", "createdAt");

-- CreateIndex
CREATE INDEX "WaterPoolEntry_sourceMemberId_idx" ON "WaterPoolEntry"("sourceMemberId");

-- CreateIndex
CREATE INDEX "Withdrawal_status_requestedAt_idx" ON "Withdrawal"("status", "requestedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnnualDistributionBatch_year_key" ON "AnnualDistributionBatch"("year");

-- CreateIndex
CREATE UNIQUE INDEX "AnnualDistributionEntry_batchId_memberId_key" ON "AnnualDistributionEntry"("batchId", "memberId");

-- CreateIndex
CREATE INDEX "FeedbackAnnotation_status_createdAt_idx" ON "FeedbackAnnotation"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_actor_createdAt_idx" ON "AuditEvent"("actor", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyMemberSnapshot" ADD CONSTRAINT "MonthlyMemberSnapshot_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyMemberSnapshot" ADD CONSTRAINT "MonthlyMemberSnapshot_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "CompensationPlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettlementBatch" ADD CONSTRAINT "SettlementBatch_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "CompensationPlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEvent" ADD CONSTRAINT "PerformanceEvent_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEvent" ADD CONSTRAINT "PerformanceEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEvent" ADD CONSTRAINT "PerformanceEvent_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "CompensationPlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEvent" ADD CONSTRAINT "PerformanceEvent_settlementBatchId_fkey" FOREIGN KEY ("settlementBatchId") REFERENCES "SettlementBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusLedgerEntry" ADD CONSTRAINT "BonusLedgerEntry_performanceEventId_fkey" FOREIGN KEY ("performanceEventId") REFERENCES "PerformanceEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusLedgerEntry" ADD CONSTRAINT "BonusLedgerEntry_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusLedgerEntry" ADD CONSTRAINT "BonusLedgerEntry_sourceMemberId_fkey" FOREIGN KEY ("sourceMemberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletAccount" ADD CONSTRAINT "WalletAccount_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletLedgerEntry" ADD CONSTRAINT "WalletLedgerEntry_walletAccountId_fkey" FOREIGN KEY ("walletAccountId") REFERENCES "WalletAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterPoolEntry" ADD CONSTRAINT "WaterPoolEntry_performanceEventId_fkey" FOREIGN KEY ("performanceEventId") REFERENCES "PerformanceEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualDistributionEntry" ADD CONSTRAINT "AnnualDistributionEntry_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "AnnualDistributionBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualDistributionEntry" ADD CONSTRAINT "AnnualDistributionEntry_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
