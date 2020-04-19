import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('This type is not valid.');
    }

    const categoriesRepository = getRepository(Category);

    let findedCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!findedCategory) {
      const createCategory = categoriesRepository.create({
        title: category,
      });

      findedCategory = await categoriesRepository.save(createCategory);
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Insufficient funds.');
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: findedCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
