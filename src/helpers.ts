import { poxAddressToBtcAddress } from '@stacks/stacking';
import { LIMIT, STACKS_NETWORK, POOL_OPERATOR } from './consts';
import { fetchData, fetchRewardCycleIndex } from './api-calls';
import { query } from './db';
import {
  createAcceptedDelegationsTable,
  createCommittedDelegationsTable,
  createDelegationsTable,
  createPreviousDelegationsTable,
} from './models';

export const parseStringToJSON = (input: string) => {
  const parseValue = (value: string): string | null | NonNullable<unknown> => {
    if (value.startsWith('(tuple')) {
      return parseTuple(value);
    } else if (value.startsWith('(some')) {
      return parseSome(value);
    } else if (value === 'none') {
      return null;
    } else if (value.startsWith('u')) {
      return parseInt(value.slice(1), 10);
    } else if (value.startsWith('0x')) {
      return value;
    } else if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    } else if (value.startsWith("'")) {
      return value.slice(1);
    } else if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    } else if (value.startsWith('"')) {
      return value.slice(1);
    } else {
      return value;
    }
  };

  const parseTuple = (value: string) => {
    const obj: any = {};
    const tupleContent = value.slice(7, -1).trim();
    const entries = splitEntries(tupleContent);

    entries.forEach((entry) => {
      const spaceIndex = entry.indexOf(' ');
      const key = entry.slice(1, spaceIndex);
      const val = entry
        .slice(spaceIndex + 1)
        .trim()
        .slice(0, -1);
      obj[key] = parseValue(val);
    });

    return obj;
  };

  const parseSome = (value: string) => {
    const someContent = value.slice(5, -1).trim();
    return parseValue(someContent);
  };

  const splitEntries = (content: string) => {
    const entries = [];
    let bracketCount = 0;
    let startIdx = 0;

    for (let i = 0; i < content.length; i++) {
      if (content[i] === '(') bracketCount++;
      if (content[i] === ')') bracketCount--;
      if (
        bracketCount === 0 &&
        (content[i] === ' ' || i === content.length - 1)
      ) {
        entries.push(content.slice(startIdx, i + 1).trim());
        startIdx = i + 1;
      }
    }

    return entries;
  };

  const parseMain = (input: string) => {
    const mainContent = input.slice(4, -1).trim();
    if (mainContent.startsWith('(tuple')) {
      return parseTuple(mainContent);
    } else {
      const entries = splitEntries(mainContent);
      const result: any = {};

      entries.forEach((entry) => {
        const spaceIndex = entry.indexOf(' ');
        const key = entry.slice(1, spaceIndex);
        const val = entry
          .slice(spaceIndex + 1)
          .trim()
          .slice(0, -1);
        result[key] = parseValue(val);
      });

      return result;
    }
  };

  return parseMain(input);
};

