import path from 'path';
import fs from 'fs';
import csv from 'csv-parse';
import Transaction from '../models/Transaction';

import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    const file = path.join(uploadConfig.directory, fileName);
    const createTransactionService = new CreateTransactionService();

    const transactions: TransactionDTO[] = [];
    const importedTransactions: Transaction[] = [];

    const stream = fs
      .createReadStream(file)
      .pipe(csv({ columns: true, from_line: 1, trim: true }));

    stream.on('data', row => {
      transactions.push(row);
    });

    await new Promise(resolve => {
      stream.on('end', resolve);
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const item of transactions) {
      // eslint-disable-next-line no-await-in-loop
      const transactionAdd = await createTransactionService.execute(item);
      importedTransactions.push(transactionAdd);
    }

    return importedTransactions;
  }
}

export default ImportTransactionsService;
