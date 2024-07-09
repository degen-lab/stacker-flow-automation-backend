export const createDelegationsTable = `
  CREATE TABLE IF NOT EXISTS Delegations (
    stacker TEXT NOT NULL,
    startCycle INTEGER,
    endCycle INTEGER,
    poxAddress TEXT,
    amountUstx INTEGER NOT NULL
  );
`;

export const createPreviousDelegationsTable = `
  CREATE TABLE IF NOT EXISTS PreviousDelegations (
    stacker TEXT NOT NULL,
    startCycle INTEGER,
    endCycle INTEGER,
    poxAddress TEXT,
    amountUstx INTEGER NOT NULL
  );
`;

export const createAcceptedDelegationsTable = `
  CREATE TABLE IF NOT EXISTS AcceptedDelegations (
    stacker TEXT NOT NULL,
    startCycle INTEGER,
    endCycle INTEGER,
    poxAddress TEXT,
    amountUstx INTEGER NOT NULL
  );
`;

export const createCommittedDelegationsTable = `
  CREATE TABLE IF NOT EXISTS CommittedDelegations (
    poxAddress TEXT NOT NULL,
    startCycle INTEGER,
    endCycle INTEGER,
    amountUstx INTEGER NOT NULL,
    rewardIndex INTEGER
  );
`;

export const insertDelegations = `
  INSERT INTO Delegations (stacker, startCycle, endCycle, poxAddress, amountUstx)
  VALUES (?, ?, ?, ?, ?)
`;

export const insertPreviousDelegations = `
  INSERT INTO PreviousDelegations (stacker, startCycle, endCycle, poxAddress, amountUstx)
  VALUES (?, ?, ?, ?, ?)
`;

export const insertAcceptedDelegations = `
  INSERT INTO AcceptedDelegations (stacker, startCycle, endCycle, poxAddress, amountUstx)
  VALUES (?, ?, ?, ?, ?)
`;

export const insertCommittedDelegations = `
  INSERT INTO CommittedDelegations (poxAddress, startCycle, endCycle, amountUstx, rewardIndex)
  VALUES (?, ?, ?, ?, ?)
`;
