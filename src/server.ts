import express from 'express';
import { SERVER_PORT } from './consts';
import { selectAcceptedDelegations, selectCommittedDelegations, selectDelegations, selectPendingTransactions, selectPreviousDelegations } from './models';
import { dbPromise } from './db';

const app = express();

const fetchAllData = async () => {
  const db = await dbPromise;

  const delegations = await db.all(selectDelegations);
  const previousDelegations = await db.all(selectPreviousDelegations);
  const acceptedDelegations = await db.all(selectAcceptedDelegations);
  const committedDelegations = await db.all(selectCommittedDelegations);
  const pendingTransactions = await db.all(selectPendingTransactions);

  return {
    delegations,
    previousDelegations,
    acceptedDelegations,
    committedDelegations,
    pendingTransactions
  };
};

app.get('/data', async (_, res) => {
  try {
    const data = await fetchAllData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on http://localhost:${SERVER_PORT}`);
});