export const getEvents = async () => {
  let offset = 0;
  let moreData = true;
  const events = [];

  while (moreData) {
    const data = await fetchData(offset);

    if (data && data.length > 0) {
      for (const entry of data) {
        if (entry.contract_log.value.repr.includes(POOL_OPERATOR)) {
          const result = parseStringToJSON(entry.contract_log.value.repr);
          if (result.name == 'delegate-stx') {
            events.push({
              name: result.name,
              stacker: result.stacker,
              amountUstx: result.data['amount-ustx'],
              startCycle: result.data['start-cycle-id'],
              endCycle: result.data['end-cycle-id'],
              poxAddress:
                result.data['pox-addr'] != null
                  ? poxAddressToBtcAddress(
                      parseInt(result.data['pox-addr'].version, 16),
                      Uint8Array.from(
                        Buffer.from(
                          result.data['pox-addr'].hashbytes.slice(2),
                          'hex'
                        )
                      ),
                      STACKS_NETWORK
                    )
                  : null,
            });
          } else if (result.name == 'revoke-delegate-stx') {
            events.push({
              name: result.name,
              stacker: result.stacker,
              startCycle: result.data['start-cycle-id'],
              endCycle: result.data['end-cycle-id'],
            });
          } else if (result.name == 'delegate-stack-stx') {
            events.push({
              name: result.name,
              stacker: result.data.stacker,
              amountUstx: result.data['lock-amount'],
              startCycle: result.data['start-cycle-id'],
              endCycle: result.data['end-cycle-id'],
              poxAddress:
                result.data['pox-addr'] != null
                  ? poxAddressToBtcAddress(
                      parseInt(result.data['pox-addr'].version, 16),
                      Uint8Array.from(
                        Buffer.from(
                          result.data['pox-addr'].hashbytes.slice(2),
                          'hex'
                        )
                      ),
                      STACKS_NETWORK
                    )
                  : null,
            });
          } else if (result.name == 'delegate-stack-extend') {
            events.push({
              name: result.name,
              stacker: result.data.stacker,
              startCycle: result.data['start-cycle-id'],
              endCycle: result.data['end-cycle-id'],
              poxAddress:
                result.data['pox-addr'] != null
                  ? poxAddressToBtcAddress(
                      parseInt(result.data['pox-addr'].version, 16),
                      Uint8Array.from(
                        Buffer.from(
                          result.data['pox-addr'].hashbytes.slice(2),
                          'hex'
                        )
                      ),
                      STACKS_NETWORK
                    )
                  : null,
            });
          } else if (result.name == 'delegate-stack-increase') {
            events.push({
              name: result.name,
              stacker: result.data.stacker,
              startCycle: result.data['start-cycle-id'],
              endCycle: result.data['end-cycle-id'],
              increaseBy: result.data['increase-by'],
              totalLocked: result.data['total-locked'],
              poxAddress:
                result.data['pox-addr'] != null
                  ? poxAddressToBtcAddress(
                      parseInt(result.data['pox-addr'].version, 16),
                      Uint8Array.from(
                        Buffer.from(
                          result.data['pox-addr'].hashbytes.slice(2),
                          'hex'
                        )
                      ),
                      STACKS_NETWORK
                    )
                  : null,
            });
          } else if (
            result.name == 'stack-aggregation-commit-indexed' ||
            result.name == 'stack-aggregation-commit'
          ) {
            events.push({
              name: result.name,
              amountUstx: result.data['amount-ustx'],
              cycle: result.data['reward-cycle'],
              poxAddress:
                result.data['pox-addr'] != null
                  ? poxAddressToBtcAddress(
                      parseInt(result.data['pox-addr'].version, 16),
                      Uint8Array.from(
                        Buffer.from(
                          result.data['pox-addr'].hashbytes.slice(2),
                          'hex'
                        )
                      ),
                      STACKS_NETWORK
                    )
                  : null,
            });
          } else if (result.name == 'stack-aggregation-increase') {
            events.push({
              name: result.name,
              amountUstx: result.data['amount-ustx'],
              cycle: result.data['reward-cycle'],
              rewardCycleIndex: result.data['reward-cycle-index'],
              poxAddress:
                result.data['pox-addr'] != null
                  ? poxAddressToBtcAddress(
                      parseInt(result.data['pox-addr'].version, 16),
                      Uint8Array.from(
                        Buffer.from(
                          result.data['pox-addr'].hashbytes.slice(2),
                          'hex'
                        )
                      ),
                      STACKS_NETWORK
                    )
                  : null,
            });
          }
        }
      }
      offset += LIMIT;
    } else {
      moreData = false;
    }
  }

  return events;
};

