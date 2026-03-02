-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'DRIVER', 'STORE_OWNER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING_ACCEPTANCE', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "label" TEXT,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "cover_image_url" TEXT,
    "delivery_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "min_order_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "delivery_time_minutes" INTEGER NOT NULL DEFAULT 30,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "opening_hours" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "product_category_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "image_url" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "driver_id" TEXT,
    "address_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "delivery_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "observations" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "driver_id" TEXT,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING_ACCEPTANCE',
    "pickup_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "estimated_delivery_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverLocation" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "external_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Address_user_id_idx" ON "Address"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Store_slug_key" ON "Store"("slug");

-- CreateIndex
CREATE INDEX "Store_owner_id_idx" ON "Store"("owner_id");

-- CreateIndex
CREATE INDEX "Store_category_id_idx" ON "Store"("category_id");

-- CreateIndex
CREATE INDEX "Product_store_id_idx" ON "Product"("store_id");

-- CreateIndex
CREATE INDEX "Product_product_category_id_idx" ON "Product"("product_category_id");

-- CreateIndex
CREATE INDEX "Order_customer_id_idx" ON "Order"("customer_id");

-- CreateIndex
CREATE INDEX "Order_store_id_idx" ON "Order"("store_id");

-- CreateIndex
CREATE INDEX "Order_driver_id_idx" ON "Order"("driver_id");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_created_at_idx" ON "Order"("created_at");

-- CreateIndex
CREATE INDEX "OrderItem_order_id_idx" ON "OrderItem"("order_id");

-- CreateIndex
CREATE INDEX "OrderItem_product_id_idx" ON "OrderItem"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_order_id_key" ON "Delivery"("order_id");

-- CreateIndex
CREATE INDEX "Delivery_driver_id_idx" ON "Delivery"("driver_id");

-- CreateIndex
CREATE INDEX "Delivery_status_idx" ON "Delivery"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DriverLocation_driver_id_key" ON "DriverLocation"("driver_id");

-- CreateIndex
CREATE INDEX "DriverLocation_driver_id_idx" ON "DriverLocation"("driver_id");

-- CreateIndex
CREATE INDEX "Payment_order_id_idx" ON "Payment"("order_id");

-- CreateIndex
CREATE INDEX "Payment_external_id_idx" ON "Payment"("external_id");

-- CreateIndex
CREATE INDEX "Review_store_id_idx" ON "Review"("store_id");

-- CreateIndex
CREATE INDEX "Review_user_id_idx" ON "Review"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Review_order_id_type_key" ON "Review"("order_id", "type");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_product_category_id_fkey" FOREIGN KEY ("product_category_id") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
