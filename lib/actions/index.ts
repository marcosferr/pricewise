"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/Product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { generateEmailBody, sendEmail } from "../nodemailer";
import { EmailContent } from "@/types";

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) {
    return;
  }

  try {
    connectToDB();

    const scrapedProduct = await scrapeAmazonProduct(productUrl);

    if (!scrapedProduct) {
      return;
    }

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: product.url });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: product.currentPrice },
      ];

      product = {
        ...(scrapedProduct as any),
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { new: true, upsert: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
}

export async function getProductById(productId: string) {
  try {
    connectToDB();

    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return null;
    }
    return product;
  } catch (error: any) {
    console.log(error.message);
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectToDB();

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return [];
    }

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(4);
  } catch (error: any) {
    console.log(error.message);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
}
export async function getAllProducts() {
  try {
    connectToDB();

    const products = await Product.find();
    return products;
  } catch (error: any) {
    console.log(error.message);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
}

export async function addUserEmailToProduct(productId: string, email: string) {
  try {
    connectToDB();
    console.log("Se busca el producto");
    const product = await Product.findById(productId);
    if (!product) {
      return;
    }
    console.log("Se encontro el producto");

    const userExists = product.users.some((user: any) => user.email === email);
    if (userExists) {
      console.log("Ya existe un usuario");
      return;
    }

    product.users.push({ email });
    await product.save();

    const emailContent = await generateEmailBody(product, "WELCOME");

    console.log("Enviando mensaje");
    await sendEmail(emailContent, [email]);
  } catch (error: any) {
    console.log(error.message);
    throw new Error(`Failed to add user email to product: ${error.message}`);
  }
}