export const parseEvents = async (events: any, rewardIndexesMap: any) => {
  const delegations = new Map();
  const acceptedDelegations = new Map();
  const committedDelegations = new Map();
  const previousDelegations = new Map();

  for (const event of events) {
    const {
      name,
      stacker,
      startCycle,
      endCycle,
      poxAddress,
      amountUstx,
      increaseBy,
      totalLocked,
      cycle,
    } = event;

    switch (name) {
      case 'delegate-stx':
        delegations.set(stacker, {
          startCycle,
          endCycle,
          poxAddress,
          amountUstx,
        });
        break;

      case 'revoke-delegate-stx':
        if (delegations.has(stacker)) {
          const delegation = delegations.get(stacker);
          if (!previousDelegations.has(stacker)) {
            previousDelegations.set(stacker, [delegation]);
          } else {
            const existingList = previousDelegations.get(stacker);
            existingList.push(delegation);
            previousDelegations.set(stacker, existingList);
          }
          delegations.delete(stacker);
        }
        break;

      case 'delegate-stack-stx':
        acceptedDelegations.set(stacker, [
          { startCycle, endCycle, poxAddress, amountUstx },
        ]);
        break;

      case 'delegate-stack-extend':
        if (acceptedDelegations.has(stacker)) {
          const existingList = acceptedDelegations.get(stacker);
          const lastEntry = existingList[existingList.length - 1];

          if (lastEntry.endCycle === startCycle) {
            lastEntry.endCycle = endCycle;
            acceptedDelegations.set(stacker, existingList);
          }
        }
        break;

      case 'delegate-stack-increase':
        if (acceptedDelegations.has(stacker)) {
          const existingList = acceptedDelegations.get(stacker);
          const lastEntry = existingList[existingList.length - 1];

          if (lastEntry.amountUstx + increaseBy === totalLocked) {
            if (
              lastEntry.startCycle === startCycle &&
              lastEntry.endCycle === endCycle
            ) {
              lastEntry.amountUstx += increaseBy;
            } else {
              const newEntry = {
                startCycle: startCycle,
                endCycle: lastEntry.endCycle,
                poxAddress: lastEntry.poxAddress,
                amountUstx: lastEntry.amountUstx + increaseBy,
              };

              lastEntry.endCycle = startCycle;
              existingList.push(newEntry);
            }
            acceptedDelegations.set(stacker, existingList);
          }
        }
        break;

      case 'stack-aggregation-commit':
      case 'stack-aggregation-commit-indexed':
        if (poxAddress) {
          const rewardIndex =
            name === 'stack-aggregation-commit'
              ? null
              : getRewardIndexForCycleAndAddress(
                  cycle,
                  poxAddress,
                  rewardIndexesMap
                );

          if (!committedDelegations.has(poxAddress)) {
            committedDelegations.set(poxAddress, [
              {
                startCycle: cycle,
                endCycle: cycle + 1,
                amountUstx,
                rewardIndex,
              },
            ]);
          } else {
            const existingList = committedDelegations.get(poxAddress);
            existingList.push({
              startCycle: cycle,
              endCycle: cycle + 1,
              amountUstx,
              rewardIndex,
            });
            committedDelegations.set(poxAddress, existingList);
          }
        }
        break;

      case 'stack-aggregation-increase':
        if (poxAddress) {
          const existingList = committedDelegations.get(poxAddress);
          if (existingList) {
            const entry = existingList.find((e: any) => e.startCycle === cycle);
            if (entry) {
              entry.amountUstx += amountUstx;
            }
          }
        }
        break;
    }
  }

  return {
    delegations,
    acceptedDelegations,
    committedDelegations,
    previousDelegations,
  };
};

const getRewardIndexForCycleAndAddress = (
  rewardCycle: number,
  poxAddress: string,
  rewardIndexesMap: Map<number, [{ rewardIndex: number; poxAddress: string }]>
) => {
  const rewardIndexesForCycle = rewardIndexesMap.get(rewardCycle);

  if (rewardIndexesForCycle) {
    for (const entry of rewardIndexesForCycle) {
      if (entry.poxAddress === poxAddress) {
        return entry.rewardIndex;
      }
    }
  }

  return null;
};

export const getRewardIndexesMap = async () => {
  const map = new Map();
  let rewardCycle = 84;
  let rewardIndex = 0;
  let continueFetching = true;

  while (continueFetching) {
    const rewardCycleIndexData = await fetchRewardCycleIndex(
      rewardCycle,
      rewardIndex
    );

    if (rewardCycleIndexData.value === null) {
      if (rewardIndex === 0) {
        continueFetching = false;
        break;
      } else {
        rewardIndex = 0;
        rewardCycle++;
        continue;
      }
    }

    if (!map.has(rewardCycle)) {
      map.set(rewardCycle, []);
    }

    const poxAddressCV = rewardCycleIndexData.value.value['pox-addr'].value;
    const poxAddress = poxAddressToBtcAddress(
      parseInt(poxAddressCV.version.value, 16),
      Uint8Array.from(
        Buffer.from(poxAddressCV.hashbytes.value.slice(2), 'hex')
      ),
      STACKS_NETWORK
    );

    const rewardIndexData = {
      rewardIndex,
      poxAddress,
    };

    map.get(rewardCycle).push(rewardIndexData);

    rewardIndex++;
  }

  return map;
};

export const createTables = async () => {
  await query(createDelegationsTable);
  await query(createAcceptedDelegationsTable);
  await query(createCommittedDelegationsTable);
  await query(createPreviousDelegationsTable);
};
