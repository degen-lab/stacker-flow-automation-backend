import { query } from './db';
import {
  insertDelegations,
  insertAcceptedDelegations,
  insertCommittedDelegations,
  insertPreviousDelegations,
} from './models';

export const saveDelegations = async (data: Map<string, any>) => {
  for (const [stacker, value] of data) {
    await query(insertDelegations, [
      stacker,
      value.startCycle,
      value.endCycle,
      value.poxAddress,
      value.amountUstx,
    ]);
  }
};

export const savePreviousDelegations = async (data: Map<string, any>) => {
  for (const [stacker, value] of data) {
    for (const item of value) {
      await query(insertPreviousDelegations, [
        stacker,
        item.startCycle,
        item.endCycle,
        item.poxAddress,
        item.amountUstx,
      ]);
    }
  }
};

export const saveAcceptedDelegations = async (data: Map<string, any>) => {
  for (const [stacker, value] of data) {
    for (const item of value) {
      await query(insertAcceptedDelegations, [
        stacker,
        item.startCycle,
        item.endCycle,
        item.poxAddress,
        item.amountUstx,
      ]);
    }
  }
};

export const saveCommittedDelegations = async (data: Map<string, any>) => {
  for (const [poxAddress, value] of data) {
    for (const item of value) {
      await query(insertCommittedDelegations, [
        poxAddress,
        item.startCycle,
        item.endCycle,
        item.amountUstx,
        item.rewardIndex,
      ]);
    }
  }
};
