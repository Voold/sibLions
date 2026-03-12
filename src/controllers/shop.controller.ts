import type { Request, Response } from 'express';
import * as shopService from '../services/shop.service.js';

export const getProducts = async (req: Request, res: Response) => {
  const products = await shopService.getAllProducts();
  res.json(products);
};

export const getProductById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const product = await shopService.getProductById(id);
  product ? res.json(product) : res.status(404).json({ message: 'Product not found' });
};